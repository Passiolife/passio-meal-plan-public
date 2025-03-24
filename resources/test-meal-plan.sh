#!/bin/bash

# Set API URL
API_URL="http://localhost:3000/api/generate-meal-plan"

# Simple request payload
echo '{
  "numberOfDays": 1,
  "clientName": "Dave",
  "dietaryRestrictions": ["keto"],
  "allergies": ["peanuts"],
  "goals": ["weight loss"],
  "preferenceNotes": ["likes beef", "dislikes fish"],
  "macroRequirements": {
    "calories": 1870,
    "protein": 117,
    "carbs": 50,
    "fat": 134
  }
}' > meal_plan_input.json

# Make the API request
echo "Sending request to $API_URL..."
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @meal_plan_input.json | jq '.' > meal_plan_response.json

# Display response
echo "Response saved to meal_plan_response.json"
cat meal_plan_response.json | jq '.'

# Clean up
rm meal_plan_input.json 