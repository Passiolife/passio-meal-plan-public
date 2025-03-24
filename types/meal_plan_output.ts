import { DayOfWeek } from './meal_plan_input';

// Basic macros structure
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Constraints from the meal plan
export interface MealPlanConstraints {
  allergies: string | string[];
  daily_calories_target?: number;
  daily_carbs_target?: number;
  daily_fat_target?: number;
  daily_protein_target?: number;
  goal?: string | string[];
  preferences?: string | string[];
  dietaryRestrictions?: string[];
}

// Ingredient structure from Passio API
export interface Ingredient {
  type: string;
  displayName: string;
  stemmedDisplayName: string;
  shortName: string;
  longName: string;
  scoredName: string;
  score: number;
  displayNameScore: number;
  brandName: string;
  iconId: string;
  labelId: string;
  synonymId: string;
  recipeId: string;
  referenceId: string;
  resultId: string;
  nutritionPreview: {
    portion: {
      weight: {
        unit: string;
        value: number;
      };
      name: string;
      quantity: number;
      suggestedQuantity?: number[];
    };
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    fiber: number;
  };
  refCode: string;
  tags: string[];
}

// Recipe structure
export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  preparation: string;
  macros: Macros;
}

// Meal structure (breakfast, lunch, dinner)
export interface Meal {
  recipes: Recipe[];
}

// Structure for a single day's meal plan
export interface DayMealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal; // Optional since it's not in the response
  macros: Macros;
}

// Shopping list item
export interface ShoppingListItem {
  name: string;
  portionQuantity: number;
  portionSize: string;
}

// Complete meal plan output structure
export interface MealPlanOutput {
  constraints: MealPlanConstraints;
  mealPlanDays: DayMealPlan[];
  shoppingList: ShoppingListItem[];
}

// For backward compatibility with existing code
export interface RecipeIngredient {
  ingredientName: string;
  portionQuantity: number;
  portionSize: string;
  suggestedQuantity?: number;
  weightGrams?: number;
  weightIsExplicit?: boolean;
  macros?: Macros;
}

// Legacy structure for compatibility
export interface LegacyMealPlanOutput {
  constraints: MealPlanConstraints;
  dayOfWeek: DayOfWeek;
  mealPlan: DayMealPlan;
} 