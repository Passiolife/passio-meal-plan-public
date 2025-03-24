import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RecipeIngredient } from "@/types/meal_plan_output";
import { PencilIcon, BeakerIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { IngredientAmountEditor } from "./IngredientAmountEditor";

// Icon CDN configuration
const ICON_BASE_URL = "https://storage.googleapis.com/passio-prod-env-public-cdn-data/label-icons";
const ICON_SIZES = {
  small: 90,
  medium: 180,
  large: 360
};

// Function to get icon URL
const getIconUrl = (iconId: string, size: number = ICON_SIZES.medium): string => {
  if (!iconId) return "";
  return `${ICON_BASE_URL}/${iconId}-${size}.jpg`;
};

interface IngredientCardProps {
  ingredient: RecipeIngredient;
  iconId?: string;
  onUpdate?: (updatedIngredient: RecipeIngredient) => void;
}

export function IngredientCard({ ingredient, iconId, onUpdate }: IngredientCardProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Ensure macros always have valid values
  const macros = ingredient.macros || {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
  };

  // Get icon URL if iconId is provided
  const iconUrl = iconId ? getIconUrl(iconId) : "";
  
  // Handle ingredient update
  const handleIngredientUpdate = (updatedIngredient: RecipeIngredient) => {
    if (onUpdate) {
      onUpdate(updatedIngredient);
    }
  };

  return (
    <>
      <Card className="flex items-center gap-2 p-2 rounded-lg bg-blue-600 text-white">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
          {iconUrl ? (
            <Image 
              src={iconUrl} 
              alt={ingredient.ingredientName} 
              width={40} 
              height={40}
              className="object-cover"
              onError={(e) => {
                // Fallback to BeakerIcon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-icon');
              }}
            />
          ) : (
            <BeakerIcon className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-semibold truncate">{ingredient.ingredientName}</h3>
          <p className="text-gray-200 text-xs">
            {ingredient.suggestedQuantity || ingredient.portionQuantity} {ingredient.portionSize} | {Math.round(macros.calories)} Cal | 
            P: {Math.round(macros.protein)}g | F: {Math.round(macros.fat)}g | C: {Math.round(macros.carbs)}g
          </p>
        </div>
        <button 
          className="rounded-full bg-white p-1"
          onClick={() => setIsEditorOpen(true)}
        >
          <PencilIcon className="w-4 h-4 text-blue-600" />
        </button>
      </Card>
      
      <IngredientAmountEditor
        ingredient={ingredient}
        iconId={iconId}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleIngredientUpdate}
      />
    </>
  );
}

