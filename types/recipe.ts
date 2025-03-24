// Types for recipe-related data structures

export interface MacroNutrients {
  calories: number;
  protein: number;
  fiber: number;
  carbs: number;
  fat: number;
}

export interface RecipeIngredient {
  ingredientName: string;
  portionQuantity: number;
  portionSize: string;
  weightGrams: number;
  weightIsExplicit: boolean;
}

export interface Recipe {
  name: string;
  ingredients: RecipeIngredient[];
  preparation: string;
  macros: MacroNutrients;
}
