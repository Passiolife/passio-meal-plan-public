// app/page.tsx
'use client';

import { SingleDayMealPlan } from "@/components/SingleDayMealPlan"
import ClientPreferencesForm from "@/components/ClientPreferencesForm"
import { DayMealPlan } from "@/types/meal_plan_output"
import { MealPlanInput } from "@/types/meal_plan_input"
import { useState, useEffect } from 'react'


export default function Home() {
  const [dayPlan, setDayPlan] = useState<DayMealPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mealPlanInputJson, setMealPlanInputJson] = useState<string>('')
  const [mealPlanOutputJson, setMealPlanOutputJson] = useState<string>('')

  useEffect(() => {
    console.log('🔍 COMPONENT STATE:', {
      dayPlan: dayPlan,
    });
  }, [dayPlan]);

  const handlePreferencesSubmit = async (mealPlanInput: MealPlanInput) => {
    setIsLoading(true)
    setMealPlanInputJson(JSON.stringify(mealPlanInput, null, 2))
    
    try {
      // Original meal plan generation call
      const mealPlanResponse = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealPlanInput)
      })

      if (!mealPlanResponse.ok) throw new Error('Meal plan generation failed')
      const rawData = await mealPlanResponse.json()

      // Print the raw JSON
      console.log('🔥 RAW MEAL PLAN API RESPONSE:', JSON.stringify(rawData, null, 2))

      // Store the raw data in the output JSON
      setMealPlanOutputJson(JSON.stringify(rawData, null, 2))

      // Extract the first day from mealPlanDays array
      if (rawData.mealPlanDays && rawData.mealPlanDays.length > 0) {
        setDayPlan(rawData.mealPlanDays[0])
      } else {
        console.error('No meal plan days found in the response')
        setDayPlan(null)
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Client Preferences</h2>
            <ClientPreferencesForm onSubmit={handlePreferencesSubmit} />
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Meal Plan</h2>
            {isLoading ? (
              <div>Generating meal plan...</div>
            ) : (
              dayPlan && <SingleDayMealPlan dayPlan={dayPlan} />
            )}
          </div>
        </div>
      </div>
      
      {/* Debug JSON Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">Meal Plan Input JSON</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
            {mealPlanInputJson || 'No data yet'}
          </pre>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">Meal Plan Output JSON</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
            {mealPlanOutputJson || 'No data yet'}
          </pre>
        </div>
      </div>
    </main>
  )
}
