process.chdir(__dirname);
console.log("Running from:", process.cwd());

require('dotenv').config({ path: './.env' });

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const qs = require('querystring');

const app = express();
const PORT = 3000;

const allowedOrigins = [
  'https://maximus-teo.github.io',
  'http://127.0.0.1:8080',
  'http://localhost:8080'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(express.json());

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
    console.error("GROQ_API_KEY is missing! Check your .env file.");
    process.exit(1);
}

app.post("/api/groq-recipe", async (req, res) => {
    const { dishName, dishIngredients, searchType } = req.body;

    let x = Math.floor(Math.random() * 6) + 5;

    // basic search
    const basicPrompt = `
        Generate 4–5 recipe variants for "${dishName}".

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure you follow the JSON array format: [{...}, {...}, {...}]
        
        Each JSON object must follow this exact format **including all keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika", ...],
        "instructions": ["Step 1", "Step 2", "Step 3", ...]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "description" is a short explanation of the dish's uniqueness or twist
        - "ingredients" must include portion sizes.
        - "instructions" should be comprehensive.
    `;

    // basic search + cuisines
    const basicPlusPrompt = `
        Generate ${x} recipe variants for "${dishName}" with different cuisines.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure you follow the JSON array format: [{...}, {...}, {...}]

        Each JSON object must follow this exact format **including all keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "cuisine": "Cuisine type",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika", ...],
        "instructions": ["Step 1", "Step 2", "Step 3", ...]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "description" is a short explanation of the dish's uniqueness or twist
        - "ingredients" must include portion sizes.
        - "instructions" should be comprehensive.
    `;

    // advanced search 
    const advancedPrompt = `
        Generate 4–5 recipe variants for "${dishName}" using only the ingredients: "${dishIngredients}". You may add up to 2 extra ingredients if necessary.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure you follow the JSON array format: [{...}, {...}, {...}]
        
        Each JSON object must follow this exact format **including all keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika", ...],
        "instructions": ["Step 1", "Step 2", "Step 3", ...]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "description" is a short explanation of the dish's uniqueness or twist
        - "ingredients" must include portion sizes.
        - "ingredients" must mainly come from "${dishIngredients}".
        - "instructions" should be comprehensive.
    `;

    // advanced search + cuisines
    const advancedPlusPrompt = `
        Generate 4–5 recipe variants for "${dishName}" with different cuisines AND using only the ingredients: "${dishIngredients}". You may add up to 2 extra ingredients if necessary.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure you follow the JSON array format: [{...}, {...}, {...}]
        
        Each JSON object must follow this exact format **including all keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "cuisine": "Cuisine type",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika", ...],
        "instructions": ["Step 1", "Step 2", "Step 3", ...]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "description" is a short explanation of the dish's uniqueness or twist
        - "ingredients" must include portion sizes.
        - "ingredients" must mainly come from "${dishIngredients}".
        - "instructions" should be comprehensive.
    `;

    let prompt;
    switch (searchType) {
        case "basic": {prompt = basicPrompt; break;}
        case "basicPlus": {prompt = basicPlusPrompt; break;}
        case "advanced": {prompt = advancedPrompt; break;}
        case "advancedPlus": {prompt = advancedPlusPrompt; break;}
    }
    
    console.log("Sending prompt:", prompt);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + groqApiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict data generator. Only output raw structured arrays of JSON objects. Never include commentary, filler, or any extra text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error calling Groq API:", err);
        res.status(500).json({ error: "Failed to generate recipe." });
    }
});

const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
if (!spoonacularApiKey) {
    console.error("SPOONACULAR_API_KEY is missing! Check your .env file.");
    process.exit(1);
}

app.post("/api/spoon-recipe", async (req, res) => {
    const { query, cuisine, diet, intolerances, includeIngredients, number } = req.body;

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&cuisine=${cuisine}&diet=${diet}&intolerances=${intolerances}&includeIngredients=${includeIngredients}&instructionsRequired=true&number=${number}&addRecipeInformation=true`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": spoonacularApiKey
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: "Spoonacular: failed to generate recipe." });
    }
});

app.post('/api/spoon-nutrition', async (req, res) => {
    const { title, servings, ingredients } = req.body;

    const ingredientList = Array.isArray(ingredients)
    ? ingredients.map(i => i.trim()).join('\n')
    : ingredients;

    const formBody = qs.stringify({
        ingredientList,
        servings: 1,
        title: title || "Untitled Recipe",
        defaultCss: true,
        showOptionalNutrients: true,
        showZeroValues: true
    });

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/visualizeNutrition?ingredientList=${ingredients}&servings=${servings}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "x-api-key": spoonacularApiKey
            },
            body: formBody
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spoonacular API failed: ${errorText}`);
        }

        const html = await response.text();
        res.send(html);

    } catch (err) {
        res.status(500).send(`<p>Error: ${err.message}</p>`);
    }
});

app.post('/api/spoon-nutrition-id', async (req, res) => {
    const { id } = req.body;

    try {
        const response = await fetch(`https://api.spoonacular.com/food/menuItems/${id}/nutritionWidget?defaultCss=true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html',
                "x-api-key": spoonacularApiKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spoonacular API (nutrition-id) failed: ${errorText}`);
        }

        const html = await response.text();
        res.send(html);

    } catch (err) {
        res.status(500).send(`<p>Error: ${err.message}</p>`);
    }
});

app.post('/api/spoon-ingredients-id', async (req, res) => {
    const { id } = req.body;

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "x-api-key": spoonacularApiKey
            }
        });
        
        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: "Spoonacular: failed to generate ingredients." });
    }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});