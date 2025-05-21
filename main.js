/* HOME PAGE
* Basic Search: Results are based purely on the prompt
* Advanced Search: Results are based on the prompt and can only include a specific list of ingredients
*/

let allRecipes = [];

const prompts = [
    "chicken sandwich",
    "vegan burrito bowl",
    "quick 10-minute breakfast",
    "easy one-pot pasta",
    "gluten-free chocolate cake",
    "kid-friendly dinner idea",
    "romantic dinner for two",
    "budget meal under $5",
    "healthy post-workout snack",
    "spicy Korean noodles",
    "Sunday family roast",
    "high-protein vegetarian dish",
    "camping meal with minimal gear",
    "meal prep for the week",
    "comfort food while having a flu",
    "traditional Indian curry",
    "picnic snacks for a sunny day",
    "low-carb keto lunch",
    "air fryer magic with 3 ingredients",
    "soup to heal the soul",
    "cozy dinner on a rainy day",
    "late-night sweet craving fix",
    "pizza party for 5 people",
    "fusion dish with Asian + Italian vibes"
];
  

document.addEventListener('DOMContentLoaded', () => {
    let prevScrollpos = window.pageYOffset;
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
            document.getElementById("home-navbar").style.top = "-150px";
        } else {
            document.getElementById("home-navbar").style.top = "0px";
        }
        prevScrollpos = currentScrollPos;
    };

    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    const basicRB = document.getElementById("basic-search");
    const advancedRB = document.getElementById("advanced-search");
    const advancedInput = document.getElementById("advanced-input");
    const diffCuisines = document.getElementById("different-cuisines");

    basicRB.addEventListener('click', () => {
        advancedInput.hidden = true;
        advancedInput.value = "";
    });

    advancedRB.addEventListener('click', () => {
        advancedInput.hidden = false;
    });

    searchButton.addEventListener('click', async () => {
        const dishName = searchInput.value.trim();
        const dishIngredients = advancedInput.value;
        let searchType;
        
        if (!dishName) {
            alert("Please enter a dish name.");
            return;
        }
        if (advancedRB.checked && !dishIngredients) {
            alert("Please enter your main ingredients.");
            return;
        }

        if (basicRB.checked) {
            if (diffCuisines.checked) searchType = "basicPlus";
            else searchType = "basic";
        }
        else if (advancedRB.checked) {
            if (diffCuisines.checked) searchType = "advancedPlus";
            else searchType = "advanced";
        }

        const overlay = document.getElementById("loading-overlay");
        overlay.style.display = "flex";

        const originalFavicon = document.querySelector("link[rel~='icon']");
        const spinningFavicon = document.createElement("link");
        spinningFavicon.rel = "icon";
        spinningFavicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 stroke=%22gray%22 stroke-width=%2210%22 fill=%22none%22 stroke-dasharray=%22250%22 stroke-dashoffset=%22125%22 transform=%22rotate(-90 50 50)%22><animateTransform attributeName=%22transform%22 type=%22rotate%22 from=%220 50 50%22 to=%22360 50 50%22 dur=%221s%22 repeatCount=%22indefinite%22/></circle></svg>";
        document.head.appendChild(spinningFavicon);
        if (originalFavicon) originalFavicon.remove();
    
        const backendURL = "http://localhost:3000";//"https://lettherebebite.onrender.com";

        try {
            localStorage.setItem("dishName", dishName);
            let response, data, recipeData, test;

            // use spoonacular first
            localStorage.setItem("apiMode", "spoonacular");

            const veg = document.getElementById("special-veg");
            const gluten = document.getElementById("special-gluten");
            const keto = document.getElementById("special-keto");

            let diets = [];
            if (veg.checked) diets.push(veg.value);
            if (gluten.checked) diets.push(gluten.value);
            if (keto.checked) diets.push(keto.value);
            const dietString = diets.join(",");

            response = await fetch(`${backendURL}/api/spoon-recipe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: dishName,
                    cuisine: "",
                    diet: dietString || "",
                    intolerances: "",
                    includeIngredients: dishIngredients || "",
                    number: Math.floor(Math.random() * 6) + 5 // random 5-10
                })
            });

            if (!response.ok) throw new Error("Failed to load recipe");
            console.log("Spoonacular raw response: ", response);

            data = await response.json();
            recipeData = JSON.stringify(data.results);
            console.log("Spoonacular JSON: ", recipeData);

            // if spoonacular fails, use groq

            if (recipeData.length === 2 || recipeData === null) {
                localStorage.setItem("apiMode", "groq");

                let passed = false;
                let apiUses = 0;
                let retryCount = 0;
                const maxRetries = 5;

                do {
                    response = await fetch(`${backendURL}/api/groq-recipe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ dishName, dishIngredients, searchType })
                    });
                
                    if (!response.ok) throw new Error("Failed to load recipe");
                    console.log("Groq raw response: ", response);

                    data = await response.json();
                    console.log("Groq JSON: ", data);
                    
                    recipeData = data.choices[0].message?.content;
                
                    try {
                        test = JSON.parse(recipeData);
                        passed = test.every(recipe =>
                            recipe.title &&
                            recipe.description &&
                            recipe.difficulty &&
                            recipe.prep_time &&
                            recipe.ingredients &&
                            recipe.instructions
                        );
                    } catch (err) {
                        console.error("Failed to parse JSON:", err);
                        passed = false;
                    }
                
                    apiUses++;
                    retryCount++;
                    console.log(`API used (attempt ${retryCount})`);
                
                } while (!passed && retryCount < maxRetries);
                
                if (!passed) {
                    console.error("Failed to get valid recipe after max retries.");
                    throw new Error("Failed to get valid recipe after max retries.");
                } else {
                    console.log("Recipe passed validation.");
                }
            }
            
            localStorage.setItem("recipeData", recipeData);
            window.location.href = "./recipe";
    
        } catch (err) {
            console.error("Error fetching recipe:", err);
            alert("Could not load recipe. Please try again.");
            overlay.style.display = "none";

            if (originalFavicon) document.head.appendChild(originalFavicon);
            spinningFavicon.remove();
        }
    });

    const label = document.getElementById("prompt-label");
    let currentIndex = 0;
    let shuffledPrompts = [];

    // Fisher-Yates shuffle
    function shuffle(array) {
        const a = array.slice();
        for (let i = a.length-1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function rotatePrompt() {
        if (currentIndex >= shuffledPrompts.length) {
        shuffledPrompts = shuffle(prompts);
        currentIndex = 0;
        }

        label.style.opacity = 0;
        setTimeout(() => {
            label.textContent = shuffledPrompts[currentIndex++];
            label.style.opacity = 1;
        }, 300);
    }
    
    shuffledPrompts = shuffle(prompts);
    rotatePrompt(); 
    setInterval(rotatePrompt, 5000); // 5 seconds

    label.addEventListener('click', () => {
        searchInput.value = label.innerText;
    });
});

