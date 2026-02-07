// js/previous-issues.js - UPDATED TO MATCH CURRENT ISSUE STYLE
console.log('previous-issues.js loading...');

let isInitialized = false;

function initializePreviousIssues() {
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }
    isInitialized = true;
    
    console.log('Initializing previous issues...');
    
    const JSON_FILE = '../data/articles.json';
    let allArticles = [];
    let groupedIssues = [];
    
    const issuesContainer = document.getElementById('volumes-container');
    const statsBadge = document.getElementById('stats-badge');
    
    init();
    
    async function init() {
        showLoading();
        await loadArticles();
        processArticles();
        renderIssues();
        updateStats();
    }
    
    async function loadArticles() {
        try {
            console.log('Loading articles from:', JSON_FILE);
            const response = await fetch(JSON_FILE);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            
            const data = await response.json();
            allArticles = data.articles || [];
            console.log(`Loaded ${allArticles.length} articles`);
            
            // Sort by date (newest first)
            allArticles.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB - dateA;
            });
            
        } catch (error) {
            console.error('Error loading articles:', error);
            allArticles = [];
            showError('Failed to load articles. Please try again later.');
        }
    }
    
    function processArticles() {
        // Group articles by year-month
        const monthMap = new Map();
        
        allArticles.forEach(article => {
            const date = parseDateString(article.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (!monthMap.has(key)) {
                monthMap.set(key, {
                    year: year,
                    month: month,
                    monthName: getMonthName(month),
                    articles: []
                });
            }
            monthMap.get(key).articles.push(article);
        });
        
        // Sort keys by year and month (OLDEST first for chronological issue numbering)
        const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return yearA - yearB || monthA - monthB;
        });
        
        // Assign volume and issue numbers
        let currentVolume = 0;
        let currentIssue = 0;
        let previousYear = null;
        
        sortedKeys.forEach((key, index) => {
            const issue = monthMap.get(key);
            const year = issue.year;
            
            // Determine volume number
            if (year === 2025) {
                issue.volume = 1;
            } else {
                // For 2026+, each year gets its own volume
                issue.volume = 1 + (year - 2025);
            }
            
            // Reset issue counter for each new volume/year
            if (previousYear !== year) {
                currentIssue = 1;  // Start at 1 for each new year
                previousYear = year;
            } else {
                currentIssue++;    // Increment within the same year
            }
            
            issue.issue = currentIssue;
            issue.id = key;
            
            // Sort articles within each issue (newest first)
            issue.articles.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB - dateA;
            });
            
            groupedIssues.push(issue);
        });
        
        // Now sort groupedIssues for display (newest first)
        groupedIssues.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        console.log(`Processed ${groupedIssues.length} issues`);
    }
    
    function renderIssues() {
        if (!issuesContainer) return;
        
        if (groupedIssues.length === 0) {
            issuesContainer.innerHTML = '<div class="no-issues">No previous issues found.</div>';
            return;
        }
        
        issuesContainer.innerHTML = groupedIssues.map(issue => createIssueAccordion(issue)).join('');
        
        // Initialize accordion functionality
        initializeAccordions();
    }
    
    function createIssueAccordion(issue) {
        const articleCount = issue.articles.length;
        
        return `
        <div class="issue-accordion">
            <button class="accordion-header">
                <div class="header-content">
                    <div class="volume-issue">Volume ${issue.volume} • Issue ${issue.issue}</div>
                    <div class="month-year">${issue.monthName} ${issue.year}</div>
                </div>
                <div class="header-right">
                    <span class="paper-count">${articleCount} Paper${articleCount !== 1 ? 's' : ''}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </button>
            
            <div class="accordion-content">
                <div class="articles-grid">
                    ${issue.articles.map(article => createArticleCard(article, issue.volume, issue.issue)).join('')}
                </div>
            </div>
        </div>
        `;
    }
    
    function createArticleCard(article, volume, issue) {
        const formattedDate = formatDate(parseDateString(article.date));
        
        // Get first 3 authors, add "et al." if more
        const authors = article.authors.length > 3 
            ? `${article.authors.slice(0, 3).join(', ')} et al.`
            : article.authors.join(', ');
        
        return `
        <div class="article-card">
            <div class="article-header">
                <span class="badge research">RESEARCH ARTICLE</span>
                <span class="badge volume">Vol ${volume}, Issue ${issue}</span>
            </div>
            
            <h3 class="article-title">
                <a href="${getArticleHtmlPath(article)}" target="_blank" class="article-title-link">
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
                <a href="${getArticleHtmlPath(article)}" target="_blank" class="btn btn-details">
                    <i class="fas fa-file-alt"></i> View Details
                </a>
                <a href="../${getPdfPath(article)}" class="btn btn-pdf" target="_blank">
                    <i class="fas fa-download"></i> PDF
                </a>
            </div>
        </div>
        `;
    }
    
    function getArticleHtmlPath(article) {
        let pdfPath = article.pdf || '';
        
        // Extract PDF file name without extension
        if (pdfPath.includes('paper/')) {
            pdfPath = pdfPath.replace('paper/', '');
        }
        
        let pdfFileName = pdfPath.split('/').pop();
        pdfFileName = pdfFileName.replace('.pdf', '');
        
        return `../articles/${pdfFileName}.html`;
    }
    
    function getPdfPath(article) {
        let pdfPath = article.pdf || '';
        
        // Ensure it has paper/ prefix
        if (!pdfPath.includes('paper/') && !pdfPath.startsWith('http')) {
            pdfPath = 'paper/' + pdfPath;
        }
        
        return pdfPath;
    }
    
    function initializeAccordions() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.fa-chevron-down');
                
                if (content.classList.contains('expanded')) {
                    // Collapse
                    content.classList.remove('expanded');
                    content.style.maxHeight = null;
                    icon.classList.remove('rotated');
                } else {
                    // Expand
                    content.classList.add('expanded');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.classList.add('rotated');
                }
            });
        });
    }
    
    function updateStats() {
        if (!statsBadge) return;
        
        const totalArticles = allArticles.length;
        const totalIssues = groupedIssues.length;
        const totalVolumes = new Set(groupedIssues.map(issue => issue.volume)).size;
        
        statsBadge.textContent = `${totalArticles} Articles | ${totalIssues} Issues | ${totalVolumes} Volumes`;
    }
    
    function showLoading() {
        if (issuesContainer) {
            issuesContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading previous issues...</p>
                </div>
            `;
        }
    }
    
    function showError(message) {
        if (issuesContainer) {
            issuesContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="retry-btn">
                        Retry
                    </button>
                </div>
            `;
        }
    }
    
    // Helper functions
    function parseDateString(dateStr) {
        if (!dateStr) return new Date(0);
        try {
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
    
    function getMonthName(monthIndex) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[monthIndex];
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreviousIssues);
} else {
    initializePreviousIssues();
}

console.log('previous-issues.js loaded successfully');
