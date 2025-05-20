// app/page.tsx
"use client";

import { SingleDayMealPlan } from "@/components/SingleDayMealPlan";
import ClientPreferencesForm, {
    initialFormState,
    initialRawInputs,
    RawTextInputs,
} from "@/components/ClientPreferencesForm";
import MealPlanPreviewEnhanced from "@/components/MealPlanPreviewEnhanced";
import { DayMealPlan } from "@/types/meal_plan_output";
import { MealPlanInput } from "@/types/meal_plan_input";
import { Macros } from "@/types/meal_plan_input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the types for the meal plan preview response
interface MealPreviewRecipe {
    name: string;
    rejected: boolean;
}

interface MealPreview {
    recipes: MealPreviewRecipe[];
}

interface DayMealPreview {
    breakfast: MealPreview;
    lunch: MealPreview;
    dinner: MealPreview;
    snack?: MealPreview;
}

interface MealPlanPreviewResponse {
    constraints: {
        constraints: {
            activityLevel: string;
            dietStyle: string;
            dislikes: string[];
            gender: string;
            healthGoals: string;
            height: string;
            preferences: string[];
            weight: string;
        };
        macros: {
            calories: number;
            protein: number;
            fiber: number;
            carbs: number;
            fat: number;
        };
    };
    mealPlanDays: DayMealPreview[];
}

// Helper function to clean macro values - omit values that are 0
const cleanMacros = (macros: Macros): Partial<Macros> => {
    const cleanedMacros: Partial<Macros> = {};
    Object.entries(macros).forEach(([key, value]) => {
        if (value !== 0) {
            cleanedMacros[key as keyof Macros] = value;
        }
    });
    return cleanedMacros;
};

