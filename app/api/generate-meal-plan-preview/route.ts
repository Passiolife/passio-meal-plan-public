export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPassioToken } from "@/services/passio-auth";

// Updated Passio API endpoint for meal plan preview generation
const PASSIO_API_URL =
    "https://api.passiolife.com/v2/products/sdk/tools/generateMealPlanPreview";

// Increased timeout (10 minutes = 600000ms)
const FETCH_TIMEOUT = 600000;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Get Passio token using the same method as ingredient-extraction
        const { accessToken } = await getPassioToken();

        if (!accessToken) {
            throw new Error("Failed to get valid access token");
        }

        // Determine what type of request this is
        let requestPayload;

        // Handle the regeneration case (with form data and preview data)
        if (body.formData && body.previewData) {
            console.log(
                "📤 Processing regeneration request with form data and preview data"
            );

            // Parse the form data and preview data
            const formData = JSON.parse(body.formData);
            const previewData = JSON.parse(body.previewData);

            // Create a combined content string with both form data and preview data
            requestPayload = {
                // Use the provided content string from the frontend
                content: body.content,
                // Include the current form data
                formData: formData,
                // Include the preview data with rejected meals
                previewData: previewData,
                // Add any additional context
                dietaryRestrictions: body.dietaryRestrictions || [],
            };
        }
        // Handle the case where just preview content is provided
        else if (
            body.content &&
            typeof body.content === "string" &&
            body.content.startsWith("{")
        ) {
            console.log("📤 Processing request with JSON content");

            // Use the content directly if it's a JSON string
            requestPayload = {
                content: body.content,
            };
        }
        // Handle the initial request case
        else {
            console.log("📤 Processing initial request");

            // Use the content directly from the request if it exists
            // Otherwise, fall back to generating content from dietary restrictions
            requestPayload = body.content
                ? { content: body.content }
                : {
                      content: `generate a ${
                          body.dietaryRestrictions?.join(", ") || "balanced"
                      } meal plan`,
                  };
        }

        // Log request for debugging
        console.log(
            "📤 Sending request to Passio API:",
            JSON.stringify(requestPayload, null, 2)
        );

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            // Call Passio API with proper authorization and timeout
            const response = await fetch(PASSIO_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestPayload),
                signal: controller.signal,
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

            // Parse and return the response
            const data = await response.json();
            console.log("✅ Passio API response received");

            return NextResponse.json(data);
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error) {
        console.error("💥 Meal plan preview generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate meal plan preview" },
            { status: 500 }
        );
    }
}
