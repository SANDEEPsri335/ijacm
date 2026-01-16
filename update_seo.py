import os
import re
from datetime import datetime

# ========== CONFIGURATION ==========
ROOT_DIR = r"c:\Users\tejan\Downloads\Journal Site"
BASE_URL = "https://ijacm.com"  # ✅ CORRECTED DOMAIN
JOURNAL_NAME = "International Journal of Advanced Computing and Mechanical Systems"
JOURNAL_ACRONYM = "IJACM"

# ========== UPDATED KEYWORD GROUPS ==========
KEYWORDS_PRIMARY = [
    # BRAND KEYWORDS (MOST IMPORTANT)
    "IJACM", "ijacm journal", "ijacm.com", "IJACM International Journal",
    "IJACM mechanical journal", "IJACM computer journal",
    
    # FULL NAME
    "International Journal of Advanced Computing and Mechanical Systems",
    
    # PRICE-BASED KEYWORDS (NEW - CRITICAL)
    "engineering journal under 2000", "journal under ₹2000",
    "scopus journal under 2000 rupees", "crossref journal under 2000",
    "doi journal cheap", "affordable engineering journal",
    "low cost publication journal", "cheap scopus journal",
    "mechanical journal affordable", "cse journal low cost",
    
    # INDEXING KEYWORDS
    "scopus indexed journal", "crossref indexed", "doi journal",
    "peer-reviewed journal", "open access journal", "google scholar indexed",
    
    # FIELD-SPECIFIC
    "mechanical engineering journal", "computer science journal",
    "advanced computing journal", "engineering research journal"
]

KEYWORDS_TECHNICAL = [
    "computational fluid dynamics", "finite element analysis", "robotics and automation",
    "artificial intelligence in engineering", "machine learning applications", "smart manufacturing",
    "IoT in mechanical systems", "cyber-physical systems", "digital twin technology",
    "additive manufacturing research", "predictive maintenance", "industrial automation"
]

KEYWORDS_ACADEMIC = [
    "engineering research papers", "scientific publications", "academic journal indexing",
    "research paper publication", "engineering manuscript submission", "technical paper review",
    "scholarly articles", "academic conference proceedings", "research dissemination"
]

KEYWORDS_INDUSTRY = [
    "automotive engineering research", "aerospace engineering applications", 
    "renewable energy systems", "biomechanical engineering", "manufacturing technology"
]

KEYWORDS_LONG_TAIL = [
    "how to publish in engineering journal", "submit research paper to IJACM",
    "engineering journal impact factor", "latest research in mechanical engineering",
    "computational engineering advancements", "scopus indexed journal low cost",
    "crossref doi journal affordable", "fast publication engineering journal"
]

# Helper to combine keywords
def get_keywords(categories):
    all_kws = []
    for cat in categories:
        all_kws.extend(cat)
    # Deduplicate and join
    return ", ".join(list(dict.fromkeys(all_kws)))

# ========== UPDATED PAGE MAPPING ==========
def get_page_metadata(filename):
    name_lower = filename.lower()
    
    # NEW SEO PAGES (HIGH PRIORITY)
    if "ijacm-journal" in name_lower:
        title = f"IJACM Journal | International Journal of Advanced Computing & Mechanical Systems | Under ₹2000"
        desc = f"IJACM (International Journal of Advanced Computing and Mechanical Systems) - Scopus indexed engineering journal with publication fees under ₹2000. Publish with DOI, Crossref indexing."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    elif "engineering-journal-under-2000" in name_lower:
        title = f"Engineering Journal Under ₹2000 | Scopus Indexed | IJACM Publications"
        desc = f"Publish in Scopus indexed engineering journal under ₹2000. IJACM offers fast publication with Crossref DOI. Mechanical, CSE, electronics research papers accepted."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    elif "scopus-journal-under-2000" in name_lower:
        title = f"Scopus Indexed Journal Under ₹2000 | Fast Publication | IJACM"
        desc = f"Find Scopus indexed journals under 2000 rupees. IJACM provides affordable Scopus-indexed publication with proper DOI and global visibility for engineering research."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    elif "crossref-doi-journal-cheap" in name_lower:
        title = f"Crossref DOI Journal Under ₹2000 | Affordable Publication | IJACM"
        desc = f"Publish with Crossref DOI for under ₹2000. IJACM offers DOI assignment, Google Scholar indexing, and rapid publication for engineering and science papers."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    elif "mechanical-engineering-journal-affordable" in name_lower:
        title = f"Mechanical Engineering Journal Under ₹2000 | IJACM Publications"
        desc = f"Affordable mechanical engineering journal with publication fees under ₹2000. Publish robotics, thermal, manufacturing research with DOI and proper indexing."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    elif "cse-journal-low-cost" in name_lower:
        title = f"Computer Science Journal Under ₹2000 | CSE Publications | IJACM"
        desc = f"Low cost CSE journal under ₹2000 for AI, ML, data science, networking research. Fast publication with Crossref DOI and Google Scholar indexing."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.9"
        
    # EXISTING PAGES (UPDATED)
    elif "index" in name_lower:
        title = f"IJACM - International Journal of Advanced Computing & Mechanical Systems | Engineering Journal Under ₹2000"
        desc = f"IJACM Journal: Affordable Scopus indexed engineering journal under ₹2000. Publish mechanical, computer science research with Crossref DOI. Open access, fast publication."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "1.0"
        
    elif "about" in name_lower or "aims" in name_lower or "scope" in name_lower:
        title = f"About IJACM | Scopus Indexed Journal Under ₹2000"
        desc = f"Learn about IJACM's mission, aims and scope. Affordable engineering journal under ₹2000 covering computational mechanics, AI in engineering, robotics."
        kws = get_keywords([KEYWORDS_PRIMARY, KEYWORDS_TECHNICAL])
        priority = "0.8"
        
    elif "submit" in name_lower or "guidelines" in name_lower or "author" in name_lower:
        title = f"Submit Paper to IJACM | Engineering Journal Under ₹2000"
        desc = f"Submit your research to IJACM - affordable engineering journal under ₹2000. Read author guidelines for publishing engineering research papers."
        kws = get_keywords([KEYWORDS_PRIMARY, KEYWORDS_ACADEMIC])
        priority = "0.9"
        
    elif "issue" in name_lower or "volume" in name_lower:
        title = f"Current Issue - IJACM | Engineering Journal Under ₹2000"
        desc = f"Browse current and past issues of IJACM. Latest research in mechanical engineering and advanced computing. Affordable publication under ₹2000."
        kws = get_keywords([KEYWORDS_PRIMARY, KEYWORDS_TECHNICAL])
        priority = "0.7"
        
    elif "editorial" in name_lower or "board" in name_lower:
        title = f"Editorial Board - IJACM | Scopus Indexed Journal"
        desc = f"Meet the distinguished editorial board members of IJACM, experts in computing, mechanics, and engineering systems. Affordable journal under ₹2000."
        kws = get_keywords([KEYWORDS_PRIMARY, KEYWORDS_ACADEMIC])
        priority = "0.6"
        
    elif "contact" in name_lower:
        title = f"Contact Us - IJACM Journal"
        desc = f"Get in touch with the IJACM editorial team for inquiries about submissions, special issues, or journal policies. Affordable engineering journal under ₹2000."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.5"
        
    else:
        # Fallback for generic pages
        clean_name = filename.replace('.html', '').replace('-', ' ').title()
        title = f"{clean_name} - IJACM Journal"
        desc = f"Read {clean_name} at IJACM - International Journal of Advanced Computing and Mechanical Systems. Open access engineering journal under ₹2000."
        kws = get_keywords([KEYWORDS_PRIMARY])
        priority = "0.6"
        
    return title, desc, kws, priority

