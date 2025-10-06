# CulinaryCraft — Smart Interactive Recipe & Zero-Waste Pantry Finder

> **Web Development Internship Capstone Project**  
> An interactive, responsive, and client-side web application designed to help users minimize food waste, save cooking time, and discover restaurant-quality recipes based on the ingredients they already have in their kitchen.

---

## 🌟 Executive Summary & Motivation
Every year, the average household discards over **$1,500 worth of edible food** simply because they lack clear recipe ideas for leftover ingredients sitting in their pantry and refrigerator. 

**CulinaryCraft** tackles this real-world problem directly by providing a **Smart Culinary Matching Engine**. Users simply enter the ingredients they have on hand (e.g., tomatoes, garlic, pasta, eggs), and the app calculates the match percentage, highlights ready-to-cook recipes (100% pantry match), and lists missing ingredients with a one-click **Smart Grocery Checklist**.

---

## 🚀 Key Features

### 1. 🍳 Smart Ingredient Matching Engine
- **Fuzzy Culinary Matcher**: Intelligently handles plurals, singular forms, and culinary synonyms (e.g., *scallions* ↔ *green onions*, *linguine* ↔ *pasta*, *eggs* ↔ *egg*).
- **Match Score & Status**:
  - 🟢 **100% Ready to Cook**: All ingredients in your kitchen—zero trips to the store!
  - 🟡 **High Match (50% - 99%)**: Tells you precisely which items you have vs. what you need to buy.
  - ⚪ **Inspiration Match**: Suggests creative meals with available staples.

### 2. 🥦 Interactive Pantry Manager
- **Smart Autocomplete**: Type any ingredient to see matching recommendations with category tags (Produce, Dairy, Pantry, Meat).
- **Quick-Add Staples**: One-click pills for 16 high-frequency household ingredients (Garlic, Onion, Tomato, Potato, Cheese, Chicken, Pasta, Rice, etc.).
- **Surprise Pantry Generator**: 🎲 Randomizes curated chef ingredient combinations for quick testing and inspiration.
- **Pantry Tag Chips**: Easily add or delete ingredients with animated tag chips.

### 3. 🍲 Dynamic Recipe Studio & Modal
- **Dynamic Servings Scaler**: Scale recipes up or down (from 1 to 12 servings)—ingredient quantities, units, and proportions recalculate automatically in real time!
- **Interactive Checklists**: Check off ingredients as you prep and cross off step-by-step instructions as you cook.
- **In-Step Kitchen Timers**: Step instructions with cooking durations (e.g., *"Simmer for 10 minutes"*) feature a direct one-click button to launch that exact timer.
- **Nutrition Breakdown**: Estimated calories, protein, carbohydrates, and fats per serving.
- **Chef's Zero-Waste Tips & Substitutions**: Practical chef tips for reusing kitchen scraps (parmesan rinds, broccoli stems, stale bread) and common pantry substitutions.

### 4. 🛒 Smart Grocery Shopping Tracker
- One-click addition of missing recipe ingredients into an interactive shopping drawer.
- Add custom items, check off bought groceries, and copy the formatted checklist directly to your clipboard for WhatsApp/Notes sharing.
- Fully synchronized with browser `localStorage`.

### 5. ⏱️ Built-in Audio Kitchen Timer
- Hands-free cooking timer with presets (+1m, +3m, +5m, +10m, +15m).
- Native musical chime synthesized via the **Web Audio API** (100% offline, zero audio file dependencies).
- Active timer status indicator in the navbar so you can browse while timing.

### 6. ❤️ Bookmarking & Saved Favorites
- Save favorite recipes with instant heart micro-interactions.
- Dedicated drawer with direct access to cook saved favorites anytime.

### 7. 🌓 Dark & Light Mode Support
- Carefully curated color palettes: modern emerald, warm culinary amber, glassmorphism cards, and deep slate dark theme.
- Automatically respects system preferences or user toggles, remembered via `localStorage`.

---

## 🛠️ Technology Stack
- **Structure**: Semantic HTML5 (ARIA attributes, accessible modal dialogs, SEO tags).
- **Styling**: Vanilla CSS3 (Custom Properties / CSS Variables, Glassmorphism, Responsive Grid & Flexbox, Smooth Micro-animations, Print Media Styles).
- **Logic**: Modern JavaScript (ES6+ Modules, State Management, String Stemming, Array Matrix calculations).
- **Audio**: Web Audio API (real-time harmonic oscillator synthesis).
- **Storage**: Browser `localStorage` for pantry persistence, grocery list, favorites, and theme.
- **Zero External Dependencies**: Requires no build tools (`npm`, `webpack`, `vite`), no heavy frameworks, and runs directly in any modern browser!

---

## 📂 Project Architecture

```plaintext
Interactive_Recipe_Finder-main/
│
├── index.html           # Main semantic HTML structure & modals
├── style.css            # Complete design system, light/dark themes & responsive layouts
├── script.js            # Application controller, matching algorithm, state & audio logic
├── recipes-data.js      # 25+ curated chef recipes, pantry database & substitutions
└── README.md            # Comprehensive internship project documentation
```

---

## 💻 How to Run Locally

1. **Direct Browser Execution**:
   - Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
2. **VS Code Live Server (Optional)**:
   - Right-click `index.html` and select **"Open with Live Server"**.

---

## 📊 Evaluation Criteria & Internship Highlights
- **User-Centric Design**: Solves a genuine everyday problem (food waste and meal indecision).
- **Robustness**: Does not rely on fragile external API keys that fail on evaluation; includes an extensive built-in offline chef database with graceful fallback.
- **Code Cleanliness**: Follows DRY principles, modular structure, semantic HTML, and accessible ARIA patterns.
- **Interactive Polish**: Servings recalculation, interactive timers, audio feedback, and local storage state persistence.

---
*Created by Ulleru Kavya for Web Development Internship Submission.*
