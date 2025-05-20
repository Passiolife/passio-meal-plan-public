"use client";

import { useState } from "react";
import {
    MealPlanInput,
    PhysicalStats,
    Macros,
    DayOfWeek,
} from "@/types/meal_plan_input";
import { Card, CardContent } from "@/components/ui/card";

// Add this constant at the top of the file for consistent input styling
const inputClassName =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export const initialFormState: MealPlanInput = {
    numberOfDays: 1,
    clientName: "Dave",
    physicalStats: {
        currentWeight: 85,
        targetWeight: 80,
        height: 180,
        activityLevel: "moderate",
        age: 35,
        sex: "male",
    },
    targetDay: "monday",
    previousMealPlans: [],
    dietaryRestrictions: [],
    allergies: [],
    healthConditions: [],
    goals: [],
    preferenceNotes: [],
    macroRequirements: {
        calories: 2300,
        protein: 140,
        fiber: 25,
        carbs: 120,
        fat: 134,
    },
};

// Add state for raw text inputs
export interface RawTextInputs {
    dietaryRestrictions: string;
    allergies: string;
    healthConditions: string;
    goals: string;
    preferenceNotes: string;
}

export const initialRawInputs: RawTextInputs = {
    dietaryRestrictions: "",
    allergies: "",
    healthConditions: "",
    goals: "",
    preferenceNotes: "",
};

