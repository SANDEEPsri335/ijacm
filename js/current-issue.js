// js/current-issue.js - FIXED FOR PAGES FOLDER
console.log('current-issue.js loading...');

// Use a flag to prevent multiple initializations
let isInitialized = false;

function initializeCurrentIssue() {
    // Prevent running multiple times
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }
    isInitialized = true;
    
    console.log('Initializing current issue...');
    
    // FIXED: Since HTML is in pages folder, JSON is one level up
    const JSON_FILE = '../data/articles.json';
    const ITEMS_PER_PAGE = 9;
    let currentPage = 1;
    let allArticles = [];
    let currentMonthArticles = [];
    let currentVolume = 1;
    let currentIssue = 1;
    let currentYear = 2025;
    let currentMonth = 11; // December = 11 (0-indexed)
    
    const articlesContainer = document.getElementById('articles-container');
    const paginationContainer = document.getElementById('pagination');
    const totalPapersElement = document.getElementById('total-papers');
    const latestDateElement = document.getElementById('latest-date');
    const currentMonthElement = document.getElementById('current-month');
    const volumeIssueElement = document.getElementById('volume-issue');
    
    // Initialize
    showLoading();
    loadArticles();
    
    async function loadArticles() {
        try {
            console.log('Loading articles from:', JSON_FILE);
            console.log('Current page location:', window.location.pathname);
            
            const response = await fetch(JSON_FILE);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Successfully loaded JSON data');
            allArticles = data.articles || [];
            console.log(`📄 Loaded ${allArticles.length} articles`);
            
            // Get volume from JSON
            if (data.volume) {
                currentVolume = data.volume;
            }
            
            // Sort by date (newest first)
            allArticles.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB - dateA;
            });
            
            filterCurrentMonthArticles();
            calculateVolumeAndIssue(); // Calculate volume and issue dynamically
            updateHeaderInfo();
            renderArticles();
            renderPagination();
            
            console.log('✅ Current issue loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading articles:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            
            showError(`Failed to load articles. <br><br>
                <strong>Possible issues:</strong><br>
                1. <code>data/articles.json</code> file not found<br>
                2. Incorrect file path<br>
                3. JSON syntax error<br><br>
                <em>Error: ${error.message}</em>`);
        }
    }
    
    function filterCurrentMonthArticles() {
        if (allArticles.length === 0) {
            currentMonthArticles = [];
            return;
        }
        
        // Get the latest article date
        const latestArticle = allArticles[0];
        const latestDate = parseDateString(latestArticle.date);
        currentYear = latestDate.getFullYear();
        currentMonth = latestDate.getMonth();
        
        // Filter articles from the same month
        currentMonthArticles = allArticles.filter(article => {
            const articleDate = parseDateString(article.date);
            return articleDate.getFullYear() === currentYear && 
                   articleDate.getMonth() === currentMonth;
        });
        
        console.log(`📅 Current month (${currentYear}/${currentMonth+1}) has ${currentMonthArticles.length} articles`);
    }
    
    function calculateVolumeAndIssue() {
        if (allArticles.length === 0) return;
        
        // Calculate volume based on year
        if (currentYear === 2025) {
            currentVolume = 1;
        } else {
            // For 2026+, each year gets its own volume
            currentVolume = 1 + (currentYear - 2025);
        }
        
        // Calculate issue number based on month (January = 1, February = 2, etc.)
        currentIssue = currentMonth + 1; // +1 because months are 0-indexed
        
        console.log(`📊 Volume: ${currentVolume}, Issue: ${currentIssue} (Month: ${getMonthName(currentMonth)})`);
    }
    
    function updateHeaderInfo() {
        // Update total papers count
        if (totalPapersElement) {
            totalPapersElement.textContent = currentMonthArticles.length;
        }
        
        // Update latest date
        if (latestDateElement && allArticles.length > 0) {
            const latestDate = parseDateString(allArticles[0].date);
            latestDateElement.textContent = formatDate(latestDate);
        }
        
        // Update current month display
        if (currentMonthElement) {
            currentMonthElement.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
        }
        
        // Update volume/issue display
        if (volumeIssueElement) {
            volumeIssueElement.innerHTML = `Volume: <span>Vol ${currentVolume}</span> • Issue: <span>Issue ${currentIssue}</span>`;
        }
    }
    
    function getMonthName(monthIndex) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[monthIndex];
    }
    
    function parseDateString(dateStr) {
        if (!dateStr) return new Date(0);
        try {
            // Handle YYYY/MM/DD format
            dateStr = dateStr.replace(/\//g, '-');
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(parts[0], parts[1]-1, parts[2]);
            }
            return new Date(dateStr);
        } catch (e) {
            return new Date(0);
        }
    }
    
    function formatDate(date) {
        if (!date || date.getTime() === 0) return 'N/A';
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    }
    
    function createArticleCard(article) {
        const formattedDate = formatDate(parseDateString(article.date));
        const articleId = article.id;
        
        // FIXED: Since we're in pages folder, PDF paths need adjustment
        let pdfPath = article.pdf;
        
        // Add "../paper/" prefix since we're in pages folder
        if (!pdfPath.includes('paper/') && !pdfPath.startsWith('http')) {
            pdfPath = '../paper/' + pdfPath;
        }
        
        // Fix double prefixes
        pdfPath = pdfPath.replace('../paper/../paper/', '../paper/');
        
        console.log(`📎 PDF path for ${articleId}: ${pdfPath}`);
        
        // Extract PDF file name without extension
        let pdfFileName = pdfPath.split('/').pop();
        pdfFileName = pdfFileName.replace('.pdf', '');
        
        // Create HTML file path - articles folder is in root, so go up from pages
        const htmlFilePath = `../articles/${pdfFileName}.html`;
        
        // Get first 3 authors, add "et al." if more
        const authors = article.authors.length > 3 
            ? `${article.authors.slice(0, 3).join(', ')} et al.`
            : article.authors.join(', ');
        
        return `
        <div class="article-card">
            <div class="article-header">
                <span class="badge research">RESEARCH ARTICLE</span>
                <span class="badge volume">Vol ${currentVolume}, Issue ${currentIssue}</span>
            </div>
            
            <h3 class="article-title">
                <a href="${htmlFilePath}" target="_blank" class="article-title-link">
                    ${article.title}
                </a>
            </h3>
            
            <div class="article-authors">
                <i class="fas fa-user-edit"></i> ${authors}
            </div>
            
            <div class="article-meta">
                <div class="meta-item">
                    <i class="far fa-calendar-alt"></i>
                    <span>Published: ${formattedDate}</span>
                </div>
                <div class="meta-item">
                    <i class="far fa-file-alt"></i>
                    <span>Pages: ${article.pages}</span>
                </div>
                ${article.doi ? `
                <div class="meta-item">
                    <i class="fas fa-fingerprint"></i>
                    <span>DOI: <a href="https://doi.org/${article.doi}" target="_blank">${article.doi}</a></span>
                </div>
                ` : ''}
            </div>
            
            <div class="article-actions">
                <a href="${htmlFilePath}" target="_blank" class="btn btn-details">
                    <i class="fas fa-file-alt"></i> View Details
                </a>
                <a href="${pdfPath}" class="btn btn-pdf" target="_blank">
                    <i class="fas fa-download"></i> PDF
                </a>
            </div>
        </div>
        `;
    }
    
    function renderArticles() {
        if (!articlesContainer) return;
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageArticles = currentMonthArticles.slice(startIndex, endIndex);
        
        if (currentMonthArticles.length === 0) {
            articlesContainer.innerHTML = '<div class="no-articles">No articles available for this month.</div>';
            return;
        }
        
        articlesContainer.innerHTML = pageArticles.map(article => createArticleCard(article)).join('');
        console.log(`✅ Rendered ${pageArticles.length} articles`);
    }
    
    function renderPagination() {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(currentMonthArticles.length / ITEMS_PER_PAGE);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
            onclick="window.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                onclick="window.changePage(${i})">${i}</button>`;
        }
        
        // Next button
        paginationHTML += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
            onclick="window.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        paginationContainer.innerHTML = paginationHTML;
    }
    
    function showLoading() {
        if (articlesContainer) {
            articlesContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading articles...</p>
                </div>
            `;
        }
    }
    
    function showError(message) {
        if (articlesContainer) {
            articlesContainer.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #ff6b6b; background: rgba(255, 107, 107, 0.1); border-radius: 10px; border: 1px solid rgba(255, 107, 107, 0.3);">
                    <h3 style="color: #ff6b6b; margin-bottom: 15px;"><i class="fas fa-exclamation-triangle"></i> Error Loading Articles</h3>
                    <div style="text-align: left; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${message}
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #90a4ae;">
                        Expected path: <code>../data/articles.json</code>
                    </p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 25px; background: #00b0ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-redo"></i> Retry Loading
                    </button>
                </div>
            `;
        }
    }
    
    // Make functions available globally
    window.changePage = function(page) {
        const totalPages = Math.ceil(currentMonthArticles.length / ITEMS_PER_PAGE);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderArticles();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCurrentIssue);
} else {
    initializeCurrentIssue();
}

console.log('current-issue.js loaded successfully');
