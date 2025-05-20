"use client";

import React from "react";
import { MealPlanInput } from "@/types/meal_plan_input";
import ClientPreferencesForm, {
    RawTextInputs,
} from "@/components/ClientPreferencesForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Utensils,
    ThumbsUp,
    AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define a simple Badge component since we don't have one
const Badge = ({
    children,
    variant,
    className = "",
}: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
}) => {
    const baseClass =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
    const variantClass =
        variant === "outline"
            ? "border-gray-300 text-gray-700"
            : "bg-blue-100 text-blue-800 border-blue-200";

    return (
        <span className={`${baseClass} ${variantClass} ${className}`}>
            {children}
        </span>
    );
};

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

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

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

interface MealPlanPreviewProps {
    onGenerateFullPlan: (previewData: MealPlanPreviewResponse) => void;
    onTabChange: (tab: string) => void;
    formData?: MealPlanInput;
    rawInputs?: RawTextInputs;
    onFormDataChange?: (formData: MealPlanInput) => void;
    onRawInputsChange?: (rawInputs: RawTextInputs) => void;

    // Shared preview state
    previewData: MealPlanPreviewResponse | null;
    setPreviewData?: React.Dispatch<
        React.SetStateAction<MealPlanPreviewResponse | null>
    >;
    currentDayIndex: number;
    setCurrentDayIndex?: React.Dispatch<React.SetStateAction<number>>;
    isLoading: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    requestError: string | null;
    setRequestError?: React.Dispatch<React.SetStateAction<string | null>>;

    // Preview operation handlers
    onSubmit: (mealPlanInput: MealPlanInput) => Promise<void>;
    onRegenerate: () => Promise<void>;
    onRecipeRejection: (
        dayIndex: number,
        mealType: MealType,
        recipeIndex: number
    ) => void;
    goToNextDay: () => void;
    goToPreviousDay: () => void;
    goToDay: (dayIndex: number) => void;
}

