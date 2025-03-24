export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPassioToken } from '@/services/passio-auth'

// Updated Passio API endpoint for meal plan preview generation
const PASSIO_API_URL = 'https://api.passiolife.com/v2/products-pr/sdk/tools/generateMealPlanPreview'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Get Passio token using the same method as ingredient-extraction
    const { accessToken } = await getPassioToken()
    
    if (!accessToken) {
      throw new Error('Failed to get valid access token')
    }
    
    // Use the content directly from the request if it exists
    // Otherwise, fall back to generating content from dietary restrictions
    const requestPayload = body.content 
      ? { content: body.content } 
      : {
          content: `generate a ${body.dietaryRestrictions?.join(', ') || 'balanced'} meal plan`
        }
    
    // Log request for debugging
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
    
    // Parse and return the response
    const data = await response.json()
    console.log('✅ Passio API response received')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('💥 Meal plan preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan preview' },
      { status: 500 }
    )
  }
} 