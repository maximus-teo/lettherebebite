/* RECIPE DETAILS PAGE
    Copy: copy recipe name to clipboard
    Share: pre-made message - I got a personalised recipe for {title} from Let There Be Bite! {3 emojis} Check it out here: {link to main page}
    Download: download the pdf of this screen
*/
let selectedRecipe;
let recipeText;
let copyButton;
let msg;

document.addEventListener('DOMContentLoaded', () => {
    recipeText = document.getElementById("recipe-text");
    copyButton = document.getElementById("copy-button");
    msg = document.getElementById("share-message");
    
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

});

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
