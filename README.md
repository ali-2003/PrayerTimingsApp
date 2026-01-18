# Prayer Times Web App

A modern Next.js web application for generating monthly prayer times with custom angle support.

## Features

✅ **Location Search** - Search by city and state
✅ **Custom Angles** - Set custom Fajr and Isha angles (degrees below horizon)
✅ **Monthly Timetable** - Display full month of prayer times
✅ **PDF Export** - Download timetable as a professional PDF
✅ **Mosque Information** - Save and manage mosque details
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Real-time Data** - Fetches from Aladhan API

## Technology Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Aladhan API** - Prayer times data
- **jsPDF** - PDF generation
- **html2canvas** - PDF content capture

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn

### Setup Steps

1. **Clone or extract the project**
   ```bash
   cd prayer-times-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

### Quick Start

1. **Enter Mosque Information**
   - Fill in your mosque name and address
   - Phone and website are optional
   - Click "Save Mosque Info"

2. **Search for Prayer Times**
   - Enter city (e.g., Glen Ellyn)
   - Enter state (e.g., Illinois)
   - Select month and year
   - Optionally enable custom angles

3. **Custom Angles** (Optional)
   - Check "Use Custom Angles"
   - Set Fajr angle (default: 15°)
   - Set Isha angle (default: 18°)
   - Click "Get Prayer Times"

4. **View Results**
   - Prayer times display in a table
   - Shows all 5 daily prayers plus sunrise/sunset
   - Hijri date included

5. **Export to PDF**
   - Click "📥 Export PDF" button
   - Download as professional-looking PDF

### Custom Angles Explained

Prayer times are calculated based on the sun's position below the horizon:

- **Fajr**: When sun is 15-20° below horizon (morning twilight)
- **Isha**: When sun is 15-18° below horizon (evening twilight)

Common values:
- **ISNA (North America)**: Fajr 15°, Isha 15°
- **MWL (Muslim World League)**: Fajr 18°, Isha 17°
- **Makkah**: Fajr 18°, Isha 18°

## API Reference

### Prayer Times Endpoint

Uses Aladhan API with method 99 for custom angles:

```
GET https://api.aladhan.com/v1/calendar/{year}/{month}
  ?latitude={lat}
  &longitude={lon}
  &method=99
  &fajrAngle={angle}
  &ishaAngle={angle}
```

### Location Search

Uses OpenStreetMap Nominatim:

```
GET https://nominatim.openstreetmap.org/search
  ?city={city}
  &state={state}
  &country=USA
  &format=json
```

## Component Structure

```
components/
├── SearchBar.js        - Location and custom angle input
├── PrayerTable.js      - Display prayer times table
├── MosqueForm.js       - Mosque information editor
└── ErrorMessage.js     - Error notifications

utils/
├── prayerTimes.js      - API calls and calculations
└── pdfExport.js        - PDF generation logic

pages/
├── _app.js             - Next.js app wrapper
└── index.js            - Main page
```

## Customization

### Change Default Values

Edit `components/SearchBar.js`:
```javascript
const [fajrAngle, setFajrAngle] = useState(15);  // Change default
const [ishaAngle, setIshaAngle] = useState(18);  // Change default
```

### Change Styling Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  islamic: {
    600: '#0284c7',  // Primary blue
    700: '#0369a1',  // Darker blue
  }
}
```

### Add More Prayer Methods

Edit `components/SearchBar.js` to add preset methods:
```javascript
<select>
  <option value="2">ISNA (15°/15°)</option>
  <option value="3">MWL (18°/17°)</option>
  <option value="4">Makkah (18°/18°)</option>
</select>
```

## Building for Production

```bash
npm run build
npm start
```

This creates an optimized production build in `.next/`

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

The app works on any Node.js hosting:
- Netlify
- Heroku
- AWS
- DigitalOcean
- Railway.app

## Troubleshooting

### "Location not found"
- Check spelling of city and state
- Use proper state names (e.g., "Illinois" not "IL")

### PDF export not working
- Make sure no browser extensions are blocking
- Try a different browser
- Check console for errors

### Prayer times not matching expected values
- Verify custom angles are correct
- Check location coordinates are accurate
- Some variations expected between calculation methods

### CORS errors
- The app uses public APIs with CORS enabled
- If issues persist, add API proxy in Next.js

## API Limits

- **Aladhan**: Free tier, ~1000 requests/day
- **Nominatim**: Free tier, max 1 request/second
- Both are sufficient for personal/small business use

## License

MIT - Feel free to use and modify

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the component code comments
3. Consult Aladhan API documentation

## Future Features

- [ ] Save favorites locations
- [ ] Iqamah time management
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Multiple calculation methods dropdown
- [ ] Hijri calendar view
- [ ] Prayer time widgets

---

**Built with ❤️ for the Muslim community**
