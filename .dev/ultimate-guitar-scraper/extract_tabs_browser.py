#!/usr/bin/env python3
"""
Ultimate Guitar Tab Content Extractor using Browser Automation

This script uses the browser automation we already have working to extract
the actual chord/tab content that gets loaded via JavaScript.
"""

import json
import time
import re
from pathlib import Path

def extract_tab_from_browser(url, browser_nav_func, browser_snapshot_func, browser_eval_func):
    """
    Extract tab content using browser automation functions.
    This would be called from a script that has access to browser automation.
    """
    try:
        print(f"Navigating to: {url}")
        # Navigate to the tab page
        nav_result = browser_nav_func(url)
        
        # Wait for content to load
        time.sleep(3)
        
        # Take snapshot to analyze page structure
        snapshot = browser_snapshot_func()
        
        # Extract title and artist from page
        title_eval = """
        () => {
            const h1 = document.querySelector('h1');
            return h1 ? h1.textContent.trim() : '';
        }
        """
        title_result = browser_eval_func(title_eval)
        
        # Extract the main tab content using JavaScript
        content_eval = """
        () => {
            // Try multiple selectors for tab content
            const selectors = [
                'code',
                'pre', 
                '.js-tab-content',
                '[data-content]',
                '.tab-content'
            ];
            
            for (const selector of selectors) {
                const elem = document.querySelector(selector);
                if (elem && elem.textContent.trim().length > 50) {
                    return {
                        content: elem.textContent.trim(),
                        source: selector,
                        length: elem.textContent.trim().length
                    };
                }
            }
            
            return { content: '', source: 'none', length: 0 };
        }
        """
        
        content_result = browser_eval_func(content_eval)
        
        return {
            'url': url,
            'title': title_result,
            'content_data': content_result,
            'success': True
        }
        
    except Exception as e:
        print(f"Error extracting from {url}: {e}")
        return {
            'url': url,
            'error': str(e),
            'success': False
        }

# This is the main approach - using browser automation
# Since we can't directly call browser functions from this script,
# let's create a plan for manual execution

def create_browser_extraction_plan():
    """Create step-by-step plan for browser-based extraction."""
    
    plan = """
# Browser-Based Tab Extraction Plan

## Step 1: Prepare URL List (✅ DONE)
- We have all 151 URLs in ultimate_guitar_urls.txt

## Step 2: Browser Automation Script
You'll need to run this in your browser console or create a browser extension script:

```javascript
// Ultimate Guitar Tab Extractor
async function extractAllTabs() {
    const urls = [
        // Paste your 151 URLs here, or load from file
        'https://tabs.ultimate-guitar.com/tab/billy-joel/vienna-ukulele-1755704',
        // ... etc
    ];
    
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`Processing ${i+1}/${urls.length}: ${url}`);
        
        try {
            // Navigate to URL
            window.location.href = url;
            
            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Extract title and artist
            const h1 = document.querySelector('h1');
            const title = h1 ? h1.textContent.trim() : 'Unknown';
            
            // Extract tab content
            let content = '';
            let source = 'none';
            
            const selectors = ['code', 'pre', '.js-tab-content', '[data-content]'];
            for (const selector of selectors) {
                const elem = document.querySelector(selector);
                if (elem && elem.textContent.trim().length > 50) {
                    content = elem.textContent.trim();
                    source = selector;
                    break;
                }
            }
            
            results.push({
                url,
                title,
                content,
                source,
                contentLength: content.length
            });
            
            console.log(`✓ Extracted: ${title} (${content.length} chars)`);
            
        } catch (error) {
            console.error(`✗ Failed: ${url}`, error);
            results.push({ url, error: error.message, success: false });
        }
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Download results as JSON
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ultimate_guitar_tabs.json';
    link.click();
    
    console.log('Extraction complete! Downloaded results.');
    return results;
}

// Run the extraction
extractAllTabs();
```

## Step 3: Alternative - Use the browser tools we already have

Since we already have working browser automation, we can use that approach!
"""
    
    return plan

def main():
    """Main function - creates extraction plan."""
    plan = create_browser_extraction_plan()
    
    plan_file = Path.cwd() / "browser_extraction_plan.md"
    with open(plan_file, 'w') as f:
        f.write(plan)
    
    print(plan)
    print(f"\nPlan saved to: {plan_file}")

if __name__ == "__main__":
    main()
