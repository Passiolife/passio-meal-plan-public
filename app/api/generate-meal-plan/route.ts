export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPassioToken } from '@/services/passio-auth'
import { MealPlanInput } from '@/types/meal_plan_input'

// Passio API endpoint for meal plan generation
const PASSIO_API_URL = 'https://api.passiolife.com/v2/products-pr/sdk/tools/generateMealPlan'

export async function POST(request: Request) {
  try {
    // Parse request body
    const mealPlanInput: MealPlanInput = await request.json()
    console.log('🚀 Received meal plan input:', mealPlanInput)
    
    // Get Passio token
    const { accessToken } = await getPassioToken()
    
    if (!accessToken) {
      throw new Error('Failed to get valid access token')
    }
    
    // Create a descriptive prompt from the input
    const prompt = createPromptFromInput(mealPlanInput)
    
    // Create the request payload
    const requestPayload = {
      content: prompt
    }
    
    console.log('📤 Sending request to Passio API:', JSON.stringify(requestPayload, null, 2))
    
    // Call Passio API with proper authorization
    const response = await fetch(PASSIO_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestPayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Passio API error:', response.status, errorText)
      throw new Error(`Passio API error: ${response.status}`)
    }
    
    // Parse the response and return it directly
    const passioData = await response.json()
    
    // Log the full response structure to help adapt the frontend
    console.log('✅ Passio API response structure:', JSON.stringify(passioData, null, 2))
    
    // Return the raw Passio response
    return NextResponse.json(passioData)
    
  } catch (error) {
    console.error('💥 Meal plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}

// Helper function to create a prompt from the meal plan input
function createPromptFromInput(input: MealPlanInput): string {
  // Ensure defaults for optional arrays
  const dietaryRestrictions = input.dietaryRestrictions || []
  const allergies = input.allergies || []
  const goals = input.goals || []
  const preferenceNotes = input.preferenceNotes || []
  
  // Build the prompt
  let prompt = `Generate a ${input.numberOfDays}-day meal plan`
  
  if (input.clientName) {
    prompt += ` for ${input.clientName}`
  }
  
  if (dietaryRestrictions.length > 0) {
    prompt += ` with ${dietaryRestrictions.join(', ')} dietary restrictions`
  }
  
  if (allergies.length > 0) {
    prompt += `. Allergies: ${allergies.join(', ')}`
  }
  
  if (goals.length > 0) {
    prompt += `. Goals: ${goals.join(', ')}`
  }
  
  if (preferenceNotes.length > 0) {
    prompt += `. Preferences: ${preferenceNotes.join(', ')}`
  }
  
  if (input.macroRequirements) {
    const { calories, protein, carbs, fat } = input.macroRequirements
    prompt += `. Target macros: ${calories}cal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat`
  }
  
  return prompt
}
