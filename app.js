const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,currencies,languages,area,timezones';

// DOM Elements
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const dashboardData = document.getElementById('dashboard-data');
const searchInput = document.getElementById('db-search');
const retryBtn = document.getElementById('retry-btn');
const tableBody = document.getElementById('data-table-body');
const noResults = document.getElementById('no-results');
const regionFilter = document.getElementById('region-filter');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');

let globalCountries = [];

function fetchCountries() {
    showLoader();
    
    // Using simple fetch and Promises
    fetch(API_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error");
            }
            return response.json();
        })
        .then(function(data) {
            // Sort by name A to Z initially using sort method
            globalCountries = data.sort(function(a, b) {
                if (a.name.common < b.name.common) return -1;
                if (a.name.common > b.name.common) return 1;
                return 0;
            });
            
            processDashboardInfo(globalCountries);
            renderDataTable(globalCountries);
            
            hideLoader();
        })
        .catch(function(error) {
            console.log("Error fetching data:", error);
            showError();
        });
}

function processDashboardInfo(countries) {
    // 1. Total Metrics using reduce method
    const totalPop = countries.reduce(function(sum, country) {
        return sum + (country.population || 0);
    }, 0);
    
    const totalArea = countries.reduce(function(sum, country) {
        return sum + (country.area || 0);
    }, 0);
    
    // Find unique regions using map and filter methods
    const allRegions = countries.map(function(country) {
        return country.region;
    }).filter(function(region) {
        return region !== undefined && region !== "";
    });
    
    const uniqueRegions = allRegions.filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });

    // Set values in HTML directly
    document.getElementById('m-total-countries').innerHTML = Math.floor(countries.length).toLocaleString();
    document.getElementById('m-global-pop').innerHTML = Math.floor(totalPop).toLocaleString();
    document.getElementById('m-global-area').innerHTML = Math.floor(totalArea).toLocaleString();
    document.getElementById('m-total-regions').innerHTML = Math.floor(uniqueRegions.length).toLocaleString();

    // 2. Top 5 Populated Regions using sort and slice methods
    const sortedByPop = [...countries].sort(function(a, b) {
        return (b.population || 0) - (a.population || 0);
    });
    const top5 = sortedByPop.slice(0, 5);
    const maxPop = top5[0].population || 1; 
    
    const top5Container = document.getElementById('top-5-list');
    
    // Use map method to create HTML and join it together
    const top5HTML = top5.map(function(c) {
        const percent = ((c.population || 0) / maxPop) * 100;
        return `
            <div class="progress-item">
                <div class="p-header">
                    <span>${c.name.common}</span>
                    <span style="font-family: monospace; color: var(--accent);">${(c.population || 0).toLocaleString()}</span>
                </div>
                <div class="p-bar-bg">
                    <div class="p-bar-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    top5Container.innerHTML = top5HTML;

    // 3. Region Distribution using reduce method
    const regionCounts = allRegions.reduce(function(acc, region) {
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {});
    
    const regionContainer = document.getElementById('region-list');
    
    const regionKeys = Object.keys(regionCounts);
    
    // Sort regions by count
    const sortedRegionKeys = regionKeys.sort(function(a, b) {
        return regionCounts[b] - regionCounts[a];
    });

    // Map through the sorted regions to make HTML
    const regionHTML = sortedRegionKeys.map(function(region) {
        const count = regionCounts[region];
        return `
            <div class="region-stat">
                <span class="region-name">${region}</span>
                <span class="region-count">${count}</span>
            </div>
        `;
    }).join('');
    
    regionContainer.innerHTML = regionHTML;
}

function renderDataTable(countriesData) {
    document.getElementById('table-count-badge').textContent = countriesData.length + ' Records';
    
    if (countriesData.length === 0) {
        noResults.classList.remove('hidden');
        tableBody.innerHTML = '';
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Use map method to create table rows
    const tableHTML = countriesData.map(function(country) {
        const name = country.name.common;
        const flag = country.flags.svg;
        const region = country.region || '-';
        
        let pop = '-';
        if (country.population) {
            pop = country.population.toLocaleString();
        }
        
        let capital = '-';
        if (country.capital && country.capital.length > 0) {
            capital = country.capital[0];
        }
        
        let area = '-';
        if (country.area) {
            area = Math.floor(country.area).toLocaleString() + ' km²';
        }
        
        return `
            <tr>
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
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = tableHTML;
}

function applyFiltersAndSort() {
    const term = searchInput.value.toLowerCase().trim();
    const regionVal = regionFilter.value;
    const sortVal = sortSelect.value;
    
    // 1. FILTER by Search Term using filter method
    let processed = globalCountries.filter(function(country) {
        if (term === '') {
            return true; // Keep all if search is empty
        }
        
        const nameMatch = country.name.common.toLowerCase().includes(term);
        
        let regionMatch = false;
        if (country.region) {
            regionMatch = country.region.toLowerCase().includes(term);
        }
        
        let capitalMatch = false;
        if (country.capital && country.capital.length > 0) {
            capitalMatch = country.capital[0].toLowerCase().includes(term);
        }
        
        return nameMatch || regionMatch || capitalMatch;
    });
    
    // 2. FILTER by Region dropdown using filter method
    processed = processed.filter(function(country) {
        if (regionVal === 'all') {
            return true;
        }
        return country.region === regionVal;
    });
    
    // 3. SORT values using sort method
    processed = processed.sort(function(a, b) {
        if (sortVal === 'name-asc') {
            if (a.name.common < b.name.common) return -1;
            if (a.name.common > b.name.common) return 1;
            return 0;
        } else if (sortVal === 'name-desc') {
            if (a.name.common < b.name.common) return 1;
            if (a.name.common > b.name.common) return -1;
            return 0;
        } else if (sortVal === 'pop-desc') {
            return (b.population || 0) - (a.population || 0);
        } else if (sortVal === 'pop-asc') {
            return (a.population || 0) - (b.population || 0);
        }
        return 0;
    });

    renderDataTable(processed);
}

function setupEvents() {
    // Add event listeners for inputs
    searchInput.addEventListener('input', applyFiltersAndSort);
    regionFilter.addEventListener('change', applyFiltersAndSort);
    sortSelect.addEventListener('change', applyFiltersAndSort);

    // Add event listener for Dark mode button
    themeToggle.addEventListener('click', function() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });
}

// Helper functions for loading and errors
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

// Start application
function init() {
    fetchCountries();
    setupEvents();
}

retryBtn.addEventListener('click', fetchCountries);
document.addEventListener("DOMContentLoaded", init);
