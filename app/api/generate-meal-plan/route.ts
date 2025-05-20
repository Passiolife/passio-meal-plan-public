export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPassioToken } from "@/services/passio-auth";
import { MealPlanInput } from "@/types/meal_plan_input";
// Use built-in fetch but with proper timeout handling
import https from "https";

// Passio API endpoint for meal plan generation
const PASSIO_API_URL =
    "https://api.passiolife.com/v2/products/sdk/tools/generateMealPlan";
// "https://api.passiolife.com/v2/products/sdk/tools/mealPlanTemplateGen?model=gemini-2-5-flash";

// Increased timeout (10 minutes = 600000ms)
const FETCH_TIMEOUT = 600000;

// Create an HTTPS agent with proper keepalive and timeout settings
const agent = new https.Agent({
    keepAlive: true,
    timeout: FETCH_TIMEOUT,
});

export async function POST(request: Request) {
    try {
        // Parse request body
        const requestBody = await request.json();
        console.log("🚀 Received meal plan input:", requestBody);

        // Get Passio token
        const { accessToken } = await getPassioToken();

        if (!accessToken) {
            throw new Error("Failed to get valid access token");
        }

        // Determine which type of request this is
        let prompt: string;

        // Check if this is a request from the preview
        if (
            requestBody.formData &&
            requestBody.content &&
            requestBody.previewData
        ) {
            // Use the content string that was provided directly
            prompt = requestBody.content;

            // Add information about approved recipes if available
            if (
                requestBody.approvedRecipes &&
                Array.isArray(requestBody.approvedRecipes)
            ) {
                prompt +=
                    "\n\nPlease use these approved meal ideas in the full plan:";

                requestBody.approvedRecipes.forEach(
                    (dayRecipes: any, index: number) => {
                        prompt += `\n\nDay ${index + 1}:`;

                        // Add breakfast recipes
                        if (
                            dayRecipes.breakfast &&
                            dayRecipes.breakfast.length > 0
                        ) {
                            prompt += `\nBreakfast: ${dayRecipes.breakfast.join(
                                ", "
                            )}`;
                        }

                        // Add lunch recipes
                        if (dayRecipes.lunch && dayRecipes.lunch.length > 0) {
                            prompt += `\nLunch: ${dayRecipes.lunch.join(", ")}`;
                        }

                        // Add dinner recipes
                        if (dayRecipes.dinner && dayRecipes.dinner.length > 0) {
                            prompt += `\nDinner: ${dayRecipes.dinner.join(
                                ", "
                            )}`;
                        }

                        // Add snack recipes
                        if (dayRecipes.snack && dayRecipes.snack.length > 0) {
                            prompt += `\nSnack: ${dayRecipes.snack.join(", ")}`;
                        }
                    }
                );
            }
        }
        // Handle regular meal plan input
        else if (requestBody.clientName !== undefined) {
            // This is a regular MealPlanInput
            prompt = createPromptFromInput(requestBody);
        }
        // Handle legacy format or unknown format
        else {
            // Fall back to using content directly if available
            if (typeof requestBody.content === "string") {
                prompt = requestBody.content;
            } else {
                // Last resort fallback
                prompt = "Generate a balanced meal plan";
            }
        }

        // Create the request payload
        const requestPayload = {
            content: prompt,
        };

        console.log(
            "📤 Sending request to Passio API:",
            JSON.stringify(requestPayload, null, 2)
        );

        // Create AbortController for timeout
        const controller = new AbortController();
        // Set a longer timeout than needed to ensure it's not the bottleneck
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            // Use fetch with custom HTTPS agent for long-running connection
            const response = await fetch(PASSIO_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestPayload),
                signal: controller.signal,
                // @ts-expect-error - TS doesn't know about the agent property but it exists in Node.js environments
                agent: agent,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    "❌ Passio API error:",
                    response.status,
                    errorText
                );
                throw new Error(`Passio API error: ${response.status}`);
            }

            // Parse the response and return it directly
            const passioData = await response.json();

            // Log the full response structure to help adapt the frontend
            console.log(
                "✅ Passio API response structure:",
                JSON.stringify(passioData, null, 2)
            );

            // Return the raw Passio response
            return NextResponse.json(passioData);
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error) {
        console.error("💥 Meal plan generation error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate meal plan",
                details: error instanceof Error ? error.message : String(error),
                cause:
                    error instanceof Error && error.cause
                        ? String(error.cause)
                        : undefined,
            },
            { status: 500 }
        );
    }
}

// Helper function to create a prompt from the meal plan input
function createPromptFromInput(input: MealPlanInput): string {
    // Ensure defaults for optional arrays
    const dietaryRestrictions = input.dietaryRestrictions || [];
    const allergies = input.allergies || [];
    const goals = input.goals || [];
    const preferenceNotes = input.preferenceNotes || [];

    // Build the prompt
    let prompt = `Generate a ${input.numberOfDays}-day meal plan`;

    if (input.clientName) {
        prompt += ` for ${input.clientName}`;
    }

    if (dietaryRestrictions.length > 0) {
        prompt += ` with ${dietaryRestrictions.join(
            ", "
        )} dietary restrictions`;
    }

    if (allergies.length > 0) {
        prompt += `. Allergies: ${allergies.join(", ")}`;
    }

    if (goals.length > 0) {
        prompt += `. Goals: ${goals.join(", ")}`;
    }

    if (preferenceNotes.length > 0) {
        prompt += `. Preferences: ${preferenceNotes.join(", ")}`;
    }

    if (input.macroRequirements) {
        const { calories, protein, carbs, fat } = input.macroRequirements;
        prompt += `. Target macros: ${calories}cal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat`;
    }

    return prompt;
}
