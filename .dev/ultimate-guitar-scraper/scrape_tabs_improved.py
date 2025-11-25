#!/usr/bin/env python3
"""
Ultimate Guitar Tab Content Scraper - Improved Version

This script takes the URLs extracted from your saved tabs and downloads
the actual chord/tab content from each page with better parsing.
"""

import requests
import time
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import sys

class TabScraper:
    def __init__(self):
        self.session = requests.Session()
        # Set a user agent to avoid being blocked
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.delay = 2  # Delay between requests to be respectful
        
    def extract_tab_content(self, url):
        """Extract the tab content from a Ultimate Guitar URL."""
        try:
            print(f"Fetching: {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract song title and artist from the page
            title = "Unknown"
            artist = "Unknown"
            
            # Method 1: Look for the main heading (pattern like "Vienna Ukulele Chords by Billy Joel")
            h1_elem = soup.find('h1')
            if h1_elem:
                h1_text = h1_elem.get_text().strip()
                print(f"Found h1: {h1_text}")
                if " by " in h1_text:
                    title_part, artist = h1_text.split(" by ", 1)
                    # Clean up title (remove type info like "Ukulele Chords", "Tab", etc.)
                    title = re.sub(r'\s+(Chords|Tab|Ukulele|Bass).*$', '', title_part).strip()
                else:
                    title = h1_text
            
            # Method 2: Look for artist link if not found above
            if artist == "Unknown":
                artist_link = soup.find('a', href=re.compile(r'/artist/'))
                if artist_link:
                    artist = artist_link.get_text().strip()
                    print(f"Found artist link: {artist}")
            
            # Method 3: Extract from URL as fallback
            if title == "Unknown" or artist == "Unknown":
                url_parts = url.split('/')
                if len(url_parts) >= 6:  # https://tabs.ultimate-guitar.com/tab/artist/song-type-id
                    if artist == "Unknown":
                        artist = url_parts[5].replace('-', ' ').title()
                        print(f"Artist from URL: {artist}")
                    if title == "Unknown":
                        song_part = url_parts[6]
                        # Remove type and ID from end
                        song_clean = re.sub(r'-(chords|tabs|ukulele|bass)-\d+$', '', song_part)
                        title = song_clean.replace('-', ' ').title()
                        print(f"Title from URL: {title}")
            
            # Extract the main tab content
            tab_content = ""
            
            # Method 1: Look for <code> elements (most common for chord/tab content)
            code_elem = soup.find('code')
            if code_elem:
                tab_content = code_elem.get_text(strip=False)
                print(f"Found content in <code>: {len(tab_content)} characters")
            
            # Method 2: Look for pre-formatted text areas
            if not tab_content:
                pre_elem = soup.find('pre')
                if pre_elem:
                    tab_content = pre_elem.get_text(strip=False)
                    print(f"Found content in <pre>: {len(tab_content)} characters")
            
            # Method 3: Look for specific Ultimate Guitar content containers
            if not tab_content:
                for selector in [
                    '.js-tab-content',
                    '[data-content]', 
                    '.tab-content',
                    '.chord-content',
                    '.tab_text_content'
                ]:
                    elem = soup.select_one(selector)
                    if elem:
                        tab_content = elem.get_text(strip=False)
                        print(f"Found content in {selector}: {len(tab_content)} characters")
                        break
            
            # If still no content, look for any large text blocks
            if not tab_content:
                # Look for divs or spans with lots of text that might contain chords
                all_text_elements = soup.find_all(['div', 'span', 'p'], string=re.compile(r'[A-G]m?[\d#b]*'))
                for elem in all_text_elements:
                    text = elem.get_text()
                    if len(text) > 200:  # Reasonable size for tab content
                        tab_content = text
                        print(f"Found content in text block: {len(tab_content)} characters")
                        break
            
            # Clean up the URL to get song and type info
            url_parts = url.split('/')
            song_info = url_parts[-1] if url_parts else ""
            
            # Determine tab type from URL
            tab_type = "chords"
            if "-tabs-" in song_info:
                tab_type = "tab"
            elif "-ukulele-" in song_info:
                tab_type = "ukulele"
            elif "-bass-" in song_info:
                tab_type = "bass"
            
            return {
                'url': url,
                'title': title,
                'artist': artist,
                'song_info': song_info,
                'tab_type': tab_type,
                'content': tab_content,
                'content_length': len(tab_content),
                'success': True
            }
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return {
                'url': url,
                'error': str(e),
                'success': False
            }
    
    def save_tab_data(self, tab_data, output_dir):
        """Save individual tab data to files."""
        if not tab_data['success']:
            return
            
        # Create filename-safe version
        artist = re.sub(r'[^\w\s-]', '', tab_data['artist']).strip()
        title_clean = re.sub(r'[^\w\s-]', '', tab_data['title']).strip()
        filename = f"{artist} - {title_clean} - {tab_data['tab_type']}.txt"
        filename = filename.replace('  ', ' ')[:100]  # Limit length
        
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"Title: {tab_data['title']}\n")
            f.write(f"Artist: {tab_data['artist']}\n")
            f.write(f"Type: {tab_data['tab_type']}\n")
            f.write(f"Source: {tab_data['url']}\n")
            f.write(f"Content Length: {tab_data.get('content_length', 0)} characters\n")
            f.write("=" * 50 + "\n\n")
            f.write(tab_data['content'])
    
    def scrape_all_tabs(self, urls_file, output_dir=None):
        """Scrape all tabs from the URLs file."""
        
        # Set up output directory
        if output_dir is None:
            output_dir = Path.cwd() / "scraped_tabs_improved"
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(exist_ok=True)
        
        # Read URLs
        urls = []
        with open(urls_file, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        print(f"Found {len(urls)} URLs to scrape")
        print(f"Output directory: {output_dir}")
        
        # Scrape each URL
        results = []
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing...")
            
            tab_data = self.extract_tab_content(url)
            results.append(tab_data)
            
            if tab_data['success']:
                self.save_tab_data(tab_data, output_dir)
                content_info = f"({tab_data.get('content_length', 0)} chars)" if tab_data.get('content_length') else ""
                print(f"✓ Saved: {tab_data['artist']} - {tab_data['title']} {content_info}")
            else:
                print(f"✗ Failed: {url}")
            
            # Be respectful with delays
            if i < len(urls):  # Don't sleep after the last one
                time.sleep(self.delay)
        
        # Save summary
        summary_file = output_dir / "scraping_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        successful = sum(1 for r in results if r['success'])
        with_content = sum(1 for r in results if r['success'] and r.get('content_length', 0) > 0)
        print(f"\n" + "="*50)
        print(f"Scraping complete!")
        print(f"Successful: {successful}/{len(urls)}")
        print(f"With content: {with_content}/{len(urls)}")
        print(f"Failed: {len(urls) - successful}/{len(urls)}")
        print(f"Files saved to: {output_dir}")
        
        return results

def main():
    """Main function."""
    urls_file = Path.cwd() / "ultimate_guitar_urls.txt"
    
    # Allow custom URLs file
    if len(sys.argv) > 1:
        urls_file = Path(sys.argv[1])
    
    if not urls_file.exists():
        print(f"URLs file not found: {urls_file}")
        print("Please run extract_tab_urls.py first to generate the URLs file.")
        return
    
    scraper = TabScraper()
    scraper.scrape_all_tabs(urls_file)

if __name__ == "__main__":
    main()
