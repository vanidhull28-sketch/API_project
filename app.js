const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,currencies,languages,area,timezones';

// DOM Elements
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const dashboardData = document.getElementById('dashboard-data');
const searchInput = document.getElementById('db-search');
const retryBtn = document.getElementById('retry-btn');
const tableBody = document.getElementById('data-table-body');
const noResults = document.getElementById('no-results');

let globalCountries = [];

async function fetchCountries() {
    showLoader();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Base global sort by name initially
        globalCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        processDashboardInfo(globalCountries);
        renderDataTable(globalCountries);
        
        hideLoader();
        
        // Trigger number animations AFTER the dashboard is visible
        setTimeout(() => {
            triggerNumberAnimations();
        }, 100);

    } catch (error) {
        console.error("Error fetching data:", error);
        showError();
    }
}

function processDashboardInfo(countries) {
    // 1. Total Metrics
    const totalPop = countries.reduce((sum, c) => sum + (c.population || 0), 0);
    const totalArea = countries.reduce((sum, c) => sum + (c.area || 0), 0);
    
    const regions = new Set();
    const regionCounts = {};
    
    countries.forEach(c => {
        if (c.region) {
            regions.add(c.region);
            regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
        }
    });

    // Store data values on elements for animation
    document.getElementById('m-total-countries').setAttribute('data-val', countries.length);
    document.getElementById('m-global-pop').setAttribute('data-val', totalPop);
    document.getElementById('m-global-area').setAttribute('data-val', totalArea);
    document.getElementById('m-total-regions').setAttribute('data-val', regions.size);

    // 2. Top 5 Populated Progress Bars
    const sortedByPop = [...countries].sort((a, b) => (b.population || 0) - (a.population || 0));
    const top5 = sortedByPop.slice(0, 5);
    const maxPop = top5[0].population || 1; 
    
    const top5Container = document.getElementById('top-5-list');
    top5Container.innerHTML = '';
    
    top5.forEach(c => {
        const percent = ((c.population || 0) / maxPop) * 100;
        const html = `
            <div class="progress-item">
                <div class="p-header">
                    <span>${c.name.common}</span>
                    <span style="font-family: monospace; color: var(--accent);">${formatCompactNumber(c.population || 0)}</span>
                </div>
                <div class="p-bar-bg">
                    <div class="p-bar-fill" style="width: 0%" data-target="${percent}%"></div>
                </div>
            </div>
        `;
        top5Container.insertAdjacentHTML('beforeend', html);
    });

    // Animate custom CSS bars
    setTimeout(() => {
        const bars = top5Container.querySelectorAll('.p-bar-fill');
        bars.forEach(bar => {
            bar.style.width = bar.getAttribute('data-target');
        });
    }, 500);

    // 3. Region Distribution
    const regionContainer = document.getElementById('region-list');
    regionContainer.innerHTML = '';
    const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
    
    sortedRegions.forEach(([region, count]) => {
        const html = `
            <div class="region-stat">
                <span class="region-name">${region}</span>
                <span class="region-count">${count}</span>
            </div>
        `;
        regionContainer.insertAdjacentHTML('beforeend', html);
    });
}

// Function to cleanly render the table rows with staggered animations
function renderDataTable(countriesData) {
    tableBody.innerHTML = '';
    document.getElementById('table-count-badge').textContent = `${countriesData.length} Records`;
    
    if (countriesData.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    const fragment = document.createDocumentFragment();

    // To prevent mass DOM lag on 250 items, cap animation stagger at first 50
    countriesData.forEach((country, index) => {
        const tr = document.createElement('tr');
        // Stagger row entry animation (max delay 2s to not wait forever)
        const delay = Math.min(index * 0.05, 2); 
        tr.style.animationDelay = `${delay}s`;
        
        const name = country.name.common;
        const flag = country.flags.svg;
        const region = country.region || '-';
        const pop = country.population ? formatNumber(country.population) : '-';
        const capital = country.capital && country.capital.length > 0 ? country.capital[0] : '-';
        const area = country.area ? formatNumber(country.area) + ' km²' : '-';
        
        tr.innerHTML = `
            <td>
                <div class="td-entity">
                    <img src="${flag}" alt="Flag" class="td-flag" loading="lazy">
                    <span>${name}</span>
                </div>
            </td>
            <td><span style="background: rgba(0,0,0,0.04); padding: 4px 10px; border-radius: 8px; font-weight: 600;">${region}</span></td>
            <td style="font-family: monospace; font-weight: 600;">${pop}</td>
            <td>${capital}</td>
            <td style="font-family: monospace;">${area}</td>
            <td><button class="view-btn">Inspect</button></td>
        `;
        fragment.appendChild(tr);
    });

    tableBody.appendChild(fragment);
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        if (term === '') {
            renderDataTable(globalCountries);
            return;
        }
        
        const filtered = globalCountries.filter(c => 
            c.name.common.toLowerCase().includes(term) ||
            (c.region && c.region.toLowerCase().includes(term)) ||
            (c.capital && c.capital[0].toLowerCase().includes(term))
        );
        
        renderDataTable(filtered);
    });
}

// ==========================================
// ANIMATION PHYSICS Engine
// ==========================================
function triggerNumberAnimations() {
    const totalCountEl = document.getElementById('m-total-countries');
    const globalPopEl = document.getElementById('m-global-pop');
    const globalAreaEl = document.getElementById('m-global-area');
    const totalRegionsEl = document.getElementById('m-total-regions');

    animateValue(totalCountEl, 0, parseInt(totalCountEl.getAttribute('data-val')), 1500, formatNumber);
    animateValue(globalPopEl, 0, parseInt(globalPopEl.getAttribute('data-val')), 2000, formatCompactNumber);
    animateValue(globalAreaEl, 0, parseInt(globalAreaEl.getAttribute('data-val')), 2000, formatCompactNumber);
    animateValue(totalRegionsEl, 0, parseInt(totalRegionsEl.getAttribute('data-val')), 1000, formatNumber);
}

function animateValue(obj, start, end, duration, formatFn) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function: easeOutQuart for super smooth slowdown
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        const currentVal = Math.floor(easeProgress * (end - start) + start);
        obj.innerHTML = formatFn(currentVal);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = formatFn(end); // force exact end value
        }
    };
    window.requestAnimationFrame(step);
}

// Utility formats
function formatNumber(num) {
    return num.toLocaleString();
}

function formatCompactNumber(number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    return formatter.format(number) + (number > 1000 ? '+' : '');
}

function showLoader() {
    loader.classList.remove('hidden');
    dashboardData.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
    dashboardData.classList.remove('hidden');
}

function showError() {
    loader.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    dashboardData.classList.add('hidden');
}

function init() {
    fetchCountries();
    setupSearch();
}

retryBtn.addEventListener('click', fetchCountries);
document.addEventListener("DOMContentLoaded", init);
