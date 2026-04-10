# GlobeTrekker: Global Country & Travel Explorer

## Project Purpose & The Real-World Problem
**GlobeTrekker** is an interactive, digital atlas web application. It solves the real-world problem of **fragmented geographic information**. Normally, travelers or students must perform multiple Google searches to find a country's currency, language, timezone, and population. GlobeTrekker aggregates all this vital data into one instantly searchable, interactive dashboard, saving time and making global data easily accessible.

## The API Being Used
This project utilizes the **REST Countries API** (`https://restcountries.com/v3.1/all`).
- **Why this API?** It is 100% free, requires no authentication keys, has CORS enabled, and returns a massive array of incredibly detailed JSON data for all 250+ countries and territories on Earth. It provides everything from exact population counts to direct links for high-quality SVG flags.

## The User Experience
Imagine you are exploring the world map. You open GlobeTrekker and see a beautiful dashboard:
* A grid of 'Glass Cards', where each card represents a country on Earth.
* On the card, you immediately see the country's **Flag**, **Name**, **Population**, **Capital City**, and **Currency**.
* You no longer need to open 5 separate Wikipedia tabs to compare nations. GlobeTrekker aggregates it into one sleek page.

## Features Planned for Implementation (The Technical Magic)
To fulfill the core project requirements, GlobeTrekker uses Array Higher-Order Functions (HOFs) extensively on the fetched API data to create a highly interactive experience:
- **Live Search (using `.filter()`):** Users can type natively into a search bar. The app uses `.filter()` to instantly match the country name against the user's input, updating the UI dynamically as they type without needing a "submit" button.
- **Region Filter (using `.filter()`):** A dropdown allows the user to select specific continents (e.g., "Oceania", "Europe"). The `.filter()` function isolates only countries matching that exact region, hiding the rest of the world instantly.
- **Mathematical Sort (using `.sort()`):** Users can toggle a sort feature to view the countries mathematically ranked by population or area (from largest to smallest), using the `.sort((a,b) => b.population - a.population)` array method.

## Technologies Involved
- **HTML5:** Semantic structuring for the main dashboard and search interface.
- **CSS3:** Custom, modern styling utilizing "Glassmorphism" (frosted glass elements on top of a vibrant gradient background) and responsive CSS Grid logic.
- **JavaScript:** Vanilla JavaScript used to perform the `fetch()` requests, handle promises, manipulate the DOM, and execute Array Methods.
