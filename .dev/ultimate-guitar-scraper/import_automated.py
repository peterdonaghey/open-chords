#!/usr/bin/env python3
"""
Ultimate Guitar to Open-Chords Importer - Full Automation

Uses Playwright to automate browser, extract content, and upload to your app.
No manual steps required!

Requirements:
    pip install playwright requests
    playwright install chromium
"""

import asyncio
import json
import time
import re
from pathlib import Path
import requests
from playwright.async_api import async_playwright
import sys


class UGToOpenChordsImporter:
    def __init__(self, app_url="http://localhost:5173"):
        self.app_url = app_url
        self.api_url = f"{app_url}/api"
        self.session = requests.Session()
        
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'no_content': 0
        }
        
        self.failed_urls = []
    
    def test_api(self):
        """Test if the app API is accessible."""
        try:
            response = self.session.get(f"{self.api_url}/songs", timeout=5)
            if response.status_code == 200:
                print(f"✅ API accessible at {self.api_url}")
                return True
            else:
                print(f"⚠️  API returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to API: {e}")
            print(f"   Make sure your app is running at {self.app_url}")
            return False
    
    def upload_song(self, song_data):
        """Upload song to the API."""
        try:
            response = self.session.post(
                f"{self.api_url}/songs",
                json=song_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return True, response.json()
            else:
                return False, f"HTTP {response.status_code}: {response.text}"
        except Exception as e:
            return False, str(e)
    
    async def extract_tab_content(self, page, url):
        """Extract tab content from a single Ultimate Guitar page."""
        try:
            print(f"📄 Loading: {url}")
            
            # Navigate to the page
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            # Wait a bit for dynamic content
            await page.wait_for_timeout(2000)
            
            # Extract title and artist
            title = "Unknown Song"
            artist = "Unknown Artist"
            
            h1_elem = await page.query_selector('h1')
            if h1_elem:
                h1_text = await h1_elem.inner_text()
                h1_text = h1_text.strip()
                
                # Parse "Song Title Type by Artist"
                if " by " in h1_text.lower():
                    parts = h1_text.split(" by ", 1)
                    if len(parts) == 2:
                        title = re.sub(r'\s+(Chords|Tab|Ukulele|Bass)$', '', parts[0], flags=re.IGNORECASE).strip()
                        artist = parts[1].strip()
            
            # Fallback: extract from URL
            if title == "Unknown Song" or artist == "Unknown Artist":
                url_parts = url.split('/')
                if len(url_parts) >= 6:
                    if artist == "Unknown Artist":
                        artist = url_parts[5].replace('-', ' ').title()
                    if title == "Unknown Song":
                        song_part = url_parts[6]
                        # Remove type and ID
                        song_clean = re.sub(r'-(chords|tabs|ukulele|bass)-\d+$', '', song_part)
                        title = song_clean.replace('-', ' ').title()
            
            # Extract chord/tab content
            content = ""
            
            # Try <code> element first (most common)
            code_elem = await page.query_selector('code')
            if code_elem:
                content = await code_elem.inner_text()
            
            # Try <pre> if no code
            if not content:
                pre_elem = await page.query_selector('pre')
                if pre_elem:
                    content = await pre_elem.inner_text()
            
            # Determine type from URL
            tab_type = 'tabs' if '-tabs-' in url else 'chords'
            
            return {
                'url': url,
                'title': title,
                'artist': artist,
                'type': tab_type,
                'content': content.strip() if content else '',
                'has_content': bool(content and len(content.strip()) > 50)
            }
            
        except Exception as e:
            print(f"❌ Error extracting {url}: {e}")
            return {
                'url': url,
                'title': 'Unknown',
                'artist': 'Unknown',
                'type': 'chords',
                'content': '',
                'has_content': False,
                'error': str(e)
            }
    
    async def process_urls(self, urls):
        """Process all URLs with browser automation."""
        
        async with async_playwright() as p:
            # Launch browser
            print("🌐 Launching browser...")
            browser = await p.chromium.launch(headless=False)  # Set to True to hide browser
            context = await browser.new_context()
            page = await context.new_page()
            
            # Process each URL
            for i, url in enumerate(urls, 1):
                print(f"\n[{i}/{len(urls)}] Processing...")
                self.stats['total'] += 1
                
                # Extract content
                tab_data = await self.extract_tab_content(page, url)
                
                if not tab_data['has_content']:
                    print(f"⚠️  No content: {tab_data['title']} by {tab_data['artist']}")
                    self.stats['no_content'] += 1
                    self.failed_urls.append({'url': url, 'reason': 'no_content'})
                    continue
                
                # Create song object for API
                song = {
                    'id': f"{int(time.time() * 1000)}_{i}",
                    'title': tab_data['title'],
                    'artist': tab_data['artist'],
                    'key': 'C',  # default
                    'type': tab_data['type'],
                    'content': tab_data['content'],
                    'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                }
                
                # Upload to API
                success, result = self.upload_song(song)
                
                if success:
                    print(f"✅ Uploaded: {tab_data['title']} by {tab_data['artist']}")
                    self.stats['successful'] += 1
                else:
                    print(f"❌ Upload failed: {result}")
                    self.stats['failed'] += 1
                    self.failed_urls.append({'url': url, 'reason': result})
                
                # Small delay to be respectful
                await page.wait_for_timeout(1500)
            
            await browser.close()
    
    def save_results(self):
        """Save import results."""
        results = {
            'stats': self.stats,
            'failed_urls': self.failed_urls,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        results_file = Path(__file__).parent / 'import_results.json'
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        return results_file
    
    def print_summary(self):
        """Print import summary."""
        print("\n" + "="*60)
        print("📊 IMPORT SUMMARY")
        print("="*60)
        print(f"Total URLs:     {self.stats['total']}")
        print(f"✅ Successful:  {self.stats['successful']}")
        print(f"⚠️  No Content:  {self.stats['no_content']}")
        print(f"❌ Failed:      {self.stats['failed']}")
        print("="*60)
        
        if self.failed_urls:
            print("\n❌ Failed URLs:")
            for item in self.failed_urls[:10]:  # Show first 10
                print(f"  - {item['url']}")
                print(f"    Reason: {item['reason']}")
            
            if len(self.failed_urls) > 10:
                print(f"  ... and {len(self.failed_urls) - 10} more")


async def main():
    """Main function."""
    script_dir = Path(__file__).parent
    urls_file = script_dir / "ultimate_guitar_urls.txt"
    
    if not urls_file.exists():
        print(f"❌ URLs file not found: {urls_file}")
        return
    
    # Read URLs
    with open(urls_file, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    if not urls:
        print("❌ No URLs found in file")
        return
    
    # Get app URL
    app_url = "http://localhost:5173"
    if len(sys.argv) > 1:
        app_url = sys.argv[1]
    
    print("🎵 Ultimate Guitar to Open-Chords Importer")
    print(f"📍 App URL: {app_url}")
    print(f"📚 Total tabs to import: {len(urls)}\n")
    
    # Initialize importer
    importer = UGToOpenChordsImporter(app_url)
    
    # Test API connection
    if not importer.test_api():
        print("\n❌ Cannot proceed without API access")
        print("   Start your app with: npm run dev")
        return
    
    print("\n🚀 Starting automated import...\n")
    
    # Process all URLs
    await importer.process_urls(urls)
    
    # Print summary
    importer.print_summary()
    
    # Save results
    results_file = importer.save_results()
    print(f"\n💾 Results saved to: {results_file}")
    print("\n✅ Import complete!")


if __name__ == "__main__":
    asyncio.run(main())

