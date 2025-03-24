# Passio Meal Plan API Demo and Reference Implementation

## Overview

This repository contains an API demo and reference implementation for the Passio Meal Plan API.
The API enables meal plan generation based on dietary preferences, allergies, and nutritional goals.

## 🚀 Quick Start

Follow these steps to set up and run a demo locally.

### 1. Clone the Repository

```bash
git clone https://github.com/passio-ai/meal-plan-api.git
cd meal-plan-api
```

### 2. Set Up Environment Variables
Create a .env.local file in the root directory and add your Passio API key:

```ini
PASSIO_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```
This starts a local development server. Open http://localhost:3000 to test the meal plan demo.

## 🛠 API Endpoints

The following APIs allow meal plan generation:

### 1️⃣ Generate Meal Plan Preview

This provides a preview of a meal plan before finalizing.

**Request**

```bash
curl --location 'https://api.passiolife.com/v2/products-pr/sdk/tools/generateMealPlanPreview' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_PASSIO_API_KEY' \
--data '{"content":"Generate a 3-day keto meal plan with beef and salmon and no dairy"}'
```

**Response**

```json
{
  "mealPlanPreview": [
    {
      "day": "Monday",
      "breakfast": { 
        "recipes": [
          {
            "name": "Keto Beef and Egg Scramble",
            "ingredients": ["Ground beef", "Eggs", "Spinach", "Avocado oil"],
            "preparation": "Brown the beef, add beaten eggs and spinach, cook until done."
          }
        ] 
      },
      "lunch": { 
        "recipes": [
          {
            "name": "Grilled Salmon with Asparagus",
            "ingredients": ["Salmon fillet", "Asparagus", "Olive oil", "Lemon"],
            "preparation": "Season salmon, grill with asparagus, drizzle with lemon."
          }
        ] 
      },
      "dinner": { 
        "recipes": [
          {
            "name": "Beef Stir-Fry with Broccoli",
            "ingredients": ["Beef strips", "Broccoli", "Coconut aminos", "Sesame oil"],
            "preparation": "Stir-fry beef, add broccoli and seasonings, cook until tender."
          }
        ] 
      }
    }
  ]
}
```

### 2️⃣ Generate Full Meal Plan
This endpoint generates a complete meal plan based on user preferences.

**Request**

```bash
curl --location 'https://api.passiolife.com/v2/products-pr/sdk/tools/generateMealPlan' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_PASSIO_API_KEY' \
--data '{
  "clientName": "John Doe",
  "dietaryRestrictions": ["vegan"],
  "caloriesPerDay": 2000
}'
```

**Response**

```json
{
  "mealPlanDays": [
    {
      "breakfast": { 
        "recipes": [
          {
            "name": "Overnight Oats with Berries",
            "ingredients": [
              {
                "displayName": "Oats",
                "portionQuantity": 1,
                "portionSize": "cup",
                "nutritionPreview": {
                  "calories": 307,
                  "protein": 10,
                  "carbs": 55,
                  "fat": 5,
                  "fiber": 8
                }
              },
              {
                "displayName": "Almond Milk",
                "portionQuantity": 1,
                "portionSize": "cup"
              },
              {
                "displayName": "Mixed Berries",
                "portionQuantity": 0.5,
                "portionSize": "cup"
              }
            ],
            "preparation": "Mix oats with almond milk, let sit overnight, top with berries."
          }
        ]
      },
      "lunch": { 
        "recipes": [
          {
            "name": "Quinoa Buddha Bowl",
            "ingredients": [
              {
                "displayName": "Quinoa",
                "portionQuantity": 0.75,
                "portionSize": "cup"
              },
              {
                "displayName": "Chickpeas",
                "portionQuantity": 0.5,
                "portionSize": "cup"
              },
              {
                "displayName": "Avocado",
                "portionQuantity": 0.5,
                "portionSize": "whole"
              }
            ],
            "preparation": "Combine cooked quinoa with chickpeas, top with sliced avocado."
          }
        ]
      },
      "dinner": { 
        "recipes": [
          {
            "name": "Lentil Pasta with Vegetables",
            "ingredients": [
              {
                "displayName": "Lentil Pasta",
                "portionQuantity": 2,
                "portionSize": "oz"
              },
              {
                "displayName": "Tomato Sauce",
                "portionQuantity": 0.5,
                "portionSize": "cup"
              },
              {
                "displayName": "Zucchini",
                "portionQuantity": 1,
                "portionSize": "medium"
              }
            ],
            "preparation": "Cook pasta, sauté zucchini, combine with sauce."
          }
        ]
      }
    }
  ],
  "shoppingList": [
    { "name": "Oats", "portionQuantity": 1, "portionSize": "cup" },
    { "name": "Almond Milk", "portionQuantity": 1, "portionSize": "cup" },
    { "name": "Mixed Berries", "portionQuantity": 0.5, "portionSize": "cup" },
    { "name": "Quinoa", "portionQuantity": 0.75, "portionSize": "cup" },
    { "name": "Chickpeas", "portionQuantity": 0.5, "portionSize": "cup" },
    { "name": "Avocado", "portionQuantity": 0.5, "portionSize": "whole" },
    { "name": "Lentil Pasta", "portionQuantity": 2, "portionSize": "oz" },
    { "name": "Tomato Sauce", "portionQuantity": 0.5, "portionSize": "cup" },
    { "name": "Zucchini", "portionQuantity": 1, "portionSize": "medium" }
  ]
}
```

You can find more details on the API endpoints in the [API Reference](https://api.passiolife.com/v2/products/napi/docs#tag/SDK).

## Meal Planner FAQ

### Input Data in our demo implementation (this repository)

**Will we need to make a separate request for each day of the meal plan?**

- By default, the endpoint can generate up to 7 days. But you may need to experiment with to get the best results.

**What information is optional? Specifically we may not have physicalStats, healthConditions, goals, preferenceNotes**

- All of the inputs are optional. Even with no inputs, the endpoint will generate a meal plan. But as you provide more information, the meal plan will be more personalized and adhere to the information you provide.

**I'm not sure we were planning to separate dietaryRestrictions and allergies. Is it better if we do separate them?**

- It will not impact the functionality of the endpoint. We separated them just for the ease of use.

**What is the difference between preview and full meal plan?**

- You can use preview to quickly generate a meal plan, edit it and use it as an input into a full API, or you can just use the full API from the start. If you use the full API from the start the generation will take a bit longer and will be a bit less accurate if you’re trying to exactly match macros.

### Output Data 

**If as mentioned above we are looping through to create multiple days for the meal plan will the shoppingList accumulate the values for each day or would we have to do that?**

- The API returns multiple days in the response, with a consolidated shopping list for all days. The reference implementation in this repository demonstrates how to display a single day, but the full response contains data for all requested days.

**How are macros calculated for recipes?**

- Macros are calculated based on the nutritional information of each ingredient in the recipe. The API provides detailed macro information for each meal and for the entire day.

**Can I customize portion sizes?**

- Yes, the demo implementation includes an ingredient editor that allows adjusting portion sizes. The API will recalculate macros based on the new portions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.