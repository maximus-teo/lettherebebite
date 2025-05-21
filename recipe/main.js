/* RECIPE PAGE
*
*/
let allRecipes = [];
let output;
document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem("selectedRecipe"); // refresh selection for recipe
    const dishName = localStorage.getItem("dishName");
    console.log("dishName: ", dishName);

    output = localStorage.getItem("recipeData");
    console.log("recipeData: ", output);
    console.log("API mode: ", localStorage.getItem("apiMode"))
    console.log("recipeData.length: ", output.length)

    const recipeListContainer = document.getElementById("recipe-list");
    const resultsText = document.getElementById("recipe-results");

    try {
        allRecipes = JSON.parse(output);
        console.log("allRecipes: ", allRecipes);
        console.log("First item: ", allRecipes[0]);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return;
    }

    let count = 0;
    
    allRecipes.forEach(recipe => {
        const newItem = document.createElement("button");
        newItem.className = "item";

        if (localStorage.getItem("apiMode") === "groq") {
            let blackStars = "";
            let whiteStars = "";
            for (let i = 0; i < recipe.difficulty; i++) blackStars += "★";
            for (let i = 0; i < (5-recipe.difficulty); i++) whiteStars += "☆";
            newItem.innerHTML =
            `
            <h3>${recipe.title}</h3>
            <p><em>${recipe.description}</em></p>
            <p>${recipe.cuisine ? `<strong>Cuisine: </strong>${recipe.cuisine} | ` : ``}<strong>Difficulty: </strong>${blackStars}${whiteStars} | <strong>Prep Time: </strong>${recipe.prep_time}</p>
            `;
        } else if (localStorage.getItem("apiMode") === "spoonacular") {
            newItem.innerHTML =
            `
            <h3>${recipe.title}</h3>
            <p><em>${recipe.summary.split('. ')[0]}.</em></p>
            <p>${recipe.cuisines.length > 0 ? `<strong>Cuisine: </strong>${recipe.cuisines} | ` : ``}<strong>Prep Time: </strong>${recipe.readyInMinutes} minutes | ${recipe.servings ? `<strong>Servings: </strong> ${recipe.servings}` : ``}</p>
            `;
        }

        newItem.addEventListener('click', () => {
            recipeListContainer.querySelectorAll(".item").forEach(item => {
                item.style.border = "none";
            });
            newItem.style.border = "5px solid #884e01";
            localStorage.setItem("selectedRecipe", JSON.stringify(allRecipes[newItem.value]));
            document.getElementById("view-recipe").disabled = false;
        });
        newItem.value = count; // save index of this recipe for retrieval
        recipeListContainer.appendChild(newItem);
        count++;
    });

    resultsText.innerHTML = `Found ${count} results for "${dishName}"`;

    const viewRecipe = document.getElementById("view-recipe");
    viewRecipe.addEventListener('click', () => {
        if (localStorage.getItem("selectedRecipe") === null) {
            alert("Please select a recipe!");
            return;
        }
        // loading overlay
        const overlay = document.getElementById("loading-overlay");
        overlay.style.display = "flex";

        // tab spinner effect
        const originalFavicon = document.querySelector("link[rel~='icon']");
        const spinningFavicon = document.createElement("link");
        spinningFavicon.rel = "icon";
        spinningFavicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 stroke=%22gray%22 stroke-width=%2210%22 fill=%22none%22 stroke-dasharray=%22250%22 stroke-dashoffset=%22125%22 transform=%22rotate(-90 50 50)%22><animateTransform attributeName=%22transform%22 type=%22rotate%22 from=%220 50 50%22 to=%22360 50 50%22 dur=%221s%22 repeatCount=%22indefinite%22/></circle></svg>";
        document.head.appendChild(spinningFavicon);
        if (originalFavicon) originalFavicon.remove();
    
        window.location.href = "../recipe-details";
    });
});