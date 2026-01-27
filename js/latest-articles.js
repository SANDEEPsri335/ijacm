// js/latest-articles.js - FIXED VERSION WITH NEW TAB
console.log("📰 Latest Articles Script Starting...");

// Configuration
const ARTICLES_JSON_PATH = '../data/articles.json';
const PAPERS_FOLDER = '../paper/';
const ARTICLES_HTML_FOLDER = '../articles/';
const MAX_ARTICLES = 3;

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM Content Loaded");
    loadLatestArticles();
});

async function loadLatestArticles() {
    console.log("🚀 Loading latest articles...");
    
    const container = document.getElementById('latest-articles-container');
    
    if (!container) {
        console.error("❌ Container not found! Looking for 'latest-articles-container'");
        return;
    }
    
    // Show loading
    container.innerHTML = `
        <div style="text-align:center; padding: 40px; grid-column: 1 / -1;">
            <div style="border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="color: #00b0ff;">Loading latest articles...</p>
        </div>
    `;
    
    try {
        const response = await fetch(ARTICLES_JSON_PATH);
        
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const articles = data.articles;
        
        console.log(`✅ Successfully loaded ${articles.length} articles`);
        
        // Sort by date (newest first) - Use your date format: "2025/12/05"
        const sortedArticles = articles.sort((a, b) => {
            // Convert "2025/12/05" to "2025-12-05" for Date parsing
            const dateA = new Date(a.date.replace(/\//g, '-'));
            const dateB = new Date(b.date.replace(/\//g, '-'));
            return dateB - dateA;
        });
        
        console.log("📅 Articles sorted by date:");
        sortedArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} - ${article.date}`);
        });
        
        // Take only the 3 most recent
        const latestArticles = sortedArticles.slice(0, MAX_ARTICLES);
        
        console.log("🎯 Top 3 latest articles:");
        latestArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} (${article.date})`);
        });
        
        // Display the articles
        displayArticles(latestArticles, container);
        
    } catch (error) {
        console.error("❌ Error loading articles:", error);
        console.log("🔄 Showing fallback articles...");
        showFallbackArticles(container);
    }
}

function displayArticles(articles, container) {
    container.innerHTML = '';
    
    articles.forEach(article => {
        const articleHTML = createArticleHTML(article);
        container.innerHTML += articleHTML;
    });
}

function createArticleHTML(article) {
    // Format date from "2025/12/05" to "05 Dec 2025"
    const formattedDate = formatDate(article.date);
    
    // Get first 2-3 authors
    const authors = article.authors.length > 2 
        ? `${article.authors.slice(0, 2).join(', ')} et al.` 
        : article.authors.join(', ');
    
    // Get the HTML filename based on PDF filename
    const pdfName = article.pdf;
    const htmlFileName = pdfName.replace('.pdf', '.html');
    
    return `
        <div class="article-card">
            <h3 class="article-title">${escapeHtml(article.title)}</h3>
            <p class="article-authors">${escapeHtml(authors)}</p>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">
                <i class="far fa-calendar-alt"></i> ${formattedDate}
            </p>
            <div style="margin-top: 15px;">
                <a href="${PAPERS_FOLDER}${article.pdf}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="background: #d32f2f; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px; cursor: pointer; text-decoration: none; display: inline-block;">
                    <i class="fas fa-file-pdf"></i> PDF
                </a>
                <a href="${ARTICLES_HTML_FOLDER}${htmlFileName}" 
                   target="_blank"
                   rel="noopener noreferrer"
                   style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block;">
                    <i class="fas fa-external-link-alt"></i> View More
                </a>
            </div>
        </div>
    `;
}

function showFallbackArticles(container) {
    console.log("🔄 Loading fallback data...");
    
    // Hardcoded fallback data matching YOUR JSON structure
    const fallbackArticles = [
        {
            id: "IJACM-BEBB7D71",
            title: "DEDUCT: A Secure Deduplication Framework for Textual Data in Cloud Environments",
            authors: ["Himabindu B", "Vempalli Mallikarjuna", "Sadiyam Padmanabhan Mukeshkumar", "Kencha Harsha Vardhan", "Dasari Chandra"],
            date: "2026/01/13",
            pdf: "IJACM-BEBB7D71.pdf",
            abstract: "DEDUCT is a novel framework for secure data deduplication in cloud storage...",
            keywords: ["data deduplication", "cloud storage", "convergent encryption", "proof-of-ownership"]
        },
        {
            id: "IJACM-429BB5C7",
            title: "Frictional Stability and Surface Integrity of Aluminum-Based Composite Materials",
            authors: ["S. Karthivelan", "M. Arunprasath", "V. Magesh Kumar"],
            date: "2025/12/24",
            pdf: "IJACM-429BB5C7.pdf",
            abstract: "We analyze the frictional properties of aluminum matrix composites...",
            keywords: ["composite materials", "aluminum alloys", "tribology", "surface engineering"]
        },
        {
            id: "IJACM-FCE54392",
            title: "High-Efficiency Thermal Management Using Nanomaterial-Enhanced Heat Exchanger Designs",
            authors: ["K Saravana", "Avaneeth Sinha", "Rakesh Jain"],
            date: "2025/12/24",
            pdf: "IJACM-FCE54392.pdf",
            abstract: "This study investigates graphene-enhanced heat exchangers...",
            keywords: ["thermal management", "nanomaterials", "heat exchangers", "graphene"]
        }
    ];
    
    displayArticles(fallbackArticles, container);
}

function formatDate(dateString) {
    try {
        // Convert "2025/12/05" to Date object
        const dateParts = dateString.split('/');
        const year = dateParts[0];
        const month = parseInt(dateParts[1]) - 1;
        const day = dateParts[2];
        
        const date = new Date(year, month, day);
        const dayNum = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[date.getMonth()];
        const yearNum = date.getFullYear();
        
        return `${dayNum} ${monthName} ${yearNum}`;
    } catch (error) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS for the spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log("✅ Latest Articles Script Ready!");