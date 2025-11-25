#!/usr/bin/env python3
"""
Ultimate Guitar Tab Content Scraper - Simple & Robust Version

This version focuses on being crash-proof and extracting what's available.
"""

import requests
import time
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
import sys

class SimpleTabScraper:
    def __init__(self):
        self.session = requests.Session()
        # Set a user agent to avoid being blocked
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.delay = 2  # Delay between requests to be respectful
        
    def extract_from_url(self, url):
        """Extract basic info from URL as fallback."""
        try:
            url_parts = url.split('/')
            if len(url_parts) >= 6:
                artist = url_parts[5].replace('-', ' ').title()
                song_full = url_parts[6]
                
                # Extract song name and type
                # Pattern: song-name-type-id
                if '-' in song_full:
                    parts = song_full.split('-')
                    # Find where the type starts (chords, tabs, ukulele, bass)
                    type_indicators = ['chords', 'tabs', 'ukulele', 'bass']
                    type_idx = None
                    tab_type = 'chords'  # default
                    
                    for i, part in enumerate(parts):
                        if part.lower() in type_indicators:
                            type_idx = i
                            tab_type = part.lower()
                            break
                    
                    if type_idx:
                        song_name = ' '.join(parts[:type_idx]).title()
                    else:
                        song_name = song_full.replace('-', ' ').title()
                else:
                    song_name = song_full.replace('-', ' ').title()
                    tab_type = 'chords'
                
                return artist, song_name, tab_type
        except:
            pass
        
        return "Unknown Artist", "Unknown Song", "chords"
        
    def extract_tab_content(self, url):
        """Extract the tab content from a Ultimate Guitar URL with robust error handling."""
        try:
            print(f"Fetching: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Get fallback info from URL
            artist_fallback, title_fallback, type_fallback = self.extract_from_url(url)
            
            # Try to extract title and artist from page
            title = title_fallback
            artist = artist_fallback
            tab_type = type_fallback
            
            # Look for h1 title
            try:
                h1_elem = soup.find('h1')
                if h1_elem:
                    h1_text = h1_elem.get_text().strip()
                    if h1_text and len(h1_text) > 0:
                        print(f"Found title: {h1_text}")
                        # Try to parse "Song Title Type by Artist"
                        if " by " in h1_text.lower():
                            parts = h1_text.split(" by ")
                            if len(parts) == 2:
                                title = parts[0].strip()
                                artist = parts[1].strip()
                                # Clean up title (remove "Chords", "Tab", etc.)
                                title = re.sub(r'\s+(Chords|Tab|Ukulele|Bass)$', '', title, flags=re.IGNORECASE).strip()
            except Exception as e:
                print(f"Error parsing title: {e}")
            
            # Try to extract tab content
            tab_content = ""
            content_source = "none"
            
            try:
                # Method 1: Look for <code> elements
                code_elem = soup.find('code')
                if code_elem:
                    tab_content = code_elem.get_text(strip=False)
                    content_source = "code"
                    print(f"Found content in <code>: {len(tab_content)} chars")
            except Exception as e:
                print(f"Error extracting from code: {e}")
            
            # Method 2: Look for <pre> elements
            if not tab_content:
                try:
                    pre_elem = soup.find('pre')
                    if pre_elem:
                        tab_content = pre_elem.get_text(strip=False)
                        content_source = "pre"
                        print(f"Found content in <pre>: {len(tab_content)} chars")
                except Exception as e:
                    print(f"Error extracting from pre: {e}")
            
            # Method 3: Look for common Ultimate Guitar containers
            if not tab_content:
                selectors = ['.js-tab-content', '[data-content]', '.tab-content']
                for selector in selectors:
                    try:
                        elem = soup.select_one(selector)
                        if elem:
                            tab_content = elem.get_text(strip=False)
                            content_source = selector
                            print(f"Found content in {selector}: {len(tab_content)} chars")
                            break
                    except Exception as e:
                        print(f"Error with selector {selector}: {e}")
            
            # If still no content, get page text for manual inspection
            page_text = soup.get_text() if not tab_content else ""
            
            return {
                'url': url,
                'title': title,
                'artist': artist,
                'tab_type': tab_type,
                'content': tab_content,
                'content_source': content_source,
                'content_length': len(tab_content),
                'page_text_length': len(page_text),
                'has_content': len(tab_content) > 0,
                'success': True
            }
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            artist_fallback, title_fallback, type_fallback = self.extract_from_url(url)
            return {
                'url': url,
                'title': title_fallback,
                'artist': artist_fallback,
                'tab_type': type_fallback,
                'error': str(e),
                'success': False
            }
    
    def save_tab_data(self, tab_data, output_dir):
        """Save individual tab data to files."""
        if not tab_data['success']:
            return
            
        # Create filename-safe version
        artist = re.sub(r'[^\w\s-]', '', tab_data['artist']).strip()[:30]
        title = re.sub(r'[^\w\s-]', '', tab_data['title']).strip()[:30]
        filename = f"{artist} - {title} - {tab_data['tab_type']}.txt"
        filename = re.sub(r'\s+', ' ', filename)  # Clean up spaces
        
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"Title: {tab_data['title']}\n")
            f.write(f"Artist: {tab_data['artist']}\n")
            f.write(f"Type: {tab_data['tab_type']}\n")
            f.write(f"Source: {tab_data['url']}\n")
            f.write(f"Content Length: {tab_data.get('content_length', 0)} characters\n")
            f.write(f"Content Source: {tab_data.get('content_source', 'none')}\n")
            f.write("=" * 50 + "\n\n")
            
            if tab_data.get('content'):
                f.write(tab_data['content'])
            else:
                f.write("No chord/tab content extracted from this page.\n")
                f.write("This may be due to JavaScript loading or page structure changes.\n")
    
    def scrape_batch(self, urls, output_dir=None):
        """Scrape a batch of URLs."""
        
        # Set up output directory
        if output_dir is None:
            output_dir = Path.cwd() / "scraped_tabs_simple"
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(exist_ok=True)
        
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
                status = "✓"
                if tab_data.get('has_content'):
                    status += f" ({tab_data.get('content_length', 0)} chars)"
                else:
                    status += " (no content)"
                print(f"{status} {tab_data['artist']} - {tab_data['title']}")
            else:
                print(f"✗ Failed: {url}")
            
            # Be respectful with delays
            if i < len(urls):
                time.sleep(self.delay)
        
        # Save summary
        summary_file = output_dir / "scraping_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        successful = sum(1 for r in results if r['success'])
        with_content = sum(1 for r in results if r['success'] and r.get('has_content'))
        
        print(f"\n" + "="*50)
        print(f"Scraping complete!")
        print(f"Successful: {successful}/{len(urls)}")
        print(f"With content: {with_content}/{len(urls)}")
        print(f"No content: {successful - with_content}/{len(urls)}")
        print(f"Failed: {len(urls) - successful}/{len(urls)}")
        print(f"Files saved to: {output_dir}")
        
        return results

def main():
    """Main function."""
    urls_file = Path.cwd() / "test_urls.txt"  # Default to test file
    
    # Allow custom URLs file
    if len(sys.argv) > 1:
        urls_file = Path(sys.argv[1])
    
    if not urls_file.exists():
        print(f"URLs file not found: {urls_file}")
        return
    
    # Read URLs
    urls = []
    with open(urls_file, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    scraper = SimpleTabScraper()
    scraper.scrape_batch(urls)

if __name__ == "__main__":
    main()
