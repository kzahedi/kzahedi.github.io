/**
 * Main JavaScript for the academic homepage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Initialize publications if on a page with publications
    const publicationsList = document.getElementById('publications-list');
    const selectedPublications = document.getElementById('selected-publications');

    if (publicationsList || selectedPublications) {
        loadPublications();
    }
});

// BibTeX parser instance
let parser = null;
let allEntries = [];

async function loadPublications() {
    try {
        const response = await fetch('data/zahedi.bib');
        const bibtex = await response.text();

        parser = new BibtexParser();
        allEntries = parser.parse(bibtex);

        // Sort entries by year (descending)
        allEntries.sort((a, b) => {
            const yearA = parseInt(a.fields.year) || 0;
            const yearB = parseInt(b.fields.year) || 0;
            return yearB - yearA;
        });

        // Render publications based on which page we're on
        const publicationsList = document.getElementById('publications-list');
        const selectedPublications = document.getElementById('selected-publications');

        if (publicationsList) {
            renderFullPublications();
            setupFilters();
        }

        if (selectedPublications) {
            renderSelectedPublications();
        }
    } catch (error) {
        console.error('Error loading publications:', error);
        const container = document.getElementById('publications-list') || document.getElementById('selected-publications');
        if (container) {
            container.innerHTML = '<p class="error">Error loading publications. Please try again later.</p>';
        }
    }
}

function renderFullPublications(entries = allEntries) {
    const container = document.getElementById('publications-list');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = '<p>No publications found matching your filters.</p>';
        return;
    }

    // Group by year
    const byYear = {};
    entries.forEach(entry => {
        const year = entry.fields.year || 'Unknown';
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(entry);
    });

    // Sort years descending
    const years = Object.keys(byYear).sort((a, b) => b - a);

    let html = '';
    years.forEach(year => {
        html += `<h3 class="year-heading">${year}</h3>`;
        byYear[year].forEach((entry, index) => {
            html += renderPublicationItem(entry, index);
        });
    });

    container.innerHTML = html;
}

function renderSelectedPublications() {
    const container = document.getElementById('selected-publications');
    if (!container) return;

    // Curated list of top publications (by citations), sorted by year descending
    const featuredPubs = [
        {
            title: "Impact and dynamics of hate and counter speech online",
            authors: "Garland, J., <span class=\"highlight\">Ghazi-Zahedi, K.</span>, Young, J.-G., Hébert-Dufresne, L., Galesic, M.",
            venue: "<em>EPJ Data Science</em>, 11(3), 2022",
            type: "Journal",
            links: { doi: "10.1140/epjds/s13688-021-00314-6" }
        },
        {
            title: "Countering hate on social media: Large scale classification of hate and counter speech",
            authors: "Garland, J., <span class=\"highlight\">Ghazi-Zahedi, K.</span>, Young, J.-G., Hébert-Dufresne, L., Galesic, M.",
            venue: "<em>Proceedings of the Fourth Workshop on Online Abuse and Harms (ACL)</em>, 2020",
            type: "Conference",
            links: { pdf: "https://aclanthology.org/2020.alw-1.13/" }
        },
        {
            title: "Morphological Intelligence: Measuring the Body's Contribution to Intelligence",
            authors: "<span class=\"highlight\">Ghazi-Zahedi, K.</span>",
            venue: "<em>Springer</em>, 2019",
            type: "Book",
            links: { link: "https://link.springer.com/book/10.1007/978-3-030-20621-5" }
        },
        {
            title: "Morphological Computation: The Good, the Bad, and the Ugly",
            authors: "<span class=\"highlight\">Ghazi-Zahedi, K.</span>, Deimel, R., Montúfar, G., Wall, V., Brock, O.",
            venue: "<em>IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)</em>, 2017",
            type: "Conference",
            links: { pdf: "https://ieeexplore.ieee.org/document/8202194/" }
        },
        {
            title: "A Theory of Cheap Control in Embodied Systems",
            authors: "Montúfar, G., <span class=\"highlight\">Ghazi-Zahedi, K.</span>, Ay, N.",
            venue: "<em>PLoS Computational Biology</em>, 11(9), e1004427, 2015",
            type: "Journal",
            links: { doi: "10.1371/journal.pcbi.1004427" }
        },
        {
            title: "Higher coordination with less control—A result of information maximization in the sensorimotor loop",
            authors: "<span class=\"highlight\">Zahedi, K.</span>, Ay, N., Der, R.",
            venue: "<em>Adaptive Behavior</em>, 18(3-4), pp. 338–355, 2010",
            type: "Journal",
            links: { pdf: "http://adb.sagepub.com/content/18/3-4/338.abstract" }
        }
    ];

    let html = '';
    featuredPubs.forEach((pub, index) => {
        let linksHtml = '';
        if (pub.links.pdf) {
            linksHtml += `<a href="${pub.links.pdf}" target="_blank" rel="noopener">PDF</a>`;
        }
        if (pub.links.doi) {
            linksHtml += `<a href="https://doi.org/${pub.links.doi}" target="_blank" rel="noopener">DOI</a>`;
        }
        if (pub.links.link) {
            linksHtml += `<a href="${pub.links.link}" target="_blank" rel="noopener">Link</a>`;
        }

        html += `
            <div class="publication-item" style="animation-delay: ${index * 0.05}s">
                <div class="publication-title">
                    ${pub.title}
                    <span class="publication-type">${pub.type}</span>
                </div>
                <div class="publication-authors">${pub.authors}</div>
                <div class="publication-venue">${pub.venue}</div>
                ${linksHtml ? `<div class="publication-links">${linksHtml}</div>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderPublicationItem(entry, index) {
    const fields = entry.fields;
    const authors = parser.formatAuthors(
        fields.author,
        'Zahedi|Ghazi-Zahedi'
    );
    const venue = parser.formatVenue(entry);
    const typeLabel = parser.getTypeLabel(entry.type);

    let linksHtml = '';
    if (fields.pdf) {
        linksHtml += `<a href="${fields.pdf}" target="_blank" rel="noopener">PDF</a>`;
    }
    if (fields.doi) {
        linksHtml += `<a href="https://doi.org/${fields.doi}" target="_blank" rel="noopener">DOI</a>`;
    }
    if (fields.url) {
        linksHtml += `<a href="${fields.url}" target="_blank" rel="noopener">Link</a>`;
    }

    return `
        <div class="publication-item" data-type="${entry.type}" data-year="${fields.year || ''}" style="animation-delay: ${index * 0.05}s">
            <div class="publication-title">
                ${fields.title}
                <span class="publication-type">${typeLabel}</span>
            </div>
            <div class="publication-authors">${authors}</div>
            <div class="publication-venue">${venue}</div>
            ${linksHtml ? `<div class="publication-links">${linksHtml}</div>` : ''}
        </div>
    `;
}

function setupFilters() {
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');

    // Populate year filter
    if (yearFilter) {
        const years = parser.getYears();
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        yearFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');

    const selectedYear = yearFilter ? yearFilter.value : 'all';
    const selectedType = typeFilter ? typeFilter.value : 'all';

    let filtered = allEntries;

    if (selectedYear !== 'all') {
        filtered = filtered.filter(e => e.fields.year === selectedYear);
    }

    if (selectedType !== 'all') {
        filtered = filtered.filter(e => e.type === selectedType);
    }

    renderFullPublications(filtered);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
