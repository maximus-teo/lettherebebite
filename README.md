# Let There Be Bite

## Introduction
Let There Be Bite is an AI-powered recipe generation web app that helps users create customised meal ideas from any dish names or with a limited list of ingredients.

## 🌐 Live Site
To test out LTBB, visit https://maximus-teo.github.io/lettherebebite

## Features
+ AI-generated recipes using natural language input
+ Recipes are generated with variety in ingredients and cuisines
+ Desktop and mobile-responsive layouts
+ Local caching of search results

## Tech Stack
+ **Frontend**: Built with HTML, CSS, and JavaScript
+ **Backend**: Node.js, Express
+ **API used**: Groq AI for recipe generation


## Usage
1. Instructions

## 📌 How to Run Locally
Here are the steps to run this program on your machine, with your own API key.

1. **Clone this repository**:
   ```
   git clone https://github.com/maximus-teo/lettherebebite.git
   cd ltbb
   ```

2. **Create a `.env` file** in the root of your project.

3. **Add your API key to the `.env` file**: <br />
    You will need a working API key to run this editor. To get your API key, visit Groq and receive your own API key:
    https://console.groq.com/home

    Go to your `.env` file and add your API key as shown.
    ```
    GROQ_API_KEY=your-api-key-here
    ```

4. **Run the project in terminal**:
    Make sure the directory is set to the `ltbb` folder, then run `npm start`.
    The execution instructions are preset in `package-lock.json` so that it runs `node.js` and `live-server` using `concurrently`.
    ```
    cd ltbb
    npm start
    ```

~ Designed and developed by Maximus Teo