# Ultimate Guitar to Open-Chords Importer

Automated tool to import all your saved Ultimate Guitar tabs directly into your open-chords app.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /Users/peterdonaghey/Projects/open-chords/.dev/ultimate-guitar-scraper
pip install -r requirements.txt
playwright install chromium
```

### 2. Start Your Open-Chords App
```bash
cd /Users/peterdonaghey/Projects/open-chords
npm run dev
```

### 3. Run the Importer
```bash
python import_automated.py
```

That's it! The script will:
- ✅ Open a browser (you can watch it work!)
- ✅ Visit each of your 151 saved tabs
- ✅ Extract the chord/tab content
- ✅ Upload directly to your open-chords app
- ✅ Show progress and statistics

## ⏱️ Time Required

Approximately **5-8 minutes** total for all 151 tabs (1.5 second delay between each).

## 📊 What You Get

All 151 of your saved tabs imported with:
- Proper titles and artists
- Chord content ready for transposition
- Organized in your open-chords app
- Ready to share with friends

## 🔧 Options

### Use Deployed App Instead of Local
```bash
python import_automated.py https://your-deployed-app.vercel.app
```

### Run Headless (Hide Browser Window)
Edit `import_automated.py` line 136:
```python
browser = await p.chromium.launch(headless=True)  # Change False to True
```

## 📁 Files

- `import_automated.py` - Main automation script (uses Playwright)
- `ultimate_guitar_urls.txt` - Your 151 tab URLs
- `requirements.txt` - Python dependencies
- `import_results.json` - Results after import (auto-generated)

## 🐛 Troubleshooting

**"Cannot connect to API"**
- Make sure your open-chords app is running (`npm run dev`)
- Check that it's on http://localhost:5173

**"No content" warnings**
- Some tabs might have changed or been removed from Ultimate Guitar
- The script will skip these and continue with the rest

**Browser automation errors**
- Make sure you installed Playwright browsers: `playwright install chromium`