# ========== REST OF THE SCRIPT STAYS SAME ==========
def update_html_file(file_path, relative_path):
    filename = os.path.basename(file_path)
    title, desc, kws, priority = get_page_metadata(filename)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Update/Add Title
    if "<title>" in content:
        content = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", content, flags=re.DOTALL)
    else:
        content = content.replace("<head>", f"<head>\n    <title>{title}</title>")

    # 2. Update/Add Description
    meta_desc = f'<meta name="description" content="{desc}">'
    if 'name="description"' in content:
        content = re.sub(r'<meta name="description" content=".*?">', meta_desc, content, flags=re.DOTALL)
    else:
        if "</title>" in content:
            content = content.replace("</title>", f"</title>\n    {meta_desc}")
        else:
            content = content.replace("<head>", f"<head>\n    {meta_desc}")

    # 3. Update/Add Keywords
    meta_kw = f'<meta name="keywords" content="{kws}">'
    if 'name="keywords"' in content:
        content = re.sub(r'<meta name="keywords" content=".*?">', meta_kw, content, flags=re.DOTALL)
    else:
        if "</title>" in content:
            content = content.replace("</title>", f"</title>\n    {meta_kw}")
        else:
            content = content.replace("<head>", f"<head>\n    {meta_kw}")
            
    # 4. Ensure Viewport
    if 'name="viewport"' not in content:
        viewport_tag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        if "</title>" in content:
            content = content.replace("</title>", f"</title>\n    {viewport_tag}")
        else:
            content = content.replace("<head>", f"<head>\n    {viewport_tag}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated: {filename}")
    return priority

def generate_sitemap(url_data):
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url, priority in url_data:
        sitemap_content += '  <url>\n'
        sitemap_content += f'    <loc>{url}</loc>\n'
        sitemap_content += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
        sitemap_content += '    <changefreq>monthly</changefreq>\n'
        sitemap_content += f'    <priority>{priority}</priority>\n'
        sitemap_content += '  </url>\n'
        
    sitemap_content += '</urlset>'
    
    with open(os.path.join(ROOT_DIR, "sitemap.xml"), "w", encoding='utf-8') as f:
        f.write(sitemap_content)
    print("Sitemap generated.")

def main():
    url_data = []
    
    # Walk through directory
    for subdir, dirs, files in os.walk(ROOT_DIR):
        # Determine relative path from root to build URL
        rel_dir = os.path.relpath(subdir, ROOT_DIR)
        if rel_dir == ".":
            rel_dir = ""
            
        # Skip hidden folders and components
        if any(part.startswith('.') for part in rel_dir.split(os.sep)):
            continue
        if "components" in rel_dir or "assets" in rel_dir or "css" in rel_dir or "js" in rel_dir or "brain" in rel_dir:
            continue
            
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                priority = update_html_file(file_path, rel_dir)
                
                # Build URL
                if rel_dir:
                    url_path = f"{rel_dir}/{file}".replace("\\", "/")
                else:
                    url_path = file
                    
                full_url = f"{BASE_URL}/{url_path}"
                url_data.append((full_url, priority))
                
    generate_sitemap(url_data)

if __name__ == "__main__":
    main()