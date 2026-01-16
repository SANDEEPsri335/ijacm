// js/latest-articles.js - DEBUGGED VERSION
console.log("📰 Latest Articles Script Starting...");

// Configuration - VERIFY THESE PATHS
const ARTICLES_JSON_PATH = '../data/articles.json';
const PAPERS_FOLDER = '../paper/';
const ARTICLES_HTML_FOLDER = '../articles/';
const MAX_ARTICLES = 3;

// Global flag to check if already loaded
let articlesLoaded = false;

function loadLatestArticles() {
    console.log("🚀 Loading latest articles...");
    
    const container = document.getElementById('latest-articles-container');
    
    if (!container) {
        console.error("❌ Container not found! Looking for 'latest-articles-container'");
        console.error("Available elements:", document.querySelectorAll('*[id]'));
        return;
    }
    
    console.log("✅ Found container:", container);
    
    // Show loading
    container.innerHTML = `
        <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading latest articles...</p>
        </div>
    `;
    
    // Add CSS for loading
    const style = document.createElement('style');
    style.textContent = `
        .loading-spinner-container {
            text-align: center;
            padding: 40px;
            grid-column: 1 / -1;
        }
        .loading-spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #00b0ff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        .loading-text {
            color: #00b0ff;
            font-weight: 500;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Load articles with timeout
    fetchArticles().catch(error => {
        console.error("❌ Error in fetchArticles:", error);
        showFallbackArticles(container);
    });
}

async function fetchArticles() {
    try {
        console.log(`📁 Fetching from: ${ARTICLES_JSON_PATH}`);
        const response = await fetch(ARTICLES_JSON_PATH);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("✅ JSON loaded successfully:", data);
        
        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error("Invalid JSON structure: 'articles' array not found");
        }
        
        const articles = data.articles;
        console.log(`📊 Total articles found: ${articles.length}`);
        
        // Sort by date (newest first)
        const sortedArticles = articles.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            console.log(`Comparing: ${a.date} (${dateA}) vs ${b.date} (${dateB})`);
            return dateB - dateA;
        });
        
        // Take only the 3 most recent
        const latestArticles = sortedArticles.slice(0, MAX_ARTICLES);
        console.log("🎯 Top 3 articles selected:", latestArticles);
        
        // Display the articles
        displayArticles(latestArticles);
        
    } catch (error) {
        console.error("❌ Error loading articles:", error);
        throw error; // Re-throw to be caught by caller
    }
}

function parseDate(dateString) {
    if (!dateString) return new Date(0);
    
    try {
        // Handle multiple date formats
        if (dateString.includes('/')) {
            // Format: "2025/12/05"
            const parts = dateString.split('/');
            if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
            }
        } else if (dateString.includes('-')) {
            // Format: "2025-12-05"
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }
        
        // Try direct parsing
        return new Date(dateString);
    } catch (e) {
        console.warn(`⚠️ Could not parse date: ${dateString}`, e);
        return new Date(0);
    }
}

function displayArticles(articles) {
    const container = document.getElementById('latest-articles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #fff;">
                <p>No articles found.</p>
            </div>
        `;
        return;
    }
    
    articles.forEach((article, index) => {
        const articleHTML = createArticleHTML(article, index);
        container.innerHTML += articleHTML;
    });
    
    articlesLoaded = true;
    console.log("✅ Articles displayed successfully");
}

function createArticleHTML(article, index) {
    // Format date
    const formattedDate = formatDate(article.date);
    
    // Get first 2-3 authors
    const authors = article.authors && article.authors.length > 0 
        ? (article.authors.length > 2 
            ? `${article.authors.slice(0, 2).join(', ')} et al.` 
            : article.authors.join(', '))
        : 'Unknown Author';
    
    // Get HTML filename
    const pdfName = article.pdf || 'default.pdf';
    const htmlFileName = pdfName.replace('.pdf', '.html');
    
    // Create article HTML
    return `
        <div class="article-card" data-index="${index}">
            <h3 class="article-title">${escapeHtml(article.title || 'Untitled Article')}</h3>
            <p class="article-authors">${escapeHtml(authors)}</p>
            <p class="article-date">
                <i class="far fa-calendar-alt"></i> ${formattedDate}
            </p>
            <div class="article-buttons">
                <a href="${PAPERS_FOLDER}${pdfName}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="btn-pdf">
                    <i class="fas fa-file-pdf"></i> PDF
                </a>
                <a href="${ARTICLES_HTML_FOLDER}${htmlFileName}" 
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn-view">
                    <i class="fas fa-external-link-alt"></i> View More
                </a>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    try {
        const date = parseDate(dateString);
        if (date.getTime() === 0) return dateString;
        
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch (error) {
        return dateString || 'Date unknown';
    }
}

function showFallbackArticles(container) {
    console.log("🔄 Showing fallback articles...");
    
    const fallbackArticles = [
        {
            title: "DEDUCT: A Secure Deduplication Framework for Textual Data in Cloud Environments",
            authors: ["Himabindu B", "Vempalli Mallikarjuna", "Sadiyam Padmanabhan Mukeshkumar"],
            date: "2026/01/13",
            pdf: "IJACM-BEBB7D71.pdf"
        },
        {
            title: "Frictional Stability and Surface Integrity of Aluminum-Based Composite Materials",
            authors: ["S. Karthivelan", "M. Arunprasath", "V. Magesh Kumar"],
            date: "2025/12/24",
            pdf: "IJACM-429BB5C7.pdf"
        },
        {
            title: "High-Efficiency Thermal Management Using Nanomaterial-Enhanced Heat Exchanger Designs",
            authors: ["K Saravana", "Avaneeth Sinha", "Rakesh Jain"],
            date: "2025/12/24",
            pdf: "IJACM-FCE54392.pdf"
        }
    ];
    
    container.innerHTML = '';
    fallbackArticles.forEach((article, index) => {
        const articleHTML = createArticleHTML(article, index);
        container.innerHTML += articleHTML;
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("✅ DOM Content Loaded - Initializing articles");
        loadLatestArticles();
    });
} else {
    console.log("✅ DOM already loaded - Initializing articles");
    loadLatestArticles();
}

console.log("✅ Latest Articles Script Ready!");