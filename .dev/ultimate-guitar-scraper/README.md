# Ultimate Guitar Tab Scraper

This directory contains tools for extracting your saved tabs from Ultimate Guitar.

## Files Overview

- `extract_tab_urls.py` - Extracts tab URLs from your downloaded HTML file
- `scrape_tabs_simple.py` - Simple web scraper (limited due to JavaScript)
- `ultimate_guitar_urls.txt` - List of all 151 tab URLs extracted from your saved tabs
- `requirements_scraper.txt` - Python dependencies needed for scraping

## Quick Start

1. **Extract URLs** (already done):
   ```bash
   python extract_tab_urls.py
   ```

2. **Best Approach - Browser Automation**:
   Since Ultimate Guitar loads content via JavaScript, the most effective approach is using browser automation tools that we already have working in this project.

## Extracted URLs

Successfully extracted **151 tab URLs** from your Ultimate Guitar saved tabs, including:
- Ukulele tabs
- Chord charts  
- Guitar tabs
- Various artists (Billy Joel, Eagles, Mighty Oaks, Newton Faulkner, etc.)

## Next Steps

The recommended approach is to use the browser automation capabilities we already have working to extract the actual chord/tab content, since traditional web scraping can't handle the JavaScript-rendered content.
