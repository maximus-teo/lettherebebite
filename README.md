# Let There Be Bite

## Introduction
Let There Be Bite is an AI-powered recipe generation web app that helps users create customised meal ideas from any dish names or with a limited list of ingredients.

## 🌐 Live Site
To test out LTBB, visit https://maximus-teo.github.io/lettherebebite

## Features
+ AI-generated recipes using natural language input
+ Recipes are generated with variety in ingredients and cuisines
+ Recipes are integrated with a comprehensive list of nutritional values
+ Desktop and mobile-responsive layouts
+ Local caching of search results

## Tech Stack
+ **Frontend**: Built with HTML, CSS, and JavaScript
+ **Backend**: Node.js, Express
+ **APIs used**: Groq AI for recipe generation, Spoonacular for nutritional information

## Usage
1. Enter a dish name or ingredient (e.g. "chicken curry")
2. Groq generates a complete recipe with ingredients and instructions.
3. Results are compiled in an orderly manner for the user to easily browse through.
4. Results are cached for efficiency.

## Future Improvements
+ User accounts + save recipe features
+ Voice input integration
+ Image matching with keyword embedding
+ More customisation on nutritional values

## 📌 How to Run Locally
Here are the steps to run this program on your machine, with your own API keys.

1. **Clone this repository**:
   ```
   git clone https://github.com/maximus-teo/lettherebebite.git
   cd ltbb
   ```

2. **Create a `.env` file** in the root of your project.

3. **Add your API key to the `.env` file**: <br />
    You will need API keys to run this website. To get your API keys, visit the links below: <br />
    **Groq**: https://console.groq.com/home <br />
    **Spoonacular**: https://spoonacular.com/food-api/console <br />

    Go to your `.env` file and add your API keys as shown.
    ```
    GROQ_API_KEY=your-api-key-here
    SPOONACULAR_API_KEY=your-api-key-here
    ```

4. **Run the project in terminal**:
    Make sure the directory is set to the `ltbb` folder, then run `npm start`.
    The execution instructions are already preset in `package-lock.json` so that it runs `node server.js` and `live-server` using `concurrently`.
    ```
    cd ltbb
    npm start
    ```

~ Designed and developed by **Maximus Teo**