# Prayer Times App - Complete Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to https://nodejs.org/
2. Download LTS version
3. Run installer and follow prompts

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Navigate to Project
```bash
cd prayer-times-app
```

### Step 3: Install Dependencies
```bash
npm install
```

This installs Next.js, React, Tailwind, and all required packages (~2 minutes).

### Step 4: Start Development Server
```bash
npm run dev
```

Output will show:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 5: Open in Browser
Click link or go to: **http://localhost:3000**

You should see the prayer times app loaded! 🎉

---

## Features Overview

### 1. Mosque Information
- Enter your mosque name and details
- Automatically saved to browser
- Edit anytime with the "Edit" button

### 2. Location & Date Search
- **City**: Glen Ellyn
- **State**: Illinois
- **Month/Year**: Any month from 2024-2030
- Fetches real prayer times from Aladhan API

### 3. Custom Angles
Enable to set specific calculation angles:
- **Fajr Angle**: 15° (default ISNA)
- **Isha Angle**: 18° (default ISNA)

Different organizations use different angles:
- ISNA: 15°/15°
- MWL: 18°/17°
- Makkah: 18°/18°

### 4. Prayer Times Table
Shows for entire month:
- Gregorian date (Month/Day/Year)
- Day of week
- Hijri date
- All 5 prayers + Sunrise/Sunset

### 5. PDF Export
- Click "📥 Export PDF" button
- Downloads professional timetable
- Ready to print or share

---

## Example: Glen Ellyn with Custom Angles

**What to enter:**

1. Mosque Form:
   - Name: "Islamic Center of Glen Ellyn"
   - Address: "Glen Ellyn, Illinois"
   - Phone: (optional)
   - Website: (optional)

2. Search Form:
   - City: Glen Ellyn
   - State: Illinois
   - Month: January
   - Year: 2026
   - ✓ Use Custom Angles
   - Fajr: 15
   - Isha: 18

3. Click "Get Prayer Times"

4. View the table with custom angle calculations

5. Click "Export PDF" to download

---

## Project File Structure

```
prayer-times-app/
├── pages/
│   ├── _app.js              # App wrapper
│   └── index.js             # Main page (the app)
├── components/
│   ├── SearchBar.js         # Location input
│   ├── PrayerTable.js       # Results display
│   ├── MosqueForm.js        # Mosque info
│   └── ErrorMessage.js      # Error alerts
├── utils/
│   ├── prayerTimes.js       # API calls
│   └── pdfExport.js         # PDF generation
├── styles/
│   └── globals.css          # Styling
├── package.json             # Dependencies
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
├── jsconfig.json            # Path aliases
└── README.md                # Full docs
```

---

## Common Tasks

### Change Default Month/Year
Edit `components/SearchBar.js`:
```javascript
const [month, setMonth] = useState(1);  // January
const [year, setYear] = useState(2026);
```

### Change App Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  islamic: {
    600: '#0284c7',  // Change this color (hex code)
    700: '#0369a1',
  }
}
```

### Add More Information to PDF
Edit `components/PrayerTable.js` - modify the table header section.

### Disable Custom Angles
In `components/SearchBar.js`, remove the custom angles section.

---

## Troubleshooting

### "npm command not found"
Node.js not installed. Download from https://nodejs.org/

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```
Then visit http://localhost:3001

### "Location not found" error
- Check spelling (Glen Ellyn, Illinois)
- Use full state names, not abbreviations
- Make sure city actually exists

### PDF doesn't download
- Disable popup blockers
- Check browser console (F12) for errors
- Try Chrome or Firefox

### Prayer times look wrong
- Verify coordinates are correct
- Check if using correct method/angles
- Compare with Aladhan.com directly

---

## Development

### Install More Packages
```bash
npm install package-name
```

### Modify Styling
Edit `styles/globals.css` or add Tailwind classes in components.

### Add New Components
Create file in `components/` folder and import in `pages/index.js`.

### Test in Production Mode
```bash
npm run build
npm start
```

---

## Deployment

### Free Option: Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Connect your repo
4. Deploy (automatic on every push)

### Other Options
- Netlify: https://netlify.com
- Railway.app: https://railway.app
- Heroku: https://heroku.com

---

## APIs Used

**Prayer Times:**
- Aladhan API (https://aladhan.com)
- Free, no key needed
- ~1000 requests/day

**Location Lookup:**
- OpenStreetMap Nominatim
- Free, no key needed
- Converts "Glen Ellyn, Illinois" to coordinates

---

## Next Steps

1. ✅ Complete setup above
2. ✅ Try with different cities
3. ✅ Export a PDF
4. ✅ Customize colors/text
5. ✅ Deploy to Vercel

---

## Need Help?

Check these resources:
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Aladhan API**: https://aladhan.com/api
- **React**: https://react.dev

Good luck! 🕌
