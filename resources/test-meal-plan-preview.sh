#!/bin/bash

# Set API URL
API_URL="http://localhost:3000/api/generate-meal-plan-preview"

# Simple request payload
echo '{"content": "generate a one day beef and salmon keto meal plan with a main recipe and a side for each meal. So there are at least 3 foods and a drink for each meal"}' > simple_input.json

# Make the API request
echo "Sending request to $API_URL..."
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @simple_input.json | jq '.' > response.json

# Display response
echo "Response saved to response.json"
cat response.json | jq '.'

# Clean up
rm simple_input.json 