export default function Home() {
    const [dayPlan, setDayPlan] = useState<DayMealPlan | null>(null);
    const [allDayPlans, setAllDayPlans] = useState<DayMealPlan[]>([]);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [mealPlanInputJson, setMealPlanInputJson] = useState<string>("");
    const [mealPlanOutputJson, setMealPlanOutputJson] = useState<string>("");
    const [requestError, setRequestError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("full-meal-plan");

    // Shared form state between tabs
    const [sharedFormData, setSharedFormData] =
        useState<MealPlanInput>(initialFormState);
    const [sharedRawInputs, setSharedRawInputs] =
        useState<RawTextInputs>(initialRawInputs);

    // Shared preview state
    const [previewData, setPreviewData] =
        useState<MealPlanPreviewResponse | null>(null);
    const [previewDayIndex, setPreviewDayIndex] = useState(0);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    useEffect(() => {
        console.log("🔍 COMPONENT STATE:", {
            dayPlan: dayPlan,
            allDayPlans: allDayPlans,
            currentDayIndex: currentDayIndex,
        });
    }, [dayPlan, allDayPlans, currentDayIndex]);

    const handlePreferencesSubmit = async (mealPlanInput: MealPlanInput) => {
        setIsLoading(true);
        setRequestError(null);

        // Create a copy of the input with cleaned macros
        const cleanedInput = {
            ...mealPlanInput,
            macroRequirements: cleanMacros(mealPlanInput.macroRequirements),
        };

        setMealPlanInputJson(JSON.stringify(cleanedInput, null, 2));

        try {
            // Create AbortController for frontend timeout (11 minutes to be slightly longer than backend)
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                11 * 60 * 1000
            );

            try {
                // Original meal plan generation call with timeout
                const mealPlanResponse = await fetch(
                    "/api/generate-meal-plan",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(cleanedInput),
                        signal: controller.signal,
                    }
                );

                if (!mealPlanResponse.ok)
                    throw new Error(
                        `Meal plan generation failed: ${mealPlanResponse.status}`
                    );

                const rawData = await mealPlanResponse.json();

                // Print the raw JSON
                console.log(
                    "🔥 RAW MEAL PLAN API RESPONSE:",
                    JSON.stringify(rawData, null, 2)
                );

                // Store the raw data in the output JSON
                setMealPlanOutputJson(JSON.stringify(rawData, null, 2));

                // Store all meal plan days and set the first day as current
                if (rawData.mealPlanDays && rawData.mealPlanDays.length > 0) {
                    setAllDayPlans(rawData.mealPlanDays);
                    setDayPlan(rawData.mealPlanDays[0]);
                    setCurrentDayIndex(0);
                } else {
                    console.error("No meal plan days found in the response");
                    setAllDayPlans([]);
                    setDayPlan(null);
                    setCurrentDayIndex(0);
                    setRequestError(
                        "Response did not contain any meal plan days."
                    );
                }
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setRequestError(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            );
            setAllDayPlans([]);
            setDayPlan(null);
            setCurrentDayIndex(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle preview generation
    const handlePreviewSubmit = async (mealPlanInput: MealPlanInput) => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
            // Clean the macro values
            const cleanedMacros = cleanMacros(mealPlanInput.macroRequirements);

            // Create a simplified content string from the input data with cleaned macros
            const contentString = `Generate a meal plan for a ${
                mealPlanInput.physicalStats.sex
            }, 
            ${mealPlanInput.physicalStats.age} years old, ${
                mealPlanInput.physicalStats.height
            }cm tall, 
            currently ${mealPlanInput.physicalStats.currentWeight}kg, with ${
                mealPlanInput.physicalStats.activityLevel
            } activity level.
            Dietary restrictions: ${mealPlanInput.dietaryRestrictions.join(
                ", "
            )}.
            Allergies: ${mealPlanInput.allergies.join(", ")}.
            Health conditions: ${mealPlanInput.healthConditions.join(", ")}.
            Goals: ${mealPlanInput.goals.join(", ")}.
            Preferences: ${mealPlanInput.preferenceNotes.join(", ")}.
            Macros: ${Object.entries(cleanedMacros)
                .map(
                    ([key, value]) =>
                        `${
                            key === "calories"
                                ? `${value} calories`
                                : `${value}g ${key}`
                        }`
                )
                .join(", ")}.
            Number of days: ${mealPlanInput.numberOfDays}.`;

            const requestBody = {
                content: contentString,
                dietaryRestrictions: mealPlanInput.dietaryRestrictions,
            };

            // Send request to the preview API
            const response = await fetch("/api/generate-meal-plan-preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to generate meal plan preview: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Meal plan preview data:", data);
            setPreviewData(data);
            setPreviewDayIndex(0);
        } catch (error) {
            console.error("Error generating meal plan preview:", error);
            setPreviewError(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    // Function to handle preview regeneration with rejected meals
    const handlePreviewRegenerate = async () => {
        if (!previewData || !sharedFormData) return;

        setPreviewLoading(true);
        setPreviewError(null);

        try {
            // Create a deep copy of the preview data
            const previewDataCopy = JSON.parse(
                JSON.stringify(previewData)
            ) as MealPlanPreviewResponse;

            // Create a new object without the constraints property
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { constraints, ...previewDataWithoutConstraints } =
                previewDataCopy;

            // Clean the macro values
            const cleanedMacros = cleanMacros(sharedFormData.macroRequirements);

            // Create a content string from the current form data
            const contentString = `Generate a meal plan for a ${
                sharedFormData.physicalStats.sex
            }, 
            ${sharedFormData.physicalStats.age} years old, ${
                sharedFormData.physicalStats.height
            }cm tall, 
            currently ${sharedFormData.physicalStats.currentWeight}kg, with ${
                sharedFormData.physicalStats.activityLevel
            } activity level.
            Dietary restrictions: ${sharedFormData.dietaryRestrictions.join(
                ", "
            )}.
            Allergies: ${sharedFormData.allergies.join(", ")}.
            Health conditions: ${sharedFormData.healthConditions.join(", ")}.
            Goals: ${sharedFormData.goals.join(", ")}.
            Preferences: ${sharedFormData.preferenceNotes.join(", ")}.
            Macros: ${Object.entries(cleanedMacros)
                .map(
                    ([key, value]) =>
                        `${
                            key === "calories"
                                ? `${value} calories`
                                : `${value}g ${key}`
                        }`
                )
                .join(", ")}.
            Number of days: ${sharedFormData.numberOfDays}.`;

            // Create the combined request payload
            const requestPayload = {
                // Include current form data as a string
                formData: JSON.stringify(sharedFormData),
                // Include content string derived from form data
                content: contentString,
                // Include the preview data (without constraints) with rejected flags
                previewData: JSON.stringify(previewDataWithoutConstraints),
                // Include dietary restrictions array for additional context
                dietaryRestrictions: sharedFormData.dietaryRestrictions,
            };

            // Send request to the preview API
            const response = await fetch("/api/generate-meal-plan-preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to regenerate meal plan preview: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Regenerated meal plan preview data:", data);
            setPreviewData(data);
            setPreviewDayIndex(0);
        } catch (error) {
            console.error("Error regenerating meal plan preview:", error);
            setPreviewError(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    // Handle recipe rejection
    const handleRecipeRejection = (
        dayIndex: number,
        mealType: "breakfast" | "lunch" | "dinner" | "snack",
        recipeIndex: number
    ) => {
        if (!previewData) return;

        setPreviewData((prevData) => {
            if (!prevData) return prevData;

            // Create a deep copy of the data
            const newData = JSON.parse(
                JSON.stringify(prevData)
            ) as MealPlanPreviewResponse;

            // Toggle the rejected flag
            const recipe =
                newData.mealPlanDays[dayIndex][mealType]?.recipes[recipeIndex];
            if (recipe) {
                recipe.rejected = !recipe.rejected;
            }

            return newData;
        });
    };

    const handleGenerateFullPlanFromPreview = async (
        previewData: MealPlanPreviewResponse
    ) => {
        setIsLoading(true);
        setRequestError(null);

        // Extract recipe names from preview data to send to full meal plan generator
        const recipesContent = previewData.mealPlanDays.map((day, dayIndex) => {
            const meals: Record<string, string[]> = {};

            // Only include non-rejected recipes
            ["breakfast", "lunch", "dinner", "snack"].forEach((mealType) => {
                const meal = day[mealType as keyof DayMealPreview];
                if (meal) {
                    meals[mealType] = meal.recipes
                        .filter((recipe) => !recipe.rejected)
                        .map((recipe) => recipe.name);
                }
            });

            return {
                dayIndex: dayIndex + 1,
                ...meals,
            };
        });

        // Clean the macro values
        const cleanedMacros = cleanMacros(sharedFormData.macroRequirements);

        // Create a proper content string with form data
        const contentString = `Generate a ${
            sharedFormData.numberOfDays
        }-day meal plan for a ${sharedFormData.physicalStats.sex}, ${
            sharedFormData.physicalStats.age
        } years old, ${sharedFormData.physicalStats.height}cm tall, currently ${
            sharedFormData.physicalStats.currentWeight
        }kg, with ${sharedFormData.physicalStats.activityLevel} activity level. 
        Dietary restrictions: ${sharedFormData.dietaryRestrictions.join(", ")}.
        Allergies: ${sharedFormData.allergies.join(", ")}.
        Health conditions: ${sharedFormData.healthConditions.join(", ")}.
        Goals: ${sharedFormData.goals.join(", ")}.
        Preferences: ${sharedFormData.preferenceNotes.join(", ")}.
        Macros: ${Object.entries(cleanedMacros)
            .map(
                ([key, value]) =>
                    `${
                        key === "calories"
                            ? `${value} calories`
                            : `${value}g ${key}`
                    }`
            )
            .join(", ")}.`;

        // Create the request body with the preview data and form data
        const requestBody = {
            // Include the original form data
            formData: sharedFormData,
            // Include a properly formatted content string
            content: contentString,
            // Include the preview data with approved recipes
            previewData: JSON.stringify(previewData),
            approvedRecipes: recipesContent,
        };

        try {
            // Create AbortController for frontend timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                11 * 60 * 1000
            );

            try {
                // Call the generate-meal-plan endpoint with the preview data
                const mealPlanResponse = await fetch(
                    "/api/generate-meal-plan",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody),
                        signal: controller.signal,
                    }
                );

                if (!mealPlanResponse.ok)
                    throw new Error(
                        `Meal plan generation failed: ${mealPlanResponse.status}`
                    );

                const rawData = await mealPlanResponse.json();

                // Print the raw JSON
                console.log(
                    "🔥 RAW MEAL PLAN API RESPONSE FROM PREVIEW:",
                    JSON.stringify(rawData, null, 2)
                );

                // Store the raw data in the output JSON
                setMealPlanOutputJson(JSON.stringify(rawData, null, 2));

                // Store all meal plan days and set the first day as current
                if (rawData.mealPlanDays && rawData.mealPlanDays.length > 0) {
                    setAllDayPlans(rawData.mealPlanDays);
                    setDayPlan(rawData.mealPlanDays[0]);
                    setCurrentDayIndex(0);
                } else {
                    console.error("No meal plan days found in the response");
                    setAllDayPlans([]);
                    setDayPlan(null);
                    setCurrentDayIndex(0);
                    setRequestError(
                        "Response did not contain any meal plan days."
                    );
                }
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setRequestError(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            );
            setAllDayPlans([]);
            setDayPlan(null);
            setCurrentDayIndex(0);
        } finally {
            setIsLoading(false);
        }
    };

    const updateMealPlanFromJson = (jsonString: string) => {
        try {
            setMealPlanOutputJson(jsonString);
            const rawData = JSON.parse(jsonString);

            if (rawData.mealPlanDays && rawData.mealPlanDays.length > 0) {
                setAllDayPlans(rawData.mealPlanDays);
                setDayPlan(rawData.mealPlanDays[0]);
                setCurrentDayIndex(0);
                setRequestError(null);
            } else {
                console.error("No meal plan days found in the provided JSON");
                setRequestError(
                    "The provided JSON does not contain any meal plan days."
                );
            }
        } catch (error) {
            console.error("❌ Error parsing JSON:", error);
            setRequestError(
                error instanceof Error
                    ? `Invalid JSON: ${error.message}`
                    : "Invalid JSON format"
            );
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMealPlanOutputJson(e.target.value);
    };

    const goToNextDay = () => {
        if (currentDayIndex < allDayPlans.length - 1) {
            const nextIndex = currentDayIndex + 1;
            setCurrentDayIndex(nextIndex);
            setDayPlan(allDayPlans[nextIndex]);
        }
    };

    const goToPreviousDay = () => {
        if (currentDayIndex > 0) {
            const prevIndex = currentDayIndex - 1;
            setCurrentDayIndex(prevIndex);
            setDayPlan(allDayPlans[prevIndex]);
        }
    };

    const goToDay = (dayIndex: number) => {
        if (dayIndex >= 0 && dayIndex < allDayPlans.length) {
            setCurrentDayIndex(dayIndex);
            setDayPlan(allDayPlans[dayIndex]);
        }
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Navigation methods for preview data
    const goToPreviewDay = (dayIndex: number) => {
        if (
            previewData &&
            dayIndex >= 0 &&
            dayIndex < previewData.mealPlanDays.length
        ) {
            setPreviewDayIndex(dayIndex);
        }
    };

    return (
        <main className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-6">
                    <TabsTrigger value="full-meal-plan">
                        Full Meal Plan
                    </TabsTrigger>
                    <TabsTrigger value="preview">Meal Plan Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="full-meal-plan">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/2">
                            <div className="border rounded-lg p-4">
                                <h2 className="text-xl font-bold mb-4">
                                    Client Preferences
                                </h2>
                                <ClientPreferencesForm
                                    onSubmit={handlePreferencesSubmit}
                                    formData={sharedFormData}
                                    rawInputs={sharedRawInputs}
                                    onFormDataChange={setSharedFormData}
                                    onRawInputsChange={setSharedRawInputs}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="border rounded-lg p-4">
                                <h2 className="text-xl font-bold mb-4">
                                    Meal Plan
                                </h2>
                                {isLoading ? (
                                    <div className="p-8 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                                            <div className="text-lg font-medium">
                                                Generating meal plan...
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                This may take up to 5 minutes
                                            </div>
                                        </div>
                                    </div>
                                ) : requestError ? (
                                    <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">
                                        <div className="font-semibold">
                                            Error:
                                        </div>
                                        <div>{requestError}</div>
                                    </div>
                                ) : dayPlan ? (
                                    <>
                                        {allDayPlans.length > 1 && (
                                            <div className="flex items-center justify-between mb-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={goToPreviousDay}
                                                    disabled={
                                                        currentDayIndex === 0
                                                    }
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />{" "}
                                                    Previous
                                                </Button>
                                                <div className="flex space-x-1">
                                                    {allDayPlans.map(
                                                        (_, index) => (
                                                            <Button
                                                                key={index}
                                                                variant={
                                                                    currentDayIndex ===
                                                                    index
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                className="w-8 h-8 p-0"
                                                                onClick={() =>
                                                                    goToDay(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                {index + 1}
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={goToNextDay}
                                                    disabled={
                                                        currentDayIndex ===
                                                        allDayPlans.length - 1
                                                    }
                                                >
                                                    Next{" "}
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        )}
                                        <SingleDayMealPlan
                                            dayPlan={dayPlan}
                                            dayNumber={currentDayIndex + 1}
                                            totalDays={allDayPlans.length}
                                        />
                                    </>
                                ) : (
                                    <div>No meal plan generated yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Debug JSON Cards */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-bold mb-2">
                                Meal Plan Input JSON
                            </h3>
                            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
                                {mealPlanInputJson || "No data yet"}
                            </pre>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-bold mb-2">
                                Meal Plan Output JSON
                            </h3>
                            <div className="flex flex-col space-y-2">
                                <textarea
                                    className="bg-gray-100 p-2 rounded overflow-auto min-h-[15rem] text-xs font-mono"
                                    value={mealPlanOutputJson || ""}
                                    onChange={handleJsonChange}
                                    placeholder="Paste meal plan JSON here..."
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        updateMealPlanFromJson(
                                            mealPlanOutputJson
                                        )
                                    }
                                >
                                    Update Meal Plan from JSON
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preview">
                    <MealPlanPreviewEnhanced
                        onGenerateFullPlan={handleGenerateFullPlanFromPreview}
                        onTabChange={handleTabChange}
                        formData={sharedFormData}
                        rawInputs={sharedRawInputs}
                        onFormDataChange={setSharedFormData}
                        onRawInputsChange={setSharedRawInputs}
                        // Pass the shared preview data
                        previewData={previewData}
                        currentDayIndex={previewDayIndex}
                        isLoading={previewLoading}
                        requestError={previewError}
                        // Pass handlers for preview operations
                        onSubmit={handlePreviewSubmit}
                        onRegenerate={handlePreviewRegenerate}
                        onRecipeRejection={handleRecipeRejection}
                        goToDay={goToPreviewDay}
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
