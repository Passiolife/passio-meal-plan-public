'use client';

import { useState } from 'react';
import { MealPlanInput, PhysicalStats, Macros, DayOfWeek } from '@/types/meal_plan_input';
import { Card, CardContent } from "@/components/ui/card";

// Add this constant at the top of the file for consistent input styling
const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const initialState: MealPlanInput = {
  numberOfDays: 1,
  clientName: 'Dave',
  physicalStats: {
    currentWeight: 85,
    targetWeight: 80,
    height: 180,
    activityLevel: 'moderate',
    age: 35,
    sex: 'male'
  },
  targetDay: 'monday',
  previousMealPlans: [],
  dietaryRestrictions: [],
  allergies: [],
  healthConditions: [],
  goals: [],
  preferenceNotes: [],
  macroRequirements: {
    calories: 1870,
    protein: 117,
    fiber: 25,
    carbs: 50,
    fat: 134,
    sugar: 25
  }
};

// Add state for raw text inputs
interface RawTextInputs {
  dietaryRestrictions: string;
  allergies: string;
  healthConditions: string;
  goals: string;
  preferenceNotes: string;
}

export default function ClientPreferencesForm({
  onSubmit
}: {
  onSubmit: (preferences: MealPlanInput) => void;
}) {
  const [formData, setFormData] = useState<MealPlanInput>(initialState);
  const [rawInputs, setRawInputs] = useState<RawTextInputs>({
    dietaryRestrictions: '',
    allergies: '',
    healthConditions: '',
    goals: '',
    preferenceNotes: ''
  });

  const handlePhysicalStatsChange = (field: keyof PhysicalStats, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      physicalStats: {
        ...prev.physicalStats,
        [field]: value
      }
    }));
  };

  const handleMacroChange = (type: 'macroRequirements', field: keyof Macros, value: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleTextAreaChange = (field: keyof RawTextInputs, value: string) => {
    setRawInputs(prev => ({ ...prev, [field]: value }));
    setFormData(prev => ({ 
      ...prev, 
      [field]: value ? value.split(',').map(x => x.trim()).filter(Boolean) : [] 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium">Client Name</label>
            <input
              type="text"
              id="clientName"
              className={inputClassName}
              value={formData.clientName}
              onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          {/* Physical Stats */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium">Physical Stats</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Current Weight (kg)</label>
                <input
                  type="number"
                  className={inputClassName}
                  value={formData.physicalStats.currentWeight || ''}
                  onChange={e => handlePhysicalStatsChange('currentWeight', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm">Target Weight (kg)</label>
                <input
                  type="number"
                  className={inputClassName}
                  value={formData.physicalStats.targetWeight || ''}
                  onChange={e => handlePhysicalStatsChange('targetWeight', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm">Height (cm)</label>
                <input
                  type="number"
                  className={inputClassName}
                  value={formData.physicalStats.height || ''}
                  onChange={e => handlePhysicalStatsChange('height', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm">Age</label>
                <input
                  type="number"
                  className={inputClassName}
                  value={formData.physicalStats.age || ''}
                  onChange={e => handlePhysicalStatsChange('age', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm">Activity Level</label>
                <select
                  className={inputClassName}
                  value={formData.physicalStats.activityLevel}
                  onChange={e => handlePhysicalStatsChange('activityLevel', e.target.value)}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="very_active">Very Active</option>
                  <option value="extra_active">Extra Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Sex</label>
                <select
                  className={inputClassName}
                  value={formData.physicalStats.sex}
                  onChange={e => handlePhysicalStatsChange('sex', e.target.value)}
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
              <label className="block text-sm">Dietary Restrictions</label>
              <textarea
                className={inputClassName}
                value={rawInputs.dietaryRestrictions}
                onChange={e => handleTextAreaChange('dietaryRestrictions', e.target.value)}
                placeholder="Enter comma-separated restrictions"
              />
            </div>
            <div>
              <label className="block text-sm">Allergies</label>
              <textarea
                className={inputClassName}
                value={rawInputs.allergies}
                onChange={e => handleTextAreaChange('allergies', e.target.value)}
                placeholder="Enter comma-separated allergies"
              />
            </div>
            <div>
              <label className="block text-sm">Health Conditions</label>
              <textarea
                className={inputClassName}
                value={rawInputs.healthConditions}
                onChange={e => handleTextAreaChange('healthConditions', e.target.value)}
                placeholder="Enter comma-separated health conditions"
              />
            </div>
            <div>
              <label className="block text-sm">Goals</label>
              <textarea
                className={inputClassName}
                value={rawInputs.goals}
                onChange={e => handleTextAreaChange('goals', e.target.value)}
                placeholder="Enter comma-separated goals"
              />
            </div>
            <div>
              <label className="block text-sm">Preference Notes</label>
              <textarea
                className={inputClassName}
                value={rawInputs.preferenceNotes}
                onChange={e => handleTextAreaChange('preferenceNotes', e.target.value)}
                placeholder="Enter comma-separated preference notes"
              />
            </div>
            <div>
              <label className="block text-sm">Target Day</label>
              <select
                className={inputClassName}
                value={formData.targetDay}
                onChange={e => setFormData(prev => ({ ...prev, targetDay: e.target.value as DayOfWeek }))}
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
            <legend className="text-sm font-medium">Daily Macro Requirements</legend>
            <div className="grid grid-cols-3 gap-4">
              {Object.keys(formData.macroRequirements).map((macro) => (
                <div key={macro}>
                  <label className="block text-sm">{macro.charAt(0).toUpperCase() + macro.slice(1)} (g)</label>
                  <input
                    type="number"
                    className={inputClassName}
                    value={formData.macroRequirements[macro as keyof Macros]}
                    onChange={e => handleMacroChange('macroRequirements', macro as keyof Macros, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="w-full">
            <label className="block text-sm font-medium">Number of Days</label>
            <input
              type="number"
              min="1"
              max="7"
              className={inputClassName}
              value={formData.numberOfDays}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                numberOfDays: Math.max(1, Math.min(7, Number(e.target.value))) 
              }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Generate Meal Plan
          </button>
        </form>
      </CardContent>
    </Card>
  );
} 