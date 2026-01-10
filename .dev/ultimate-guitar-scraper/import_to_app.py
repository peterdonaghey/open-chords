#!/usr/bin/env python3
"""
Ultimate Guitar to Open-Chords Importer

This script uses browser automation to extract chord content from Ultimate Guitar
and uploads it directly to your open-chords app via the API.

Usage:
    python import_to_app.py

Requirements:
    - Must have the browser automation tools available
    - App must be running (or deployed) to receive API calls
    - URLs must be in ultimate_guitar_urls.txt
"""

import json
import time
import re
import requests
from pathlib import Path
from urllib.parse import urlparse, urljoin
import sys


class UltimateGuitarImporter:
    def __init__(self, app_base_url="http://localhost:5173"):
        """
        Initialize the importer.
        
        Args:
            app_base_url: Base URL of your open-chords app (default: local dev server)
        """
        self.app_base_url = app_base_url
        self.api_base_url = urljoin(app_base_url, "/api")
        self.session = requests.Session()
        
        # Stats
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0
        }
    
    def extract_metadata_from_url(self, url):
        """Extract basic metadata from Ultimate Guitar URL."""
        try:
            # URL format: https://tabs.ultimate-guitar.com/tab/artist/song-type-id
            parts = url.split('/')
            if len(parts) >= 6:
                artist = parts[5].replace('-', ' ').title()
                song_part = parts[6]
                
                # Extract song name and type
                if '-' in song_part:
                    song_parts = song_part.split('-')
                    type_indicators = ['chords', 'tabs', 'ukulele', 'bass']
                    
                    # Find where the type starts
                    type_idx = None
                    tab_type = 'chords'  # default
                    
                    for i, part in enumerate(song_parts):
                        if part.lower() in type_indicators:
                            type_idx = i
                            tab_type = 'tabs' if part.lower() == 'tabs' else 'chords'
                            break
                    
                    if type_idx:
                        song_name = ' '.join(song_parts[:type_idx]).title()
                    else:
                        song_name = song_part.replace('-', ' ').title()
                else:
                    song_name = song_part.replace('-', ' ').title()
                    tab_type = 'chords'
                
                return {
                    'artist': artist,
                    'title': song_name,
                    'type': tab_type
                }
        except Exception as e:
            print(f"Error parsing URL {url}: {e}")
        
        return {
            'artist': 'Unknown Artist',
            'title': 'Unknown Song',
            'type': 'chords'
        }
    
    def create_browser_extraction_script(self, urls):
        """
        Create a JavaScript script that can be run in the browser to extract all tabs.
        This is a fallback approach if direct browser automation isn't available.
        """
        
        # Convert URLs list to JavaScript array
        urls_js = json.dumps(urls, indent=2)
        
        script = f"""
// Ultimate Guitar to Open-Chords Importer - Browser Script
// Run this in your browser console while on any Ultimate Guitar page

async function extractAndUploadTabs() {{
    const urls = {urls_js};
    const results = [];
    const appApiBase = '{self.api_base_url}';
    
    console.log(`Starting extraction of ${{urls.length}} tabs...`);
    
    for (let i = 0; i < urls.length; i++) {{
        const url = urls[i];
        console.log(`[${{i+1}}/${{urls.length}}] Processing: ${{url}}`);
        
        try {{
            // Navigate to the tab page
            window.location.href = url;
            
            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            // Extract title and artist from page
            const h1 = document.querySelector('h1');
            let fullTitle = h1 ? h1.textContent.trim() : '';
            
            let title = 'Unknown Song';
            let artist = 'Unknown Artist';
            
            // Parse "Song Title Type by Artist"
            if (fullTitle.includes(' by ')) {{
                const parts = fullTitle.split(' by ');
                if (parts.length === 2) {{
                    title = parts[0].replace(/(Chords|Tab|Ukulele|Bass)$/i, '').trim();
                    artist = parts[1].trim();
                }}
            }}
            
            // Extract the chord/tab content
            let content = '';
            const selectors = ['code', 'pre'];
            
            for (const selector of selectors) {{
                const elem = document.querySelector(selector);
                if (elem && elem.textContent.trim().length > 50) {{
                    content = elem.textContent.trim();
                    break;
                }}
            }}
            
            if (!content) {{
                console.log(`⚠️  No content found for: ${{title}} by ${{artist}}`);
                results.push({{ url, title, artist, status: 'no_content' }});
                continue;
            }}
            
            // Determine type from URL
            const type = url.includes('-tabs-') ? 'tabs' : 'chords';
            
            // Create song object for the API
            const song = {{
                id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
                title: title,
                artist: artist,
                key: 'C',  // default key
                type: type,
                content: content,
                updatedAt: new Date().toISOString()
            }};
            
            // Upload to the API
            try {{
                const response = await fetch(`${{appApiBase}}/songs`, {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                    }},
                    body: JSON.stringify(song)
                }});
                
                if (response.ok) {{
                    console.log(`✅ Uploaded: ${{title}} by ${{artist}}`);
                    results.push({{ url, title, artist, status: 'success', songId: song.id }});
                }} else {{
                    const error = await response.text();
                    console.log(`❌ Upload failed for ${{title}}: ${{error}}`);
                    results.push({{ url, title, artist, status: 'upload_failed', error }});
                }}
            }} catch (uploadError) {{
                console.log(`❌ Upload error for ${{title}}: ${{uploadError.message}}`);
                results.push({{ url, title, artist, status: 'upload_error', error: uploadError.message }});
            }}
            
        }} catch (error) {{
            console.log(`❌ Failed to process ${{url}}: ${{error.message}}`);
            results.push({{ url, status: 'failed', error: error.message }});
        }}
        
        // Delay between requests to be respectful
        if (i < urls.length - 1) {{
            await new Promise(resolve => setTimeout(resolve, 3000));
        }}
    }}
    
    // Show summary
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.length - successful;
    
    console.log(`\\n📊 Import Summary:`);
    console.log(`Total: ${{results.length}}`);
    console.log(`Successful: ${{successful}}`);
    console.log(`Failed: ${{failed}}`);
    
    // Download results as JSON for debugging
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {{type: 'application/json'}});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ultimate_guitar_import_results.json';
    link.click();
    
    console.log('\\n✅ Import complete! Results downloaded.');
    return results;
}}

// Start the import process
extractAndUploadTabs().catch(console.error);
"""
        return script
    
    def save_browser_script(self, urls):
        """Save the browser script to a file."""
        script = self.create_browser_extraction_script(urls)
        script_file = Path(__file__).parent / "browser_import_script.js"
        
        with open(script_file, 'w') as f:
            f.write(script)
        
        return script_file
    
    def test_api_connection(self):
        """Test if the app API is accessible."""
        try:
            response = self.session.get(f"{self.api_base_url}/songs", timeout=10)
            if response.status_code == 200:
                print(f"✅ API connection successful: {self.api_base_url}")
                return True
            else:
                print(f"⚠️  API returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to API at {self.api_base_url}: {e}")
            return False
    
    def upload_song(self, song_data):
        """Upload a song to the open-chords API."""
        try:
            response = self.session.post(
                f"{self.api_base_url}/songs",
                json=song_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return True, response.json()
            else:
                error_msg = response.text
                return False, f"HTTP {response.status_code}: {error_msg}"
                
        except Exception as e:
            return False, str(e)
    
    def run_import(self, urls_file):
        """Run the import process."""
        # Check if API is accessible
        if not self.test_api_connection():
            print("\\n🔧 API is not accessible. Generating browser script instead...")
            return self.generate_browser_script_approach(urls_file)
        
        # If we get here, we would need direct browser automation
        # For now, let's generate the browser script approach
        print("\\n🌐 Generating browser-based import script...")
        return self.generate_browser_script_approach(urls_file)
    
    def generate_browser_script_approach(self, urls_file):
        """Generate the browser script approach."""
        
        # Read URLs
        urls = []
        try:
            with open(urls_file, 'r') as f:
                urls = [line.strip() for line in f if line.strip()]
        except FileNotFoundError:
            print(f"❌ URLs file not found: {urls_file}")
            return False
        
        if not urls:
            print("❌ No URLs found in file")
            return False
        
        print(f"📚 Found {len(urls)} URLs to import")
        
        # Save browser script
        script_file = self.save_browser_script(urls)
        
        print(f"""
🎯 BROWSER IMPORT INSTRUCTIONS:

1. Open your browser and navigate to any Ultimate Guitar page
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Copy and paste the contents of: {script_file}
5. Press Enter to run the script

The script will:
- Visit each of your {len(urls)} saved tabs
- Extract the chord/tab content
- Upload directly to your open-chords app
- Show progress in the console
- Download a results summary when complete

Make sure your open-chords app is running at: {self.app_base_url}

⚠️  IMPORTANT: Stay on the browser tab while the script runs!
The script needs about {len(urls) * 4} seconds to complete (3s delay between each tab).
""")
        
        return True


def main():
    """Main function."""
    script_dir = Path(__file__).parent
    urls_file = script_dir / "ultimate_guitar_urls.txt"
    
    if not urls_file.exists():
        print(f"❌ URLs file not found: {urls_file}")
        print("Please run extract_tab_urls.py first to generate the URLs file.")
        return
    
    # Default to local development server
    app_url = "http://localhost:5173"
    
    # Allow custom app URL
    if len(sys.argv) > 1:
        app_url = sys.argv[1]
    
    print(f"🎵 Ultimate Guitar to Open-Chords Importer")
    print(f"📍 Target app: {app_url}")
    print(f"📁 URLs file: {urls_file}")
    
    importer = UltimateGuitarImporter(app_url)
    success = importer.run_import(urls_file)
    
    if success:
        print("\\n✅ Import preparation complete!")
    else:
        print("\\n❌ Import preparation failed!")


if __name__ == "__main__":
    main()




