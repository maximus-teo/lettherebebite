process.chdir(__dirname);
console.log("Running from:", process.cwd());

require('dotenv').config({ path: './.env' });

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
    console.error("GROQ_API_KEY is missing! Check your .env file.");
    process.exit(1);
}

app.post("/api/recipe", async (req, res) => {
    const { dishName, dishIngredients, searchType } = req.body;

    let x = Math.floor(Math.random() * 6) + 5;

    // basic search
    const basicPrompt = `
        Generate 4–5 recipe variants for "${dishName}".

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure syntax is perfect.
        
        Each object must include **all of the following keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "url_name": "slug-format-name",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika"],
        "instructions": ["Marinate the chicken in paprika and oil for 15 mins.", "Grill over high heat until fully cooked."]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "ingredients" must include portion sizes.
        - "instructions" should be comprehensive.
    `;

    // basic search + cuisines
    const basicPlusPrompt = `
        Generate ${x} recipe variants for "${dishName}" with different cuisines.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure syntax is perfect.
        
        Each object must include **all of the following keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "url_name": "slug-format-name",
        "cuisine": "Cuisine type",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika"],
        "instructions": ["Marinate the chicken in paprika and oil for 15 mins.", "Grill over high heat until fully cooked."]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "ingredients" must include portion sizes.
        - "instructions" should be comprehensive.
    `;

    // advanced search 
    const advancedPrompt = `
        Generate 4–5 recipe variants for "${dishName}" using only the ingredients: "${dishIngredients}". You may add up to 2 extra ingredients if necessary.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure syntax is perfect.
        
        Each object must include **all of the following keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "url_name": "slug-format-name",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika"],
        "instructions": ["Marinate the chicken in paprika and oil for 15 mins.", "Grill over high heat until fully cooked."]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
        - "ingredients" must include portion sizes.
        - "ingredients" must mainly come from "${dishIngredients}".
        - "instructions" should be comprehensive.
    `;

    // advanced search + cuisines
    const advancedPlusPrompt = `
        Generate 4–5 recipe variants for "${dishName}" with different cuisines AND using only the ingredients: "${dishIngredients}". You may add up to 2 extra ingredients if necessary.

        Output only a **raw JSON array** of objects, no markdown, no code blocks, no explanations. Make sure syntax is perfect.
        
        Each object must include **all of the following keys**:

        {
        "title": "Dish name mentioning distinct ingredients",
        "description": "Short, vivid description using varied language",
        "url_name": "slug-format-name",
        "cuisine": "Cuisine type",
        "difficulty": 1–5,
        "prep_time": "45 minutes",
        "ingredients": ["200g chicken thighs", "1 tbsp olive oil", "1 tsp paprika"],
        "instructions": ["Marinate the chicken in paprika and oil for 15 mins.", "Grill over high heat until fully cooked."]
        }

        Requirements:
        - The first object is the classic version of the dish, others are variants in random order.
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
                        content: "You are a strict data generator. Only output raw structured arrays. Never include commentary, filler, or any extra text."
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

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
