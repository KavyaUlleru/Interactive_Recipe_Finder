const searchBtn = document.getElementById('search-btn');
const ingredientInput = document.getElementById('ingredient-input');
const recipesContainer = document.getElementById('recipes');

const API_KEY = "YOUR_API_KEY";

searchBtn.addEventListener('click', () => {
  const ingredients = ingredientInput.value.trim();
  if (!ingredients) {
    alert('Please enter at least one ingredient!');
    return;
  }
  fetchRecipes(ingredients);
});

async function fetchRecipes(ingredients) {
  recipesContainer.innerHTML = "<p>Loading recipes...</p>";
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=12&apiKey=${API_KEY}`
    );
    const data = await response.json();
    displayRecipes(data);
  } catch (error) {
    recipesContainer.innerHTML = "<p>Something went wrong. Please try again.</p>";
    console.error(error);
  }
}

function displayRecipes(recipes) {
  if (recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found. Try different ingredients.</p>";
    return;
  }

  recipesContainer.innerHTML = recipes
    .map(recipe => `
      <div class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.title}">
        <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g,'-')}-${recipe.id}"
             target="_blank" rel="noopener noreferrer">View Recipe</a>
        </div>
      </div>
    `)
    .join('');
}
