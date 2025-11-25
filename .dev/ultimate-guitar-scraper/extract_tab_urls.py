#!/usr/bin/env python3
"""
Ultimate Guitar Tab URL Extractor

This script extracts all tab URLs from your saved Ultimate Guitar HTML file.
It finds URLs that match the pattern: https://tabs.ultimate-guitar.com/tab/...
"""

import re
import sys
from pathlib import Path

def extract_tab_urls(html_file_path):
    """Extract all Ultimate Guitar tab URLs from the HTML file."""
    
    # Read the HTML file
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return []
    
    # Pattern to match Ultimate Guitar tab URLs
    # Looking for: https://tabs.ultimate-guitar.com/tab/artist/song-type-number
    pattern = r'https://tabs\.ultimate-guitar\.com/tab/[^"\s<>]+'
    
    # Find all matches
    urls = re.findall(pattern, html_content)
    
    # Remove duplicates while preserving order
    unique_urls = []
    seen = set()
    for url in urls:
        if url not in seen:
            unique_urls.append(url)
            seen.add(url)
    
    return unique_urls

def main():
    # Default path to your downloaded HTML file
    html_file = Path.home() / "Downloads" / "(1) My tabs @ Ultimate-Guitar.Com.html"
    
    # Allow custom path as command line argument
    if len(sys.argv) > 1:
        html_file = Path(sys.argv[1])
    
    # Check if file exists
    if not html_file.exists():
        print(f"HTML file not found: {html_file}")
        print("Please provide the correct path to your downloaded HTML file.")
        return
    
    print(f"Extracting tab URLs from: {html_file}")
    
    # Extract URLs
    urls = extract_tab_urls(html_file)
    
    if not urls:
        print("No tab URLs found in the HTML file.")
        return
    
    print(f"\nFound {len(urls)} unique tab URLs:")
    print("-" * 50)
    
    # Print all URLs
    for i, url in enumerate(urls, 1):
        print(f"{i:3d}. {url}")
    
    # Save to file
    output_file = Path.cwd() / "ultimate_guitar_urls.txt"
    with open(output_file, 'w') as f:
        for url in urls:
            f.write(url + '\n')
    
    print(f"\nURLs saved to: {output_file}")
    print(f"Total tabs found: {len(urls)}")

if __name__ == "__main__":
    main()
