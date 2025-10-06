/**
 * CulinaryCraft - Core Application Controller
 * Manages pantry state, recipe matching engine, dietary filters,
 * dynamic servings scaler, grocery tracker, kitchen audio timer,
 * favorites, and theme preferences.
 */

(function () {
  'use strict';

  /* ==========================================================================
     Application State
     ========================================================================== */
  const state = {
    // Pantry ingredients
    pantry: JSON.parse(localStorage.getItem('cc_pantry') || '["tomato", "garlic", "pasta", "cheese"]'),

    // Active filters
    searchQuery: '',
    mealType: 'all',
    maxTime: 'all',
    diet: 'all',
    perfectMatchOnly: false,
    sortBy: 'match-desc',
    viewMode: localStorage.getItem('cc_view_mode') || 'grid',

    // Grocery List: [{ id, text, completed, fromRecipe }]
    groceryList: JSON.parse(localStorage.getItem('cc_grocery') || '[]'),

    // Favorite recipe IDs
    favorites: JSON.parse(localStorage.getItem('cc_favorites') || '["rec-01", "rec-03"]'),

    // Active Recipe for Modal
    activeRecipe: null,
    activeServings: 2,

    // Kitchen Timer
    timer: {
      totalSeconds: 0,
      remainingSeconds: 0,
      intervalId: null,
      isRunning: false,
      soundEnabled: true
    },

    // Theme: 'light' or 'dark'
    theme: localStorage.getItem('cc_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

    // Settings
    spoonacularKey: localStorage.getItem('cc_spoonacular_key') || ''
  };

  /* ==========================================================================
     DOM Elements
     ========================================================================== */
  const DOM = {
    // Pantry elements
    ingredientInput: document.getElementById('ingredient-input'),
    addIngredientBtn: document.getElementById('add-ingredient-btn'),
    autocompleteList: document.getElementById('autocomplete-list'),
    pantryTray: document.getElementById('selected-ingredients-tray'),
    pantryCountText: document.getElementById('pantry-count-text'),
    clearPantryBtn: document.getElementById('clear-pantry-btn'),
    surprisePantryBtn: document.getElementById('surprise-pantry-btn'),
    staplesContainer: document.getElementById('staples-pills'),

    // Filters
    recipeSearchInput: document.getElementById('recipe-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    mealTypeSelect: document.getElementById('meal-type-select'),
    timeFilterSelect: document.getElementById('time-filter-select'),
    sortSelect: document.getElementById('sort-select'),
    dietaryPills: document.getElementById('dietary-pills'),
    perfectMatchToggle: document.getElementById('perfect-match-toggle'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Results & Grid
    recipesContainer: document.getElementById('recipes'),
    resultsCount: document.getElementById('results-count'),
    resultsHighlight: document.getElementById('results-highlight'),
    emptyState: document.getElementById('empty-state'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewListBtn: document.getElementById('view-list-btn'),

    // Recipe Detail Modal
    recipeModal: document.getElementById('recipe-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalImage: document.getElementById('modal-image'),
    modalTitle: document.getElementById('modal-recipe-title'),
    modalMatchBadge: document.getElementById('modal-match-badge'),
    modalCuisineBadge: document.getElementById('modal-cuisine-badge'),
    modalMealBadge: document.getElementById('modal-meal-badge'),
    modalCookTime: document.getElementById('modal-cook-time'),
    modalDifficulty: document.getElementById('modal-difficulty'),
    modalCalories: document.getElementById('modal-calories'),
    modalRating: document.getElementById('modal-rating'),
    modalDesc: document.getElementById('modal-description'),
    modalProtein: document.getElementById('modal-protein'),
    modalCarbs: document.getElementById('modal-carbs'),
    modalFat: document.getElementById('modal-fat'),
    modalServingsCount: document.getElementById('modal-servings-count'),
    servingsMinusBtn: document.getElementById('servings-minus-btn'),
    servingsPlusBtn: document.getElementById('servings-plus-btn'),
    modalHaveIngredients: document.getElementById('modal-have-ingredients'),
    modalMissingIngredients: document.getElementById('modal-missing-ingredients'),
    modalHaveCount: document.getElementById('modal-have-count'),
    modalMissingCount: document.getElementById('modal-missing-count'),
    modalAddAllMissingBtn: document.getElementById('modal-add-all-missing-btn'),
    modalInstructions: document.getElementById('modal-instructions'),
    modalWasteTip: document.getElementById('modal-waste-tip'),
    modalSubstitutionsWrap: document.getElementById('modal-substitutions-wrap'),
    modalFavoriteBtn: document.getElementById('modal-favorite-btn'),
    modalFavoriteIcon: document.getElementById('modal-favorite-icon'),
    modalFavoriteText: document.getElementById('modal-favorite-text'),
    modalPrintBtn: document.getElementById('modal-print-btn'),
    modalStartTimerBtn: document.getElementById('modal-start-timer-btn'),

    // Grocery Drawer
    groceryDrawer: document.getElementById('grocery-drawer'),
    groceryToggleBtn: document.getElementById('grocery-toggle-btn'),
    groceryCloseBtn: document.getElementById('grocery-close-btn'),
    groceryCountBadge: document.getElementById('grocery-count-badge'),
    groceryCustomInput: document.getElementById('grocery-custom-input'),
    groceryAddCustomBtn: document.getElementById('grocery-add-custom-btn'),
    groceryItemsList: document.getElementById('grocery-items-list'),
    groceryEmpty: document.getElementById('grocery-empty'),
    groceryCopyBtn: document.getElementById('grocery-copy-btn'),
    groceryClearCompletedBtn: document.getElementById('grocery-clear-completed-btn'),
    groceryClearAllBtn: document.getElementById('grocery-clear-all-btn'),

    // Favorites Drawer
    favoritesDrawer: document.getElementById('favorites-drawer'),
    favoritesToggleBtn: document.getElementById('favorites-toggle-btn'),
    favoritesCloseBtn: document.getElementById('favorites-close-btn'),
    favoritesCountBadge: document.getElementById('favorites-count-badge'),
    favoritesList: document.getElementById('favorites-list'),
    favoritesEmpty: document.getElementById('favorites-empty'),

    // Timer Modal
    timerModal: document.getElementById('timer-modal'),
    timerToggleBtn: document.getElementById('timer-toggle-btn'),
    timerCloseBtn: document.getElementById('timer-close-btn'),
    timerDisplay: document.getElementById('timer-display'),
    timerLabel: document.getElementById('timer-label'),
    timerStartBtn: document.getElementById('timer-start-btn'),
    timerPauseBtn: document.getElementById('timer-pause-btn'),
    timerResetBtn: document.getElementById('timer-reset-btn'),
    timerPresetBtns: document.querySelectorAll('.preset-btn'),
    timerSoundCheckbox: document.getElementById('timer-sound-checkbox'),
    activeTimerIndicator: document.getElementById('active-timer-indicator'),

    // Waste Guide & Settings Modals
    guideModal: document.getElementById('guide-modal'),
    guideToggleBtn: document.getElementById('guide-toggle-btn'),
    guideCloseBtn: document.getElementById('guide-close-btn'),
    bannerTipsBtn: document.getElementById('banner-tips-btn'),

    settingsModal: document.getElementById('settings-modal'),
    settingsToggleBtn: document.getElementById('settings-toggle-btn'),
    settingsCloseBtn: document.getElementById('settings-close-btn'),
    spoonacularKeyInput: document.getElementById('spoonacular-key-input'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetPantryDataBtn: document.getElementById('reset-pantry-data-btn'),

    // Theme Toggle & Toasts
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    toastContainer: document.getElementById('toast-container')
  };

  /* ==========================================================================
     Helper Utilities
     ========================================================================== */

  // Audio synthesizer for hands-free kitchen chime using Web Audio API
  function playCookingChime() {
    if (!state.timer.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Pleasant 3-note chime chord: C5 (523Hz), E5 (659Hz), G5 (784Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.0);
      });
    } catch (e) {
      console.warn('Web Audio not allowed or unavailable:', e);
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'warm' ? 'toast-warm' : type === 'danger' ? 'toast-danger' : ''}`;

    let icon = '✨';
    if (type === 'warm') icon = '🛒';
    if (type === 'danger') icon = '⚠️';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Ingredient Normalization & Stemming for Smart Matching
  function normalizeIngredient(str) {
    if (!str) return '';
    let clean = str.toLowerCase().trim();
    // remove punctuation
    clean = clean.replace(/[^\w\s]/g, '');
    // simple singularization rules
    if (clean.endsWith('ies')) {
      clean = clean.slice(0, -3) + 'y';
    } else if (clean.endsWith('es') && !clean.endsWith('cheese')) {
      clean = clean.slice(0, -2);
    } else if (clean.endsWith('s') && !clean.endsWith('ss') && clean !== 'beans' && clean !== 'oats' && clean !== 'peas') {
      clean = clean.slice(0, -1);
    }
    return clean;
  }

  // Check if a recipe ingredient matches any item currently in pantry
  function checkIngredientMatch(recipeIng, pantryItems) {
    const ingNorm = normalizeIngredient(recipeIng.name);
    const ingOriginalNorm = normalizeIngredient(recipeIng.original || '');

    return pantryItems.some(p => {
      const pNorm = normalizeIngredient(p);
      if (!pNorm) return false;

      // Exact or substring match
      if (ingNorm.includes(pNorm) || pNorm.includes(ingNorm)) return true;
      if (ingOriginalNorm.includes(pNorm)) return true;

      // Common Culinary Aliases / Synonyms
      const synonyms = {
        'egg': ['eggs'],
        'pasta': ['spaghetti', 'linguine', 'penne', 'macaroni', 'noodle', 'noodles', 'fusilli'],
        'onion': ['onions', 'shallot', 'scallion', 'green onion'],
        'cheese': ['cheddar', 'mozzarella', 'parmesan', 'pecorino', 'feta'],
        'cream': ['heavy cream', 'whipping cream'],
        'pepper': ['bell pepper', 'chili', 'capsicum'],
        'bread': ['baguette', 'sourdough', 'tortilla', 'loaf'],
        'chicken': ['chicken breast', 'chicken thigh']
      };

      for (const [key, aliases] of Object.entries(synonyms)) {
        if (pNorm === key && aliases.some(a => ingNorm.includes(a))) return true;
        if (aliases.includes(pNorm) && (ingNorm.includes(key) || aliases.some(a => ingNorm.includes(a)))) return true;
      }

      return false;
    });
  }

  // Calculate Match Score for a recipe
  function calculateRecipeMatch(recipe, pantry) {
    const totalIngredients = recipe.ingredients.length;
    if (totalIngredients === 0) return { matchPercent: 0, have: [], need: [] };

    const have = [];
    const need = [];

    recipe.ingredients.forEach(ing => {
      if (checkIngredientMatch(ing, pantry)) {
        have.push(ing);
      } else {
        need.push(ing);
      }
    });

    const matchPercent = pantry.length === 0 ? 0 : Math.round((have.length / totalIngredients) * 100);

    return {
      matchPercent,
      have,
      need,
      missingCount: need.length
    };
  }

  /* ==========================================================================
     Pantry Management
     ========================================================================== */

  function savePantry() {
    localStorage.setItem('cc_pantry', JSON.stringify(state.pantry));
    updatePantryUI();
    renderRecipes();
  }

  function addPantryIngredient(name) {
    if (!name) return;
    const clean = name.trim().toLowerCase();
    if (!clean) return;

    if (!state.pantry.includes(clean)) {
      state.pantry.push(clean);
      savePantry();
      showToast(`Added "${clean}" to your pantry!`, 'success');
    } else {
      showToast(`"${clean}" is already in your pantry.`, 'info');
    }
  }

  function removePantryIngredient(name) {
    state.pantry = state.pantry.filter(i => i !== name);
    savePantry();
  }

  function updatePantryUI() {
    // Render selected chips
    if (DOM.pantryTray) {
      if (state.pantry.length === 0) {
        DOM.pantryTray.innerHTML = `<span class="tray-placeholder">Your pantry is empty. Click any quick staple below or type ingredients above!</span>`;
      } else {
        DOM.pantryTray.innerHTML = state.pantry
          .map(item => `
            <span class="ingredient-chip">
              <span>${capitalize(item)}</span>
              <button class="chip-remove" data-item="${escapeHtml(item)}" aria-label="Remove ${escapeHtml(item)}">×</button>
            </span>
          `)
          .join('');

        // Attach chip delete events
        DOM.pantryTray.querySelectorAll('.chip-remove').forEach(btn => {
          btn.addEventListener('click', () => {
            const item = btn.getAttribute('data-item');
            removePantryIngredient(item);
          });
        });
      }
    }

    // Update count text
    if (DOM.pantryCountText) {
      const count = state.pantry.length;
      DOM.pantryCountText.textContent = `${count} ingredient${count === 1 ? '' : 's'} in your pantry`;
    }

    // Highlight active staples pills
    if (DOM.staplesContainer) {
      DOM.staplesContainer.querySelectorAll('.staple-pill').forEach(pill => {
        const item = pill.getAttribute('data-staple').toLowerCase();
        if (state.pantry.includes(item)) {
          pill.classList.add('in-pantry');
        } else {
          pill.classList.remove('in-pantry');
        }
      });
    }
  }

  function initStaplesPills() {
    if (!DOM.staplesContainer || !window.COMMON_PANTRY_INGREDIENTS) return;
    DOM.staplesContainer.innerHTML = window.COMMON_PANTRY_INGREDIENTS
      .slice(0, 16)
      .map(staple => `
        <button class="staple-pill ${state.pantry.includes(staple.name.toLowerCase()) ? 'in-pantry' : ''}" data-staple="${escapeHtml(staple.name.toLowerCase())}">
          <span>${staple.icon}</span>
          <span>${staple.name}</span>
        </button>
      `)
      .join('');

    DOM.staplesContainer.querySelectorAll('.staple-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const staple = btn.getAttribute('data-staple');
        if (state.pantry.includes(staple)) {
          removePantryIngredient(staple);
        } else {
          addPantryIngredient(staple);
        }
      });
    });
  }

  // Autocomplete Suggestions
  function handleAutocompleteInput() {
    const val = DOM.ingredientInput.value.trim().toLowerCase();
    if (!val || !window.COMMON_PANTRY_INGREDIENTS) {
      DOM.autocompleteList.classList.add('hidden');
      return;
    }

    const matches = window.COMMON_PANTRY_INGREDIENTS.filter(item =>
      item.name.toLowerCase().includes(val) && !state.pantry.includes(item.name.toLowerCase())
    );

    if (matches.length === 0) {
      DOM.autocompleteList.classList.add('hidden');
      return;
    }

    DOM.autocompleteList.innerHTML = matches
      .map(item => `
        <div class="autocomplete-item" data-value="${escapeHtml(item.name)}">
          <div class="autocomplete-item-left">
            <span>${item.icon}</span>
            <span>${highlightMatch(item.name, val)}</span>
          </div>
          <span class="autocomplete-category">${item.category}</span>
        </div>
      `)
      .join('');

    DOM.autocompleteList.classList.remove('hidden');

    DOM.autocompleteList.querySelectorAll('.autocomplete-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const value = itemEl.getAttribute('data-value');
        addPantryIngredient(value);
        DOM.ingredientInput.value = '';
        DOM.autocompleteList.classList.add('hidden');
        DOM.ingredientInput.focus();
      });
    });
  }

  /* ==========================================================================
     Recipe Filtering, Sorting & Rendering
     ========================================================================== */

  function getProcessedRecipes() {
    const rawRecipes = window.RECIPES_DATA || [];

    // 1. Calculate matching scores
    const withScores = rawRecipes.map(recipe => {
      const match = calculateRecipeMatch(recipe, state.pantry);
      return {
        ...recipe,
        matchPercent: match.matchPercent,
        haveIngredients: match.have,
        missingIngredients: match.need,
        missingCount: match.missingCount
      };
    });

    // 2. Filter by Search Query
    let filtered = withScores.filter(r => {
      if (!state.searchQuery) return true;
      const q = state.searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
      );
    });

    // 3. Filter by Meal Type
    if (state.mealType !== 'all') {
      filtered = filtered.filter(r => r.mealType === state.mealType);
    }

    // 4. Filter by Max Cooking Time
    if (state.maxTime !== 'all') {
      const maxMinutes = parseInt(state.maxTime, 10);
      filtered = filtered.filter(r => r.cookTime <= maxMinutes);
    }

    // 5. Filter by Dietary Preference
    if (state.diet !== 'all') {
      filtered = filtered.filter(r => r.diet && r.diet.includes(state.diet));
    }

    // 6. Filter by 100% Perfect Match Only
    if (state.perfectMatchOnly) {
      filtered = filtered.filter(r => r.matchPercent === 100);
    }

    // 7. Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'match-desc':
          if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
          return a.missingCount - b.missingCount;
        case 'missing-asc':
          if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
          return b.matchPercent - a.matchPercent;
        case 'time-asc':
          return a.cookTime - b.cookTime;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'calories-asc':
          return a.calories - b.calories;
        default:
          return b.matchPercent - a.matchPercent;
      }
    });

    return filtered;
  }

  function renderRecipes() {
    if (!DOM.recipesContainer) return;
    const recipes = getProcessedRecipes();

    // Update results meta bar
    DOM.resultsCount.textContent = `Showing ${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`;

    const perfectCount = recipes.filter(r => r.matchPercent === 100).length;
    if (perfectCount > 0) {
      DOM.resultsHighlight.textContent = `🎉 ${perfectCount} ready right now (0 missing items)!`;
      DOM.resultsHighlight.classList.remove('hidden');
    } else {
      DOM.resultsHighlight.classList.add('hidden');
    }

    // Empty state handling
    if (recipes.length === 0) {
      DOM.recipesContainer.innerHTML = '';
      DOM.emptyState.classList.remove('hidden');
      return;
    }
    DOM.emptyState.classList.add('hidden');

    // Render Cards
    DOM.recipesContainer.innerHTML = recipes
      .map(recipe => {
        const isFav = state.favorites.includes(recipe.id);
        const matchClass =
          recipe.matchPercent === 100
            ? 'match-perfect'
            : recipe.matchPercent >= 50
            ? 'match-high'
            : 'match-low';

        const matchLabel =
          state.pantry.length === 0
            ? `${recipe.ingredients.length} items`
            : recipe.matchPercent === 100
            ? '100% Ready!'
            : `${recipe.matchPercent}% Match (${recipe.missingCount} missing)`;

        const haveNames = recipe.haveIngredients.map(i => i.name).slice(0, 4).join(', ');
        const needNames = recipe.missingIngredients.map(i => i.name).slice(0, 3).join(', ');

        return `
          <article class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="card-media-wrap">
              <img src="${recipe.image}" alt="${escapeHtml(recipe.title)}" class="card-img" loading="lazy" />
              <div class="match-badge ${matchClass}">
                <span>${recipe.matchPercent === 100 ? '⭐' : '🥗'}</span>
                <span>${matchLabel}</span>
              </div>
              <button class="card-fav-btn" data-fav-id="${recipe.id}" title="${isFav ? 'Remove favorite' : 'Save favorite'}" aria-label="Favorite">
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>

            <div class="card-body">
              <div class="card-tags">
                <span class="meta-tag">${recipe.cuisine}</span>
                <span class="meta-tag">${recipe.mealType}</span>
                ${recipe.diet && recipe.diet[0] ? `<span class="meta-tag">${recipe.diet[0]}</span>` : ''}
              </div>

              <h3 class="card-title">${escapeHtml(recipe.title)}</h3>

              <div class="card-meta-row">
                <span class="meta-item">⏱️ ${recipe.cookTime}m</span>
                <span class="meta-item">⚡ ${recipe.difficulty}</span>
                <span class="meta-item">🥗 ${recipe.calories} kcal</span>
                <span class="meta-item">⭐ ${recipe.rating}</span>
              </div>

              <!-- Pantry Breakdown -->
              <div class="ingredient-breakdown">
                <div class="breakdown-row">
                  <span class="breakdown-icon">✅</span>
                  <div>
                    <span class="breakdown-label have">In pantry:</span>
                    <span class="breakdown-items">${haveNames || 'None'}</span>
                  </div>
                </div>
                <div class="breakdown-row">
                  <span class="breakdown-icon">🛒</span>
                  <div>
                    <span class="breakdown-label need">Missing:</span>
                    <span class="breakdown-items">${needNames || 'None! Ready to cook'}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn btn-primary btn-cook" data-cook-id="${recipe.id}">
                  <span>View Recipe & Cook</span>
                </button>
                ${
                  recipe.missingIngredients.length > 0
                    ? `<button class="btn-add-grocery" data-grocery-recipe="${recipe.id}" title="Add missing items to grocery list" aria-label="Add missing to grocery list">🛒+</button>`
                    : ''
                }
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // Attach card event listeners
    DOM.recipesContainer.querySelectorAll('.btn-cook').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = btn.getAttribute('data-cook-id');
        openRecipeModal(id);
      });
    });

    DOM.recipesContainer.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fav-id');
        toggleFavorite(id);
      });
    });

    DOM.recipesContainer.querySelectorAll('.btn-add-grocery').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-grocery-recipe');
        addRecipeMissingToGrocery(id);
      });
    });
  }

  /* ==========================================================================
     Recipe Detail Modal & Dynamic Servings Scaler
     ========================================================================== */

  function openRecipeModal(recipeId) {
    const recipe = (window.RECIPES_DATA || []).find(r => r.id === recipeId);
    if (!recipe) return;

    state.activeRecipe = recipe;
    state.activeServings = recipe.servings;

    const match = calculateRecipeMatch(recipe, state.pantry);

    // Populate Hero & Badges
    DOM.modalImage.src = recipe.image;
    DOM.modalImage.alt = recipe.title;
    DOM.modalTitle.textContent = recipe.title;
    DOM.modalCuisineBadge.textContent = recipe.cuisine;
    DOM.modalMealBadge.textContent = recipe.mealType;

    const matchClass =
      match.matchPercent === 100
        ? 'match-perfect'
        : match.matchPercent >= 50
        ? 'match-high'
        : 'match-low';
    DOM.modalMatchBadge.className = `match-badge ${matchClass}`;
    DOM.modalMatchBadge.textContent =
      match.matchPercent === 100 ? '100% Ready!' : `${match.matchPercent}% Match`;

    // Populate Stats
    DOM.modalCookTime.textContent = `${recipe.cookTime} mins`;
    DOM.modalDifficulty.textContent = recipe.difficulty;
    DOM.modalCalories.textContent = `${recipe.calories} kcal`;
    DOM.modalRating.textContent = `${recipe.rating} (${recipe.reviewsCount} reviews)`;
    DOM.modalDesc.textContent = recipe.description;

    // Macros
    DOM.modalProtein.textContent = recipe.macros.protein;
    DOM.modalCarbs.textContent = recipe.macros.carbs;
    DOM.modalFat.textContent = recipe.macros.fat;

    // Servings Stepper
    DOM.modalServingsCount.textContent = state.activeServings;

    // Render scaled ingredients
    renderModalIngredients();

    // Step by step instructions with checkable steps & in-step timers
    DOM.modalInstructions.innerHTML = recipe.instructions
      .map((step, idx) => {
        // Look for duration like "10 minutes" or "5-7 minutes"
        const timeMatch = step.match(/(\d+)(?:-(\d+))?\s*(?:minutes|minute|mins|min)/i);
        let timerBtnHtml = '';
        if (timeMatch) {
          const minutes = parseInt(timeMatch[2] || timeMatch[1], 10);
          timerBtnHtml = `
            <button class="step-timer-btn" data-minutes="${minutes}" title="Start ${minutes}-minute timer">
              ⏱️ Start ${minutes}m Timer
            </button>
          `;
        }

        return `
          <li class="instruction-step" data-step-index="${idx}">
            <span class="step-number">${idx + 1}</span>
            <div class="step-content">
              <div class="step-text">${step}</div>
              ${timerBtnHtml}
            </div>
          </li>
        `;
      })
      .join('');

    // In-step timer button handlers
    DOM.modalInstructions.querySelectorAll('.step-timer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-minutes'), 10);
        setAndStartTimer(mins * 60, `Recipe Step Timer (${mins}m)`);
        showToast(`Timer set for ${mins} minutes!`, 'success');
      });
    });

    // Step completion toggle
    DOM.modalInstructions.querySelectorAll('.instruction-step').forEach(stepItem => {
      stepItem.addEventListener('click', e => {
        if (e.target.closest('.step-timer-btn')) return;
        stepItem.classList.toggle('done');
      });
    });

    // Chef Zero-Waste Tip & Substitutions
    DOM.modalWasteTip.textContent = recipe.wasteReductionTip;

    if (window.INGREDIENT_SUBSTITUTIONS) {
      const subEntries = Object.entries(window.INGREDIENT_SUBSTITUTIONS).slice(0, 3);
      DOM.modalSubstitutionsWrap.innerHTML = `
        <strong>Common Pantry Substitutions:</strong>
        <ul style="margin-top:6px; list-style: disc; padding-left: 20px;">
          ${subEntries.map(([k, v]) => `<li><em>${capitalize(k)}:</em> ${v}</li>`).join('')}
        </ul>
      `;
    }

    // Modal Favorite Button state
    updateModalFavButton();

    DOM.recipeModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function renderModalIngredients() {
    if (!state.activeRecipe) return;
    const recipe = state.activeRecipe;
    const ratio = state.activeServings / recipe.servings;

    const match = calculateRecipeMatch(recipe, state.pantry);

    // Format quantity cleanly
    const formatAmount = (base) => {
      if (!base) return '';
      const scaled = base * ratio;
      if (Math.abs(scaled - Math.round(scaled)) < 0.05) {
        return Math.round(scaled);
      }
      return scaled.toFixed(1).replace(/\.0$/, '');
    };

    DOM.modalHaveCount.textContent = match.have.length;
    DOM.modalMissingCount.textContent = match.need.length;

    // In Pantry Items
    DOM.modalHaveIngredients.innerHTML = match.have
      .map((ing, idx) => `
        <li class="checklist-item">
          <input type="checkbox" id="have-ing-${idx}" checked />
          <label for="have-ing-${idx}">
            <strong>${formatAmount(ing.amount)} ${ing.unit}</strong> ${capitalize(ing.name)}
          </label>
        </li>
      `)
      .join('');

    // Missing Items
    DOM.modalMissingIngredients.innerHTML = match.need
      .map((ing, idx) => `
        <li class="checklist-item">
          <input type="checkbox" id="need-ing-${idx}" />
          <label for="need-ing-${idx}">
            <strong>${formatAmount(ing.amount)} ${ing.unit}</strong> ${capitalize(ing.name)}
          </label>
        </li>
      `)
      .join('');

    // Checkbox toggles for strikethrough
    DOM.recipeModal.querySelectorAll('.checklist-item input').forEach(box => {
      box.addEventListener('change', () => {
        box.closest('.checklist-item').classList.toggle('checked', box.checked);
      });
    });
  }

  function updateModalFavButton() {
    if (!state.activeRecipe) return;
    const isFav = state.favorites.includes(state.activeRecipe.id);
    DOM.modalFavoriteIcon.textContent = isFav ? '❤️' : '🤍';
    DOM.modalFavoriteText.textContent = isFav ? 'Saved to Favorites' : 'Save to Favorites';
  }

  function closeRecipeModal() {
    DOM.recipeModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Grocery Shopping List System
     ========================================================================== */

  function saveGrocery() {
    localStorage.setItem('cc_grocery', JSON.stringify(state.groceryList));
    updateGroceryUI();
  }

  function addGroceryItem(text, fromRecipe = '') {
    if (!text) return;
    const clean = text.trim();
    if (!clean) return;

    // Prevent duplicates
    const exists = state.groceryList.some(item => item.text.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      state.groceryList.push({
        id: 'groc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        text: clean,
        completed: false,
        fromRecipe: fromRecipe
      });
      saveGrocery();
    }
  }

  function addRecipeMissingToGrocery(recipeId) {
    const recipe = (window.RECIPES_DATA || []).find(r => r.id === recipeId);
    if (!recipe) return;

    const match = calculateRecipeMatch(recipe, state.pantry);
    if (match.need.length === 0) {
      showToast('You already have all ingredients for this recipe!', 'info');
      return;
    }

    let addedCount = 0;
    match.need.forEach(ing => {
      const itemDesc = `${ing.name} (${recipe.title})`;
      const exists = state.groceryList.some(g => g.text.toLowerCase().includes(ing.name.toLowerCase()));
      if (!exists) {
        addGroceryItem(`${ing.amount} ${ing.unit} ${ing.name}`.trim(), recipe.title);
        addedCount++;
      }
    });

    showToast(`Added ${addedCount} missing ingredients to Grocery List!`, 'warm');
    openGroceryDrawer();
  }

  function updateGroceryUI() {
    if (!DOM.groceryItemsList) return;

    DOM.groceryCountBadge.textContent = state.groceryList.length;

    if (state.groceryList.length === 0) {
      DOM.groceryItemsList.innerHTML = '';
      DOM.groceryEmpty.classList.remove('hidden');
      return;
    }

    DOM.groceryEmpty.classList.add('hidden');
    DOM.groceryItemsList.innerHTML = state.groceryList
      .map(item => `
        <li class="grocery-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
          <label class="grocery-item-left">
            <input type="checkbox" ${item.completed ? 'checked' : ''} />
            <span>${escapeHtml(item.text)}</span>
          </label>
          <button class="grocery-item-delete" title="Delete item">✕</button>
        </li>
      `)
      .join('');

    DOM.groceryItemsList.querySelectorAll('.grocery-item').forEach(li => {
      const id = li.getAttribute('data-id');
      const checkbox = li.querySelector('input[type="checkbox"]');
      const delBtn = li.querySelector('.grocery-item-delete');

      checkbox.addEventListener('change', () => {
        const item = state.groceryList.find(g => g.id === id);
        if (item) {
          item.completed = checkbox.checked;
          saveGrocery();
        }
      });

      delBtn.addEventListener('click', () => {
        state.groceryList = state.groceryList.filter(g => g.id !== id);
        saveGrocery();
      });
    });
  }

  function openGroceryDrawer() {
    DOM.groceryDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeGroceryDrawer() {
    DOM.groceryDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Saved Favorites System
     ========================================================================== */

  function saveFavorites() {
    localStorage.setItem('cc_favorites', JSON.stringify(state.favorites));
    updateFavoritesUI();
    renderRecipes();
  }

  function toggleFavorite(recipeId) {
    if (state.favorites.includes(recipeId)) {
      state.favorites = state.favorites.filter(id => id !== recipeId);
      showToast('Removed from favorites', 'info');
    } else {
      state.favorites.push(recipeId);
      showToast('Added to saved favorites! ❤️', 'success');
    }
    saveFavorites();
    updateModalFavButton();
  }

  function updateFavoritesUI() {
    if (!DOM.favoritesList) return;
    DOM.favoritesCountBadge.textContent = state.favorites.length;

    const favRecipes = (window.RECIPES_DATA || []).filter(r => state.favorites.includes(r.id));

    if (favRecipes.length === 0) {
      DOM.favoritesList.innerHTML = '';
      DOM.favoritesEmpty.classList.remove('hidden');
      return;
    }

    DOM.favoritesEmpty.classList.add('hidden');
    DOM.favoritesList.innerHTML = favRecipes
      .map(r => `
        <li class="favorite-item" data-fav-recipe="${r.id}">
          <img src="${r.image}" alt="${escapeHtml(r.title)}" class="fav-thumb" />
          <div class="fav-info">
            <h4 class="fav-title">${escapeHtml(r.title)}</h4>
            <div class="fav-meta">⏱️ ${r.cookTime}m • 🥗 ${r.calories} kcal • ⭐ ${r.rating}</div>
          </div>
          <button class="fav-remove-btn" data-remove-fav="${r.id}" title="Remove from favorites">✕</button>
        </li>
      `)
      .join('');

    DOM.favoritesList.querySelectorAll('.favorite-item').forEach(itemEl => {
      itemEl.addEventListener('click', e => {
        if (e.target.closest('.fav-remove-btn')) return;
        const id = itemEl.getAttribute('data-fav-recipe');
        closeFavoritesDrawer();
        openRecipeModal(id);
      });
    });

    DOM.favoritesList.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-remove-fav');
        toggleFavorite(id);
      });
    });
  }

  function openFavoritesDrawer() {
    DOM.favoritesDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeFavoritesDrawer() {
    DOM.favoritesDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Kitchen Cooking Timer
     ========================================================================== */

  function formatTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerUI() {
    if (!DOM.timerDisplay) return;
    DOM.timerDisplay.textContent = formatTimerDisplay(state.timer.remainingSeconds);

    if (state.timer.isRunning) {
      DOM.timerLabel.textContent = 'Cooking in Progress...';
      DOM.timerStartBtn.disabled = true;
      DOM.timerPauseBtn.disabled = false;
      DOM.activeTimerIndicator.classList.remove('hidden');
    } else {
      DOM.timerStartBtn.disabled = state.timer.remainingSeconds === 0;
      DOM.timerPauseBtn.disabled = true;
      if (state.timer.remainingSeconds === 0) {
        DOM.timerLabel.textContent = 'Timer Ready';
        DOM.activeTimerIndicator.classList.add('hidden');
      } else {
        DOM.timerLabel.textContent = 'Paused';
      }
    }
  }

  function setAndStartTimer(seconds, label = 'Cooking Timer') {
    state.timer.totalSeconds = seconds;
    state.timer.remainingSeconds = seconds;
    startTimer();
    openTimerModal();
  }

  function startTimer() {
    if (state.timer.remainingSeconds <= 0) return;
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);

    state.timer.isRunning = true;
    updateTimerUI();

    state.timer.intervalId = setInterval(() => {
      state.timer.remainingSeconds--;
      if (state.timer.remainingSeconds <= 0) {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        state.timer.remainingSeconds = 0;
        updateTimerUI();
        playCookingChime();
        showToast('🔔 Cooking Timer Finished! Check your dish!', 'warm');
      } else {
        updateTimerUI();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    updateTimerUI();
  }

  function resetTimer() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    state.timer.remainingSeconds = 0;
    state.timer.totalSeconds = 0;
    updateTimerUI();
  }

  function openTimerModal() {
    DOM.timerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeTimerModal() {
    DOM.timerModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Theme Management
     ========================================================================== */

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cc_theme', theme);
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  /* ==========================================================================
     String & HTML Helper Functions
     ========================================================================== */

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark style="background:var(--accent-light);color:var(--text-main);">$1</mark>');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ==========================================================================
     Event Listeners Setup
     ========================================================================== */

  function initEventListeners() {
    // Theme toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Pantry input & autocomplete
    DOM.ingredientInput.addEventListener('input', handleAutocompleteInput);
    DOM.ingredientInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = DOM.ingredientInput.value.trim();
        if (val) {
          addPantryIngredient(val);
          DOM.ingredientInput.value = '';
          DOM.autocompleteList.classList.add('hidden');
        }
      }
    });

    DOM.addIngredientBtn.addEventListener('click', () => {
      const val = DOM.ingredientInput.value.trim();
      if (val) {
        addPantryIngredient(val);
        DOM.ingredientInput.value = '';
        DOM.autocompleteList.classList.add('hidden');
        DOM.ingredientInput.focus();
      }
    });

    // Close autocomplete on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.autocomplete-wrapper')) {
        DOM.autocompleteList.classList.add('hidden');
      }
    });

    // Clear & Surprise Pantry
    DOM.clearPantryBtn.addEventListener('click', () => {
      if (state.pantry.length === 0) return;
      state.pantry = [];
      savePantry();
      showToast('Pantry cleared.', 'info');
    });

    DOM.surprisePantryBtn.addEventListener('click', () => {
      // Pick random complementary combos
      const combos = [
        ['chicken breast', 'garlic', 'spinach', 'tomato', 'heavy cream', 'butter'],
        ['pasta', 'tomato', 'basil', 'garlic', 'cheese', 'butter'],
        ['rice', 'egg', 'onion', 'garlic', 'carrot', 'soy sauce'],
        ['egg', 'tomato', 'bell pepper', 'onion', 'garlic', 'cheese'],
        ['salmon', 'honey', 'garlic', 'soy sauce', 'lemon'],
        ['black beans', 'bread', 'cheese', 'onion', 'bell pepper'],
        ['potato', 'egg', 'onion', 'cheese', 'olive oil']
      ];
      const randomCombo = combos[Math.floor(Math.random() * combos.length)];
      state.pantry = [...randomCombo];
      savePantry();
      showToast('🎲 Surprise! Loaded a curated chef ingredient combo!', 'warm');
    });

    // Filter controls
    DOM.recipeSearchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value.trim();
      DOM.clearSearchBtn.classList.toggle('hidden', !state.searchQuery);
      renderRecipes();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.recipeSearchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      renderRecipes();
    });

    DOM.mealTypeSelect.addEventListener('change', e => {
      state.mealType = e.target.value;
      renderRecipes();
    });

    DOM.timeFilterSelect.addEventListener('change', e => {
      state.maxTime = e.target.value;
      renderRecipes();
    });

    DOM.sortSelect.addEventListener('change', e => {
      state.sortBy = e.target.value;
      renderRecipes();
    });

    DOM.dietaryPills.querySelectorAll('.diet-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.dietaryPills.querySelectorAll('.diet-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.diet = pill.getAttribute('data-diet');
        renderRecipes();
      });
    });

    DOM.perfectMatchToggle.addEventListener('change', e => {
      state.perfectMatchOnly = e.target.checked;
      renderRecipes();
    });

    DOM.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.recipeSearchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      state.mealType = 'all';
      DOM.mealTypeSelect.value = 'all';
      state.maxTime = 'all';
      DOM.timeFilterSelect.value = 'all';
      state.diet = 'all';
      DOM.dietaryPills.querySelectorAll('.diet-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-diet') === 'all');
      });
      state.perfectMatchOnly = false;
      DOM.perfectMatchToggle.checked = false;
      renderRecipes();
      showToast('Filters reset', 'info');
    });

    // Grid vs List view toggle
    DOM.viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      localStorage.setItem('cc_view_mode', 'grid');
      DOM.viewGridBtn.classList.add('active');
      DOM.viewListBtn.classList.remove('active');
      DOM.recipesContainer.classList.remove('list-view');
    });

    DOM.viewListBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      localStorage.setItem('cc_view_mode', 'list');
      DOM.viewListBtn.classList.add('active');
      DOM.viewGridBtn.classList.remove('active');
      DOM.recipesContainer.classList.add('list-view');
    });

    // Recipe Detail Modal controls
    DOM.modalCloseBtn.addEventListener('click', closeRecipeModal);
    DOM.recipeModal.addEventListener('click', e => {
      if (e.target === DOM.recipeModal) closeRecipeModal();
    });

    DOM.servingsMinusBtn.addEventListener('click', () => {
      if (state.activeServings > 1) {
        state.activeServings--;
        DOM.modalServingsCount.textContent = state.activeServings;
        renderModalIngredients();
      }
    });

    DOM.servingsPlusBtn.addEventListener('click', () => {
      if (state.activeServings < 12) {
        state.activeServings++;
        DOM.modalServingsCount.textContent = state.activeServings;
        renderModalIngredients();
      }
    });

    DOM.modalAddAllMissingBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      addRecipeMissingToGrocery(state.activeRecipe.id);
    });

    DOM.modalFavoriteBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      toggleFavorite(state.activeRecipe.id);
    });

    DOM.modalPrintBtn.addEventListener('click', () => {
      window.print();
    });

    DOM.modalStartTimerBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      setAndStartTimer(state.activeRecipe.cookTime * 60, `${state.activeRecipe.title} Timer`);
    });

    // Grocery Drawer triggers
    DOM.groceryToggleBtn.addEventListener('click', openGroceryDrawer);
    DOM.groceryCloseBtn.addEventListener('click', closeGroceryDrawer);
    DOM.groceryDrawer.addEventListener('click', e => {
      if (e.target === DOM.groceryDrawer) closeGroceryDrawer();
    });

    DOM.groceryAddCustomBtn.addEventListener('click', () => {
      const text = DOM.groceryCustomInput.value.trim();
      if (text) {
        addGroceryItem(text);
        DOM.groceryCustomInput.value = '';
      }
    });

    DOM.groceryCustomInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const text = DOM.groceryCustomInput.value.trim();
        if (text) {
          addGroceryItem(text);
          DOM.groceryCustomInput.value = '';
        }
      }
    });

    DOM.groceryCopyBtn.addEventListener('click', () => {
      if (state.groceryList.length === 0) return;
      const text = state.groceryList
        .map(i => `${i.completed ? '[x]' : '[ ]'} ${i.text}`)
        .join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast('Grocery checklist copied to clipboard!', 'success');
      });
    });

    DOM.groceryClearCompletedBtn.addEventListener('click', () => {
      state.groceryList = state.groceryList.filter(g => !g.completed);
      saveGrocery();
      showToast('Cleared completed items', 'info');
    });

    DOM.groceryClearAllBtn.addEventListener('click', () => {
      if (state.groceryList.length === 0) return;
      state.groceryList = [];
      saveGrocery();
      showToast('Grocery list cleared', 'info');
    });

    // Favorites Drawer triggers
    DOM.favoritesToggleBtn.addEventListener('click', openFavoritesDrawer);
    DOM.favoritesCloseBtn.addEventListener('click', closeFavoritesDrawer);
    DOM.favoritesDrawer.addEventListener('click', e => {
      if (e.target === DOM.favoritesDrawer) closeFavoritesDrawer();
    });

    // Timer Modal triggers & presets
    DOM.timerToggleBtn.addEventListener('click', openTimerModal);
    DOM.timerCloseBtn.addEventListener('click', closeTimerModal);
    DOM.timerModal.addEventListener('click', e => {
      if (e.target === DOM.timerModal) closeTimerModal();
    });

    DOM.timerStartBtn.addEventListener('click', startTimer);
    DOM.timerPauseBtn.addEventListener('click', pauseTimer);
    DOM.timerResetBtn.addEventListener('click', resetTimer);

    DOM.timerPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const secs = parseInt(btn.getAttribute('data-seconds'), 10);
        state.timer.remainingSeconds += secs;
        state.timer.totalSeconds = Math.max(state.timer.totalSeconds, state.timer.remainingSeconds);
        updateTimerUI();
      });
    });

    DOM.timerSoundCheckbox.addEventListener('change', e => {
      state.timer.soundEnabled = e.target.checked;
    });

    // Zero-Waste Guide triggers
    DOM.guideToggleBtn.addEventListener('click', () => {
      DOM.guideModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
    DOM.bannerTipsBtn.addEventListener('click', () => {
      DOM.guideModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
    DOM.guideCloseBtn.addEventListener('click', () => {
      DOM.guideModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
    DOM.guideModal.addEventListener('click', e => {
      if (e.target === DOM.guideModal) {
        DOM.guideModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    // Settings Modal triggers
    DOM.settingsToggleBtn.addEventListener('click', () => {
      DOM.spoonacularKeyInput.value = state.spoonacularKey;
      DOM.settingsModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
    DOM.settingsCloseBtn.addEventListener('click', () => {
      DOM.settingsModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
    DOM.settingsModal.addEventListener('click', e => {
      if (e.target === DOM.settingsModal) {
        DOM.settingsModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    DOM.saveSettingsBtn.addEventListener('click', () => {
      state.spoonacularKey = DOM.spoonacularKeyInput.value.trim();
      localStorage.setItem('cc_spoonacular_key', state.spoonacularKey);
      DOM.settingsModal.classList.add('hidden');
      document.body.style.overflow = '';
      showToast('Settings saved successfully!', 'success');
    });

    DOM.resetPantryDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all local storage data (pantry, grocery, favorites)?')) {
        localStorage.clear();
        state.pantry = ['tomato', 'garlic', 'pasta', 'cheese'];
        state.groceryList = [];
        state.favorites = ['rec-01', 'rec-03'];
        savePantry();
        saveGrocery();
        saveFavorites();
        DOM.settingsModal.classList.add('hidden');
        document.body.style.overflow = '';
        showToast('All app data has been reset to defaults.', 'info');
      }
    });

    // Global ESC key to close any modal or drawer
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeRecipeModal();
        closeGroceryDrawer();
        closeFavoritesDrawer();
        closeTimerModal();
        DOM.guideModal.classList.add('hidden');
        DOM.settingsModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */

  function init() {
    applyTheme(state.theme);

    // Apply view mode
    if (state.viewMode === 'list') {
      DOM.viewListBtn.classList.add('active');
      DOM.viewGridBtn.classList.remove('active');
      DOM.recipesContainer.classList.add('list-view');
    }

    initStaplesPills();
    updatePantryUI();
    updateGroceryUI();
    updateFavoritesUI();
    updateTimerUI();
    renderRecipes();
    initEventListeners();

    console.log('CulinaryCraft initialized successfully.');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
