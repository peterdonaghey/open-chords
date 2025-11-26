#!/usr/bin/env python3
"""
Quick test of the automation - just extracts from 3 tabs to verify it works
"""

import asyncio
import json
import time
import re
from pathlib import Path
from playwright.async_api import async_playwright


async def test_extraction():
    """Test extracting from just 3 tabs."""
    
    # Test URLs
    urls = [
        "https://tabs.ultimate-guitar.com/tab/billy-joel/vienna-ukulele-1755704",
        "https://tabs.ultimate-guitar.com/tab/eagles/desperado-ukulele-1470078",
        "https://tabs.ultimate-guitar.com/tab/mighty-oaks/brother-chords-1475923"
    ]
    
    print("🎵 Testing Ultimate Guitar Extraction")
    print(f"📚 Testing with {len(urls)} tabs\n")
    
    async with async_playwright() as p:
        print("🌐 Launching browser...")
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        results = []
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Testing: {url}")
            
            try:
                # Navigate
                await page.goto(url, wait_until='networkidle', timeout=30000)
                await page.wait_for_timeout(2000)
                
                # Extract title/artist
                h1_elem = await page.query_selector('h1')
                h1_text = ""
                if h1_elem:
                    h1_text = await h1_elem.inner_text()
                    print(f"   Title found: {h1_text}")
                
                # Extract content
                code_elem = await page.query_selector('code')
                content_length = 0
                if code_elem:
                    content = await code_elem.inner_text()
                    content_length = len(content.strip())
                    print(f"   Content found: {content_length} characters")
                    
                    # Show first 200 chars
                    if content_length > 0:
                        preview = content.strip()[:200]
                        print(f"   Preview: {preview}...")
                else:
                    print(f"   ⚠️  No content found in <code> tag")
                
                results.append({
                    'url': url,
                    'title': h1_text,
                    'content_length': content_length,
                    'success': content_length > 50
                })
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append({
                    'url': url,
                    'success': False,
                    'error': str(e)
                })
            
            await page.wait_for_timeout(1000)
        
        await browser.close()
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        successful = sum(1 for r in results if r.get('success'))
        print(f"Total: {len(results)}")
        print(f"✅ Successful extractions: {successful}")
        print(f"❌ Failed: {len(results) - successful}")
        print("="*60)
        
        if successful == len(results):
            print("\n🎉 ALL TESTS PASSED! The automation works correctly.")
            print("   You can now run: python import_automated.py")
        else:
            print("\n⚠️  Some tests failed. Check the errors above.")
        
        return results


if __name__ == "__main__":
    asyncio.run(test_extraction())

