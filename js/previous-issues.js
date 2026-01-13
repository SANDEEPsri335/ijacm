// js/previous-issues.js - Archives with accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const JSON_FILE = '../data/articles.json';
    let allArticles = [];
    let groupedByMonthYear = {};
    
    // DOM Elements
    const volumesContainer = document.getElementById('volumes-container');
    const statsBadge = document.getElementById('stats-badge');
    
    // Month names for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Initialize
    init();
    
    async function init() {
        await loadArticles();
        processArticles();
        renderIssues();
    }
    
    async function loadArticles() {
        try {
            const response = await fetch(JSON_FILE);
            
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.status}`);
            }
            
            allArticles = await response.json();
            
            // Sort by date (oldest first)
            allArticles.sort((a, b) => {
                const dateA = parseDateString(a.published);
                const dateB = parseDateString(b.published);
                return dateA - dateB;
            });
            
        } catch (error) {
            console.error('Error loading articles:', error);
            allArticles = [];
            showError();
        }
    }
    
    function parseDateString(dateStr) {
        if (!dateStr) return new Date(0);
        
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                return new Date(year, month, day);
            }
            return new Date(dateStr);
        } catch (e) {
            return new Date(0);
        }
    }
    
    function processArticles() {
        groupedByMonthYear = {};
        
        // Group articles by year-month
        allArticles.forEach(article => {
            const date = parseDateString(article.published);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (!groupedByMonthYear[key]) {
                groupedByMonthYear[key] = {
                    year: year,
                    month: month,
                    monthName: monthNames[month],
                    articles: []
                };
            }
            
            groupedByMonthYear[key].articles.push(article);
        });
        
        // Assign Volume and Issue numbers
        const years = [...new Set(Object.keys(groupedByMonthYear).map(key => 
            parseInt(key.split('-')[0])
        ))].sort((a, b) => a - b);
        
        // For each year, assign Volume number
        years.forEach((year, yearIndex) => {
            const volume = yearIndex + 1;
            
            // Get all months for this year and sort them
            const monthsThisYear = Object.keys(groupedByMonthYear)
                .filter(key => key.startsWith(year + '-'))
                .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
            
            // Assign issue numbers
            monthsThisYear.forEach((key, monthIndex) => {
                const issue = monthIndex + 1;
                groupedByMonthYear[key].volume = volume;
                groupedByMonthYear[key].issue = issue;
            });
        });
    }
    
    function renderIssues() {
        volumesContainer.innerHTML = '';
        
        if (allArticles.length === 0) {
            volumesContainer.innerHTML = `
                <div class="no-articles">
                    <i class="fas fa-box-open"></i>
                    <h3>No Archives Found</h3>
                    <p>No articles have been published yet.</p>
                </div>
            `;
            return;
        }
        
        // Update stats badge
        const totalArticles = allArticles.length;
        const totalIssues = Object.keys(groupedByMonthYear).length;
        const totalVolumes = [...new Set(Object.keys(groupedByMonthYear)
            .map(key => groupedByMonthYear[key].volume))].length;
        statsBadge.textContent = `${totalArticles} Articles | ${totalIssues} Issues | ${totalVolumes} Volumes`;
        
        // Get sorted keys (newest first)
        const sortedKeys = Object.keys(groupedByMonthYear).sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return yearB - yearA || monthB - monthA;
        });
        
        sortedKeys.forEach(key => {
            const group = groupedByMonthYear[key];
            
            // Create accordion container
            const accordion = document.createElement('div');
            accordion.className = 'issue-accordion';
            
            // Sort articles within this issue by date (newest first)
            const sortedArticles = [...group.articles].sort((a, b) => {
                const dateA = parseDateString(a.published);
                const dateB = parseDateString(b.published);
                return dateB - dateA;
            });
            
            accordion.innerHTML = `
                <button class="accordion-header">
                    <div class="header-content">
                        <div class="volume-issue">Volume ${group.volume} • Issue ${group.issue}</div>
                        <div class="month-year">${group.monthName} ${group.year}</div>
                    </div>
                    <div class="header-right">
                        <span class="paper-count">${sortedArticles.length} Paper${sortedArticles.length !== 1 ? 's' : ''}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </button>
                
                <div class="accordion-content">
                    <div class="articles-grid">
                        ${sortedArticles.map(article => createArticleCard(article, group.volume, group.issue)).join('')}
                    </div>
                </div>
            `;
            
            // Add click event for accordion
            const header = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');
            const icon = accordion.querySelector('.fa-chevron-down');
            
            header.addEventListener('click', () => {
                const isExpanded = content.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    content.classList.remove('expanded');
                    icon.classList.remove('rotated');
                    content.style.maxHeight = '0';
                } else {
                    // Expand
                    content.classList.add('expanded');
                    icon.classList.add('rotated');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
            
            volumesContainer.appendChild(accordion);
        });
    }
    
    function createArticleCard(article, volume, issue) {
        const formattedDate = formatDate(article.published);
        const doiShort = article.doi ? article.doi.replace('https://doi.org/', '') : '';
        
        return `
            <div class="article-card">
                <div class="article-header">RESEARCH ARTICLE</div>
                
                <div class="article-title">${article.title || 'Untitled Paper'}</div>
                
                <div class="article-meta">
                    <div class="meta-row">
                        <span class="meta-label">Author:</span>
                        <span class="meta-value">${article.authors || 'Unknown Author'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Published:</span>
                        <span class="meta-value">${formattedDate}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Issue:</span>
                        <span class="meta-value">Vol ${volume} • Issue ${issue}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">DOI:</span>
                        <span class="meta-value">
                            ${article.doi ? 
                                `<a href="${article.doi}" target="_blank" title="${article.doi}">${doiShort}</a>` : 
                                'No DOI'}
                        </span>
                    </div>
                </div>
                
                <div class="article-footer">
                    <a href="../paper/${article.article_id || 'document'}.pdf" 
                       target="_blank" 
                       class="view-paper-btn">
                        <i class="fas fa-file-pdf"></i>
                        View Paper
                    </a>
                </div>
            </div>
        `;
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        try {
            const date = parseDateString(dateStr);
            if (date.getTime() === 0) return dateStr;
            
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }
    
    function showError() {
        volumesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Archives</h3>
                <p>Please try again later.</p>
            </div>
        `;
        statsBadge.textContent = "Error Loading Data";
    }
});
