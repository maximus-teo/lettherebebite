/* RECIPE DETAILS PAGE
    Copy: copy recipe name to clipboard
    Share: pre-made message - I got a personalised recipe for {title} from Let There Be Bite! {3 emojis} Check it out here: {link to main page}
    Download: download the pdf of this screen
*/
let selectedRecipe;

document.addEventListener('DOMContentLoaded', () => {
    
    if (window.innerWidth <= 768) {
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
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return;
    }

    let blackStars = "";
    let whiteStars = "";
    for (let i = 0; i < selectedRecipe.difficulty; i++) blackStars += "★";
    for (let i = 0; i < (5-selectedRecipe.difficulty); i++) whiteStars += "☆";

    let recipeText = document.getElementById("recipe-text");
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

    //localStorage.setItem(selectedRecipe.url_name, recipeText.innerHTML)

    document.getElementById("copy-button").addEventListener('click', () => {
        navigator.clipboard.writeText(recipeText.innerText).then(() => {
            alert("Copied recipe to clipboard!");
        }, () => {
            alert("Error copying to clipboard.");
        });
    });
});