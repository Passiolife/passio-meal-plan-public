import { Card } from "@/components/ui/card";
import { Recipe, Ingredient, RecipeIngredient } from "@/types/meal_plan_output";
import { IngredientCard } from "@/components/IngredientCard";
import { ChefHatIcon } from "lucide-react";
import { useState } from "react";

// Helper function to convert Ingredient to RecipeIngredient
const convertToRecipeIngredient = (ing: Ingredient): RecipeIngredient => {
  // Get the first suggested quantity if available
  const suggestedQuantity = ing.nutritionPreview.portion.suggestedQuantity?.[0];
  
  return {
    ingredientName: ing.displayName,
    portionQuantity: ing.nutritionPreview.portion.quantity,
    portionSize: ing.nutritionPreview.portion.name,
    suggestedQuantity: suggestedQuantity,
    weightGrams: Math.round(ing.nutritionPreview.portion.weight.value * ing.nutritionPreview.portion.quantity),
    weightIsExplicit: true,
    macros: {
      calories: Math.round(ing.nutritionPreview.calories),
      protein: Math.round(ing.nutritionPreview.protein),
      carbs: Math.round(ing.nutritionPreview.carbs),
      fat: Math.round(ing.nutritionPreview.fat),
      fiber: Math.round(ing.nutritionPreview.fiber),
      sugar: 0
    }
  };
};

// Update the component props to include onRecipeUpdate
interface RecipeCardProps {
  recipe: Recipe;
  onRecipeUpdate?: (updatedRecipe: Recipe) => void;
}

export function RecipeCard({ recipe, onRecipeUpdate }: RecipeCardProps) {
  // Add state to track ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients);
  const [recipeMacros, setRecipeMacros] = useState(recipe.macros);

  // Function to handle ingredient updates
  const handleIngredientUpdate = (updatedIngredient: RecipeIngredient, index: number) => {
    // Create a copy of the current ingredients
    const updatedIngredients = [...ingredients];
    
    // Update the specific ingredient
    const originalIngredient = updatedIngredients[index];
    updatedIngredients[index] = {
      ...originalIngredient,
      nutritionPreview: {
        ...originalIngredient.nutritionPreview,
        portion: {
          ...originalIngredient.nutritionPreview.portion,
          quantity: updatedIngredient.portionQuantity,
          name: updatedIngredient.portionSize,
          suggestedQuantity: updatedIngredient.suggestedQuantity 
            ? [updatedIngredient.suggestedQuantity] 
            : originalIngredient.nutritionPreview.portion.suggestedQuantity,
        },
        calories: updatedIngredient.macros?.calories || 0,
        protein: updatedIngredient.macros?.protein || 0,
        carbs: updatedIngredient.macros?.carbs || 0,
        fat: updatedIngredient.macros?.fat || 0,
        fiber: updatedIngredient.macros?.fiber || 0,
      }
    };
    
    // Update state
    setIngredients(updatedIngredients);
    
    // Recalculate recipe macros
    const newMacros = calculateRecipeMacros(updatedIngredients);
    setRecipeMacros(newMacros);
    
    // Notify parent component if needed
    if (onRecipeUpdate) {
      onRecipeUpdate({
        ...recipe,
        ingredients: updatedIngredients,
        macros: newMacros
      });
    }
  };

  // Function to calculate recipe macros from ingredients
  const calculateRecipeMacros = (ingredientsList: Ingredient[]) => {
    const macros = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
    
    ingredientsList.forEach(ing => {
      // Round each value before adding to avoid floating point issues
      macros.calories += Math.round(ing.nutritionPreview.calories);
      macros.protein += Math.round(ing.nutritionPreview.protein);
      macros.carbs += Math.round(ing.nutritionPreview.carbs);
      macros.fat += Math.round(ing.nutritionPreview.fat);
      macros.fiber += Math.round(ing.nutritionPreview.fiber);
    });
    
    // Round final values again to ensure clean integers
    return {
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein),
      carbs: Math.round(macros.carbs),
      fat: Math.round(macros.fat),
      fiber: Math.round(macros.fiber),
      sugar: 0
    };
  };

  return (
    <Card className="p-5 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <ChefHatIcon className="w-7 h-7 text-blue-600" />
        <h3 className="text-xl font-semibold">{recipe.name}</h3>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md mb-5 text-sm">
        <div className="font-medium text-blue-800 mb-1">Macros:</div>
        <div className="flex justify-between text-blue-700">
          <span>Calories: {Math.round(recipeMacros.calories)}</span>
          <span>Protein: {Math.round(recipeMacros.protein)}g</span>
          <span>Carbs: {Math.round(recipeMacros.carbs)}g</span>
          <span>Fat: {Math.round(recipeMacros.fat)}g</span>
        </div>
      </div>
      
      <div className="mb-5">
        <h4 className="font-medium text-gray-700 mb-3">Ingredients:</h4>
        <div className="space-y-1.5">
          {ingredients.map((ing, idx) => (
            <IngredientCard 
              key={idx} 
              ingredient={convertToRecipeIngredient(ing)}
              iconId={ing.iconId}
              onUpdate={(updated) => handleIngredientUpdate(updated, idx)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Instructions:</h4>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{recipe.preparation}</p>
      </div>
    </Card>
  );
} 