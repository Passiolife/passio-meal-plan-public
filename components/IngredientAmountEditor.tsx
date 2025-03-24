import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RecipeIngredient } from "@/types/meal_plan_output";
import Image from "next/image";
import { BeakerIcon } from "@heroicons/react/24/outline";

// Icon CDN configuration (same as in IngredientCard)
const ICON_BASE_URL = "https://storage.googleapis.com/passio-prod-env-public-cdn-data/label-icons";
const ICON_SIZES = {
  small: 90,
  medium: 180,
  large: 360
};

const getIconUrl = (iconId: string, size: number = ICON_SIZES.medium): string => {
  if (!iconId) return "";
  return `${ICON_BASE_URL}/${iconId}-${size}.jpg`;
};

// Common portion sizes for dropdown
const commonPortionSizes = [
  "g", "gram", "grams",
  "oz", "ounce", "ounces",
  "cup", "cups",
  "tbsp", "tablespoon", "tablespoons",
  "tsp", "teaspoon", "teaspoons",
  "slice", "slices",
  "piece", "pieces",
  "serving", "servings"
];

interface IngredientAmountEditorProps {
  ingredient: RecipeIngredient;
  iconId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedIngredient: RecipeIngredient) => void;
}

export function IngredientAmountEditor({ 
  ingredient, 
  iconId, 
  isOpen, 
  onClose, 
  onSave 
}: IngredientAmountEditorProps) {
  // Local state for the edited values
  const [quantity, setQuantity] = useState<number>(ingredient.suggestedQuantity || ingredient.portionQuantity);
  const [portionSize, setPortionSize] = useState<string>(ingredient.portionSize);
  
  // Reset form when ingredient changes
  useEffect(() => {
    setQuantity(ingredient.suggestedQuantity || ingredient.portionQuantity);
    setPortionSize(ingredient.portionSize);
  }, [ingredient]);
  
  // Calculate new macros based on the ratio of new quantity to original
  const calculateNewMacros = () => {
    if (!ingredient.macros) return undefined;
    
    const originalQuantity = ingredient.suggestedQuantity || ingredient.portionQuantity;
    const ratio = quantity / originalQuantity;
    
    return {
      calories: Math.round(ingredient.macros.calories * ratio),
      protein: Math.round(ingredient.macros.protein * ratio),
      carbs: Math.round(ingredient.macros.carbs * ratio),
      fat: Math.round(ingredient.macros.fat * ratio),
      fiber: Math.round(ingredient.macros.fiber * ratio),
      sugar: Math.round((ingredient.macros.sugar || 0) * ratio)
    };
  };
  
  // Get updated macros
  const updatedMacros = calculateNewMacros();
  
  // Handle save
  const handleSave = () => {
    const updatedIngredient: RecipeIngredient = {
      ...ingredient,
      portionQuantity: quantity,
      suggestedQuantity: quantity,
      portionSize: portionSize,
      macros: updatedMacros
    };
    
    onSave(updatedIngredient);
    onClose();
  };
  
  // Get icon URL
  const iconUrl = iconId ? getIconUrl(iconId) : "";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              {iconUrl ? (
                <Image 
                  src={iconUrl} 
                  alt={ingredient.ingredientName} 
                  width={32} 
                  height={32}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <BeakerIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <span>Edit {ingredient.ingredientName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Current macros display */}
          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <div className="font-medium text-blue-800 mb-1">Macros:</div>
            <div className="grid grid-cols-4 gap-2 text-blue-700">
              <div>
                <div className="font-semibold">{Math.round(updatedMacros?.calories || 0)}</div>
                <div className="text-xs">Calories</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(updatedMacros?.protein || 0)}g</div>
                <div className="text-xs">Protein</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(updatedMacros?.carbs || 0)}g</div>
                <div className="text-xs">Carbs</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(updatedMacros?.fat || 0)}g</div>
                <div className="text-xs">Fat</div>
              </div>
            </div>
          </div>
          
          {/* Amount input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="unit" className="text-sm font-medium">
                Unit
              </label>
              <Select value={portionSize} onValueChange={setPortionSize}>
                <SelectTrigger id="unit" className="mt-1">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ingredient.portionSize}>
                    {ingredient.portionSize} (original)
                  </SelectItem>
                  {commonPortionSizes
                    .filter(size => size !== ingredient.portionSize)
                    .map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Slider for quick adjustment */}
          <div>
            <label className="text-sm font-medium">Adjust Amount</label>
            <div className="mt-1">
              <Slider
                value={[quantity]}
                min={0}
                max={Math.max(quantity * 2, 10)}
                step={0.1}
                onValueChange={(values) => setQuantity(values[0])}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 