export interface Macros {
  calories: number;
  protein: number;
  fiber: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface PhysicalStats {
  currentWeight: number;
  targetWeight: number;
  height: number;  // in cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  age: number;
  sex: 'male' | 'female';
}

export interface PreviousMealPlan {
  dayOfWeek: DayOfWeek;
  date: string;
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
  snack?: string[];
}

export interface MealPlanInput {
  numberOfDays: number;
  clientName: string;
  physicalStats: PhysicalStats;
  targetDay: DayOfWeek;
  previousMealPlans?: PreviousMealPlan[];
  dietaryRestrictions: string[];
  allergies: string[];
  healthConditions: string[];
  goals: string[];
  preferenceNotes: string[];
  macroRequirements: Macros;
}

export type SimpleMealPlanInput = {
  userPreferences: string;
  targetMacros: Macros;
  numberOfDays: number;
}