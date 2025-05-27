/* RECIPE DETAILS PAGE

*/
let selectedRecipe;
let recipeText;
let copyButton;
let msg;

document.addEventListener('DOMContentLoaded', () => {
    recipeText = document.getElementById("recipe-text");
    copyButton = document.getElementById("copy-button");
    msg = document.getElementById("share-message");
    
    if (window.outerWidth <= 768) {
        let prevScrollpos = window.pageYOffset;
        window.onscroll = function() {
            var currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos) { // scrolling up
                document.querySelector(".side-buttons").style.top = "75%";
            } else { // scrolling down
                document.querySelector(".side-buttons").style.top = "100%";
            }
            prevScrollpos = currentScrollPos;
        };
    }

    try {
        selectedRecipe = JSON.parse(localStorage.getItem("selectedRecipe"));
        console.log("selectedRecipe:", selectedRecipe);
        console.log("apiMode:", localStorage.getItem("apiMode"))
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return;
    }

    if (localStorage.getItem("apiMode").includes("groq")) {
        let blackStars = "";
        let whiteStars = "";
        for (let i = 0; i < selectedRecipe.difficulty; i++) blackStars += "★";
        for (let i = 0; i < (5-selectedRecipe.difficulty); i++) whiteStars += "☆";

        recipeText.innerHTML =
        `
        <h1>${selectedRecipe.title}</h1>
        <p><em>${selectedRecipe.description}</em></p>
        <div class="tag-container">
            ${selectedRecipe.cuisine ? `
                <div class="recipe-tags">
                    <p><strong>Cuisine: </strong>${selectedRecipe.cuisine}</p>
                </div>` : ``}
            <div class="recipe-tags">
                <p><strong>Difficulty: </strong>${blackStars}${whiteStars}</p>
            </div>
            <div class="recipe-tags">
                <p><strong>Prep Time: </strong>${selectedRecipe.prep_time}</p>
            </div>
        </div>
        <h2>Ingredients</h2>
        <ul>
            ${selectedRecipe.ingredients.map(i => `
                <li>
                    <label class="custom-checkbox">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                        ${i}
                    </label>
                </li>
                `).join('')}</ul>
        <h2>Instructions</h2>
        <ol>
            ${selectedRecipe.instructions.map(s => `<li>${s}</li>`).join('')}
        </ol>
        <hr>\
        `;
    } else if (localStorage.getItem("apiMode").includes("spoonacular")) {
        // if result is sourced from spoonacular, fetch ingredients by using its recipe ID
        try {
            const response = fetch(`${backendURL}/api/spoon-ingredients-id`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedRecipe.id })
            });

            console.log("Spoonacular (ingredients-id) raw response: ", response);
            if (!response.ok) throw new Error("Failed to load recipe");

            const data = response.json();
            console.log(data);
            localStorage.setItem("extendedIngredients", JSON.stringify(data.extendedIngredients));
            console.log(localStorage.getItem("extendedIngredients"));
        } catch (err) {
            console.log(err);
        }

        recipeText.innerHTML =
        `
        <h1>${selectedRecipe.title}</h1>
        <p><em>${selectedRecipe.summary.split('. ')[0]}.</em></p>
        <div class="tag-container">
            ${selectedRecipe.cuisines.length > 0 ? `
            <div class="recipe-tags">
                <p><strong>Cuisine: </strong>${selectedRecipe.cuisines}</p>
            </div>` : ``}
            ${selectedRecipe.readyInMinutes ? `
            <div class="recipe-tags">
                <p><strong>Prep Time: </strong>${selectedRecipe.readyInMinutes} minutes</p>
            </div>` : ``}
            ${selectedRecipe.servings ? `
            <div class="recipe-tags">
                <p><strong>Servings: </strong>${selectedRecipe.servings}</p>
            </div>` : ``}
        </div>
        <h2>Ingredients</h2>
        <ul>
            ${selectedRecipe.analyzedInstructions[0].steps[0].ingredients.map(i => `
                <li>
                    <label class="custom-checkbox">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                        ${i.name}
                    </label>
                </li>
                `).join('')}</ul>
        <h2>Instructions</h2>
        <ol>
            ${selectedRecipe.analyzedInstructions[0].steps.map(s => `<li>${s.step}</li>`).join('')}
        </ol>
        ${selectedRecipe.sourceUrl ? `<em><p>Adapted from <a href=${selectedRecipe.sourceUrl}>${selectedRecipe.creditsText.split(' ')[0].toLowerCase()}</a></p></em>` : ``}
        <hr>\
        `;
    }

    if (!localStorage.getItem("dishNutrition") || document.getElementById("nutrition-text").innerHTML !== localStorage.getItem("dishNutrition")) {
        fetchNutrition();
        console.log("api used")
    } else {
        document.getElementById("nutrition-text").innerHTML = localStorage.getItem("dishNutrition");
        console.log("sourced from localStorage")
    }

});

const backendURL = "http://localhost:3000";//"https://lettherebebite.onrender.com";

async function fetchNutrition() {
    console.log("fetchNutrition for:", selectedRecipe.title);
    try {
        let response;
        if (localStorage.getItem("apiMode").includes("groq")) {
            response = await fetch(`${backendURL}/api/spoon-nutrition`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: selectedRecipe.title,
                    servings: 1,
                    ingredients: selectedRecipe.ingredients,
                })
            });
        } else if (localStorage.getItem("apiMode").includes("spoonacular")) {
            console.log("id: ", selectedRecipe.id)
            response = await fetch(`${backendURL}/api/spoon-nutrition-id`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedRecipe.id
                })
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spoonacular API failed: ${errorText}`);
        }
        
        const html = await response.text();
        document.getElementById("nutrition-text").innerHTML = html;
        localStorage.setItem("dishNutrition", html);
    } catch (err) {
        console.log("Error in fetchNutrition(): " + err.message);
    }
}

function copyRecipe() {
    navigator.clipboard.writeText(recipeText.innerText).then(() => {
        copyButton.innerHTML = `
        <i style="margin-left: 10px;" class="fas fa-check"></i>
        <span style="margin: 10px;">Copied!</span>
        `;
        setTimeout(() => {
            copyButton.innerHTML = `
            <i style="margin-left: 10px;" class="fa-regular fa-copy"></i>
            <span style="margin: 10px;">Copy</span>
            `;
        }, 2000);

    }, () => {
        alert("Error copying to clipboard.");
    });
}

function toggleSharePopup() {
    const popup = document.getElementById("share-popup");
    const overlay = document.getElementById("blur-overlay");
    const isVisible = popup.style.display === "block";

    msg.value =
`Check out this AI recipe generator, Let There Be Bite! 😋

I just got a personalised recipe for ${selectedRecipe.title}, only with a simple prompt: "${localStorage.getItem("dishName")}"

Your imagination is your limit 🗣🔥`;

    popup.style.display = isVisible ? "none" : "block";
    overlay.style.display = isVisible ? "none" : "block";
  }
  
  
function shareTo(platform) {
    const url = encodeURIComponent("https://maximus-teo.github.io/lettherebebite");
    const text = encodeURIComponent(`${msg.value}\n\n`);
    let shareURL = "";
  
    switch (platform) {
      case "facebook":
        shareURL = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "whatsapp":
        shareURL = `https://api.whatsapp.com/send?text=${text}${url}`;
        break;
      case "linkedin":
        shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
  
    window.open(shareURL, "_blank", "width=600,height=400");
}

function savePDF() {
    window.print();
}