export default function MealPlanPreview({
    onGenerateFullPlan,
    onTabChange,
    formData,
    rawInputs,
    onFormDataChange,
    onRawInputsChange,
    previewData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPreviewData,
    currentDayIndex,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCurrentDayIndex,
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setIsLoading,
    requestError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setRequestError,
    onSubmit,
    onRegenerate,
    onRecipeRejection,
    goToNextDay,
    goToPreviousDay,
    goToDay,
}: MealPlanPreviewProps) {
    // Check if any meals are rejected
    const hasRejectedMeals = (): boolean => {
        if (!previewData) return false;

        return previewData.mealPlanDays.some((day) => {
            return (
                ["breakfast", "lunch", "dinner", "snack"] as MealType[]
            ).some((mealType) => {
                const meal = day[mealType];
                if (!meal) return false;
                return meal.recipes.some((recipe) => recipe.rejected);
            });
        });
    };

    // Handle generating full meal plan from preview
    const handleGenerateFullPlan = () => {
        if (!previewData) return;

        // Switch to full meal plan tab
        onTabChange("full-meal-plan");

        // Pass the preview data to the parent component
        onGenerateFullPlan(previewData);
    };

    // Count rejected and approved recipes
    const getRecipeCounts = () => {
        if (!previewData) return { total: 0, rejected: 0, approved: 0 };

        let total = 0;
        let rejected = 0;

        previewData.mealPlanDays.forEach((day) => {
            (["breakfast", "lunch", "dinner", "snack"] as MealType[]).forEach(
                (mealType) => {
                    const meal = day[mealType];
                    if (!meal) return;

                    meal.recipes.forEach((recipe) => {
                        total++;
                        if (recipe.rejected) rejected++;
                    });
                }
            );
        });

        return {
            total,
            rejected,
            approved: total - rejected,
        };
    };

    const { rejected, approved } = getRecipeCounts();
    const areAnyMealsRejected = hasRejectedMeals();
    const previewSteps = [
        "Fill out preferences",
        "Review meal ideas",
        "Generate full meal plan",
    ];
    const currentStep = !previewData ? 0 : areAnyMealsRejected ? 1 : 2;

    return (
        <div className="flex flex-col space-y-6">
            {/* Progress tracker */}
            <div className="w-full bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                    {previewSteps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center space-y-1 ${
                                index <= currentStep
                                    ? "text-blue-600"
                                    : "text-gray-400"
                            }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    index < currentStep
                                        ? "bg-blue-600 text-white"
                                        : index === currentStep
                                        ? "border-2 border-blue-600 text-blue-600"
                                        : "border-2 border-gray-300 text-gray-400"
                                }`}
                            >
                                {index + 1}
                            </div>
                            <div className="text-xs font-medium text-center">
                                {step}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{
                            width: `${
                                (currentStep / (previewSteps.length - 1)) * 100
                            }%`,
                        }}
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2">
                    <div className="border rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-2">Client Preferences</span>
                            {currentStep > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    Step 1
                                </Badge>
                            )}
                        </h2>
                        <ClientPreferencesForm
                            onSubmit={onSubmit}
                            buttonText="Generate Meal Plan Preview"
                            formData={formData}
                            rawInputs={rawInputs}
                            onFormDataChange={onFormDataChange}
                            onRawInputsChange={onRawInputsChange}
                        />
                    </div>
                </div>
                <div className="lg:w-1/2">
                    <div className="border rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="mr-2">Meal Plan Preview</span>
                                {currentStep > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        Step 2
                                    </Badge>
                                )}
                            </div>
                            {previewData && !isLoading && (
                                <div className="flex items-center text-sm space-x-4">
                                    <span className="text-green-600 flex items-center">
                                        <ThumbsUp className="h-4 w-4 mr-1" />{" "}
                                        {approved}
                                    </span>
                                    {rejected > 0 && (
                                        <span className="text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />{" "}
                                            {rejected}
                                        </span>
                                    )}
                                </div>
                            )}
                        </h2>
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                                    <div className="text-lg font-medium">
                                        Generating meal plan preview...
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        This may take a moment
                                    </div>
                                </div>
                            </div>
                        ) : requestError ? (
                            <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">
                                <div className="font-semibold">Error:</div>
                                <div>{requestError}</div>
                                <Button
                                    variant="outline"
                                    className="mt-4 w-full"
                                    onClick={() => onSubmit(formData!)}
                                    disabled={!formData}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : previewData &&
                          previewData.mealPlanDays[currentDayIndex] ? (
                            <div className="space-y-4">
                                {/* Day navigation */}
                                {previewData.mealPlanDays.length > 1 && (
                                    <div className="sticky top-0 bg-white z-10 pt-2">
                                        <Tabs
                                            value={currentDayIndex.toString()}
                                            onValueChange={(value) =>
                                                goToDay(parseInt(value))
                                            }
                                            className="w-full"
                                        >
                                            <TabsList className="w-full">
                                                {previewData.mealPlanDays.map(
                                                    (_, index) => (
                                                        <TabsTrigger
                                                            key={index}
                                                            value={index.toString()}
                                                            className="flex-1"
                                                        >
                                                            Day {index + 1}
                                                        </TabsTrigger>
                                                    )
                                                )}
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                )}

                                {/* Meal sections */}
                                <div className="space-y-6 mt-4">
                                    {(
                                        [
                                            "breakfast",
                                            "lunch",
                                            "dinner",
                                            "snack",
                                        ] as MealType[]
                                    ).map((mealType) => {
                                        const meal =
                                            previewData.mealPlanDays[
                                                currentDayIndex
                                            ][mealType];
                                        if (!meal) return null;

                                        return (
                                            <div
                                                key={mealType}
                                                className="space-y-2"
                                            >
                                                <h3 className="text-lg font-semibold capitalize flex items-center">
                                                    <span>{mealType}</span>
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        {
                                                            meal.recipes.filter(
                                                                (r) =>
                                                                    !r.rejected
                                                            ).length
                                                        }{" "}
                                                        approved
                                                    </span>
                                                </h3>
                                                <div className="space-y-2">
                                                    {meal.recipes.map(
                                                        (recipe, idx) => (
                                                            <Card
                                                                key={idx}
                                                                className={`overflow-hidden ${
                                                                    recipe.rejected
                                                                        ? "bg-gray-100 border-gray-200"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <CardContent className="p-0">
                                                                    <div className="flex items-center justify-between p-3">
                                                                        <div
                                                                            className={`${
                                                                                recipe.rejected
                                                                                    ? "line-through text-gray-500"
                                                                                    : "font-medium"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                recipe.name
                                                                            }
                                                                        </div>
                                                                        <Button
                                                                            variant={
                                                                                recipe.rejected
                                                                                    ? "ghost"
                                                                                    : "destructive"
                                                                            }
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                onRecipeRejection(
                                                                                    currentDayIndex,
                                                                                    mealType,
                                                                                    idx
                                                                                )
                                                                            }
                                                                            className="ml-2 h-8"
                                                                            disabled={
                                                                                isLoading
                                                                            }
                                                                        >
                                                                            {recipe.rejected
                                                                                ? "Restore"
                                                                                : "Reject"}
                                                                        </Button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-3 pt-4 mt-4 border-t">
                                    {areAnyMealsRejected && (
                                        <Button
                                            className="w-full"
                                            onClick={onRegenerate}
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Regenerate with {rejected} Rejected
                                            Meals
                                        </Button>
                                    )}

                                    <Button
                                        className="w-full"
                                        variant={
                                            areAnyMealsRejected
                                                ? "outline"
                                                : "default"
                                        }
                                        onClick={handleGenerateFullPlan}
                                        disabled={isLoading}
                                    >
                                        <Utensils className="h-4 w-4 mr-2" />
                                        Generate Full Meal Plan with {
                                            approved
                                        }{" "}
                                        Approved Meals
                                    </Button>

                                    {areAnyMealsRejected && (
                                        <div className="text-sm text-amber-600 text-center mt-1">
                                            You have {rejected} rejected meals.
                                            You can regenerate to get new
                                            suggestions or continue with your{" "}
                                            {approved} approved meals.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <div className="text-gray-400">
                                    <Utensils className="h-16 w-16 mx-auto mb-2" />
                                    <p className="text-lg">
                                        No meal plan preview generated yet.
                                    </p>
                                    <p className="text-sm mt-2">
                                        Fill out your preferences and click
                                        &quot;Generate Meal Plan Preview&quot;
                                        to get started.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
