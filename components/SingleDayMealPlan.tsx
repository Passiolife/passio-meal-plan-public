// components/SingleDayMealPlan.tsx

import { useState } from "react";
import { DayMealPlan, Recipe, Macros } from "@/types/meal_plan_output";
import { RecipeCard } from "@/components/Recipe";
import { Card } from "@/components/ui/card";

export function SingleDayMealPlan({ dayPlan }: { dayPlan: DayMealPlan }) {
  // Add state to track the meal plan
  const [mealPlanState, setMealPlanState] = useState<DayMealPlan>({
    ...dayPlan,
    macros: {
      calories: Math.round(dayPlan.macros.calories),
      protein: Math.round(dayPlan.macros.protein),
      carbs: Math.round(dayPlan.macros.carbs),
      fat: Math.round(dayPlan.macros.fat),
      fiber: Math.round(dayPlan.macros.fiber),
      sugar: Math.round(dayPlan.macros.sugar || 0)
    }
  });
  const [dailyMacros, setDailyMacros] = useState<Macros>({
    calories: Math.round(dayPlan.macros.calories),
    protein: Math.round(dayPlan.macros.protein),
    carbs: Math.round(dayPlan.macros.carbs),
    fat: Math.round(dayPlan.macros.fat),
    fiber: Math.round(dayPlan.macros.fiber),
    sugar: Math.round(dayPlan.macros.sugar || 0)
  });
  
  console.log("🔍 Debugging dayPlan:", mealPlanState);
  console.log("📝 Macros:", dailyMacros);
  
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  // Function to handle recipe updates
  const handleRecipeUpdate = (updatedRecipe: Recipe, mealType: typeof mealTypes[number], recipeIndex: number) => {
    // Create a copy of the current meal plan
    const updatedMealPlan = { ...mealPlanState };
    
    // Update the specific recipe
    if (updatedMealPlan[mealType] && updatedMealPlan[mealType].recipes) {
      updatedMealPlan[mealType].recipes[recipeIndex] = updatedRecipe;
      
      // Update state
      setMealPlanState(updatedMealPlan);
      
      // Recalculate daily totals
      const newDailyMacros = calculateDailyMacros(updatedMealPlan);
      setDailyMacros(newDailyMacros);
    }
  };
  
  // Function to calculate daily macros
  const calculateDailyMacros = (mealPlan: DayMealPlan): Macros => {
    const macros: Macros = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
    
    mealTypes.forEach(mealType => {
      if (mealPlan[mealType] && mealPlan[mealType].recipes) {
        mealPlan[mealType].recipes.forEach(recipe => {
          // Round each value before adding to avoid floating point issues
          macros.calories += Math.round(recipe.macros.calories);
          macros.protein += Math.round(recipe.macros.protein);
          macros.carbs += Math.round(recipe.macros.carbs);
          macros.fat += Math.round(recipe.macros.fat);
          macros.fiber += Math.round(recipe.macros.fiber);
          macros.sugar += Math.round(recipe.macros.sugar || 0);
        });
      }
    });
    
    // Round final values again to ensure clean integers
    return {
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein),
      carbs: Math.round(macros.carbs),
      fat: Math.round(macros.fat),
      fiber: Math.round(macros.fiber),
      sugar: Math.round(macros.sugar)
    };
  };

  return (
    <div className="space-y-6">
      {mealTypes.map(mealType => {
        // Skip meal types that don't exist in the data
        if (!mealPlanState[mealType]) return null;
        
        return (
          <div key={mealType} className="space-y-4">
            <h3 className="text-xl font-semibold capitalize">{mealType}</h3>
            <div className="grid grid-cols-1 gap-4">
              {mealPlanState[mealType]?.recipes?.map((recipe, idx) => (
                <RecipeCard 
                  key={idx} 
                  recipe={recipe}
                  onRecipeUpdate={(updatedRecipe) => 
                    handleRecipeUpdate(updatedRecipe, mealType, idx)
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      <Card className="p-4 bg-blue-600 text-white mt-8">
        <h3 className="font-semibold text-lg mb-2">Daily Totals</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{Math.round(dailyMacros.calories)}</div>
            <div className="text-xs text-blue-100">Calories</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(dailyMacros.protein)}g</div>
            <div className="text-xs text-blue-100">Protein</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(dailyMacros.carbs)}g</div>
            <div className="text-xs text-blue-100">Carbs</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(dailyMacros.fat)}g</div>
            <div className="text-xs text-blue-100">Fat</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