export default function ClientPreferencesForm({
    onSubmit,
    buttonText = "Generate Meal Plan",
    formData,
    rawInputs,
    onFormDataChange,
    onRawInputsChange,
    isLoading = false,
}: {
    onSubmit: (preferences: MealPlanInput) => void;
    buttonText?: string;
    formData?: MealPlanInput;
    rawInputs?: RawTextInputs;
    onFormDataChange?: (formData: MealPlanInput) => void;
    onRawInputsChange?: (rawInputs: RawTextInputs) => void;
    isLoading?: boolean;
}) {
    // Use local state if no props are provided (for backward compatibility)
    const [localFormData, setLocalFormData] =
        useState<MealPlanInput>(initialFormState);
    const [localRawInputs, setLocalRawInputs] =
        useState<RawTextInputs>(initialRawInputs);

    // Determine if we're using controlled or uncontrolled mode
    const isControlled =
        formData !== undefined && onFormDataChange !== undefined;

    // Use the appropriate state/setter combinations
    const currentFormData = isControlled ? formData : localFormData;
    const currentRawInputs =
        isControlled && rawInputs !== undefined ? rawInputs : localRawInputs;

    const updateFormData = (
        updater: (prev: MealPlanInput) => MealPlanInput
    ) => {
        if (isControlled && onFormDataChange) {
            onFormDataChange(updater(currentFormData));
        } else {
            setLocalFormData(updater);
        }
    };

    const updateRawInputs = (
        updater: (prev: RawTextInputs) => RawTextInputs
    ) => {
        if (isControlled && onRawInputsChange && rawInputs !== undefined) {
            onRawInputsChange(updater(currentRawInputs));
        } else {
            setLocalRawInputs(updater);
        }
    };

    const handlePhysicalStatsChange = (
        field: keyof PhysicalStats,
        value: string | number
    ) => {
        updateFormData((prev) => ({
            ...prev,
            physicalStats: {
                ...prev.physicalStats,
                [field]: value,
            },
        }));
    };

    const handleMacroChange = (
        type: "macroRequirements",
        field: keyof Macros,
        value: number
    ) => {
        updateFormData((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    };

    const handleTextAreaChange = (
        field: keyof RawTextInputs,
        value: string
    ) => {
        updateRawInputs((prev) => ({ ...prev, [field]: value }));
        updateFormData((prev) => ({
            ...prev,
            [field]: value
                ? value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                : [],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(currentFormData);
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label
                            htmlFor="clientName"
                            className="block text-sm font-medium"
                        >
                            Client Name
                        </label>
                        <input
                            type="text"
                            id="clientName"
                            className={inputClassName}
                            value={currentFormData.clientName}
                            onChange={(e) =>
                                updateFormData((prev) => ({
                                    ...prev,
                                    clientName: e.target.value,
                                }))
                            }
                        />
                    </div>

                    {/* Physical Stats */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium">
                            Physical Stats
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm">
                                    Current Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    value={
                                        currentFormData.physicalStats
                                            .currentWeight || ""
                                    }
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "currentWeight",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm">
                                    Target Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    value={
                                        currentFormData.physicalStats
                                            .targetWeight || ""
                                    }
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "targetWeight",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    value={
                                        currentFormData.physicalStats.height ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "height",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Age</label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    value={
                                        currentFormData.physicalStats.age || ""
                                    }
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "age",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm">
                                    Activity Level
                                </label>
                                <select
                                    className={inputClassName}
                                    value={
                                        currentFormData.physicalStats
                                            .activityLevel
                                    }
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "activityLevel",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="sedentary">Sedentary</option>
                                    <option value="light">Light</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="very_active">
                                        Very Active
                                    </option>
                                    <option value="extra_active">
                                        Extra Active
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm">Sex</label>
                                <select
                                    className={inputClassName}
                                    value={currentFormData.physicalStats.sex}
                                    onChange={(e) =>
                                        handlePhysicalStatsChange(
                                            "sex",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* Restrictions and Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">
                                Dietary Restrictions
                            </label>
                            <textarea
                                className={inputClassName}
                                value={currentRawInputs.dietaryRestrictions}
                                onChange={(e) =>
                                    handleTextAreaChange(
                                        "dietaryRestrictions",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter comma-separated restrictions"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Allergies</label>
                            <textarea
                                className={inputClassName}
                                value={currentRawInputs.allergies}
                                onChange={(e) =>
                                    handleTextAreaChange(
                                        "allergies",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter comma-separated allergies"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">
                                Health Conditions
                            </label>
                            <textarea
                                className={inputClassName}
                                value={currentRawInputs.healthConditions}
                                onChange={(e) =>
                                    handleTextAreaChange(
                                        "healthConditions",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter comma-separated health conditions"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Goals</label>
                            <textarea
                                className={inputClassName}
                                value={currentRawInputs.goals}
                                onChange={(e) =>
                                    handleTextAreaChange(
                                        "goals",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter comma-separated goals"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">
                                Preference Notes
                            </label>
                            <textarea
                                className={inputClassName}
                                value={currentRawInputs.preferenceNotes}
                                onChange={(e) =>
                                    handleTextAreaChange(
                                        "preferenceNotes",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter comma-separated preference notes"
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Target Day</label>
                            <select
                                className={inputClassName}
                                value={currentFormData.targetDay}
                                onChange={(e) =>
                                    updateFormData((prev) => ({
                                        ...prev,
                                        targetDay: e.target.value as DayOfWeek,
                                    }))
                                }
                            >
                                <option value="monday">Monday</option>
                                <option value="tuesday">Tuesday</option>
                                <option value="wednesday">Wednesday</option>
                                <option value="thursday">Thursday</option>
                                <option value="friday">Friday</option>
                                <option value="saturday">Saturday</option>
                                <option value="sunday">Sunday</option>
                            </select>
                        </div>
                    </div>

                    {/* Macro Requirements */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium">
                            Daily Macro Requirements
                        </legend>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.keys(currentFormData.macroRequirements).map(
                                (macro) => (
                                    <div key={macro}>
                                        <label className="block text-sm">
                                            {macro.charAt(0).toUpperCase() +
                                                macro.slice(1)}{" "}
                                            (g)
                                        </label>
                                        <input
                                            type="number"
                                            className={inputClassName}
                                            value={
                                                currentFormData
                                                    .macroRequirements[
                                                    macro as keyof Macros
                                                ]
                                            }
                                            onChange={(e) =>
                                                handleMacroChange(
                                                    "macroRequirements",
                                                    macro as keyof Macros,
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </fieldset>

                    <div className="w-full">
                        <label className="block text-sm font-medium">
                            Number of Days
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="7"
                            className={inputClassName}
                            value={currentFormData.numberOfDays}
                            onChange={(e) =>
                                updateFormData((prev) => ({
                                    ...prev,
                                    numberOfDays: Math.max(
                                        1,
                                        Math.min(7, Number(e.target.value))
                                    ),
                                }))
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md transition-colors ${
                            isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-600"
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            buttonText
                        )}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
