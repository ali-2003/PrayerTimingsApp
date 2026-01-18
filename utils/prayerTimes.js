// utils/prayerTimes.js
import axios from 'axios';

// Proper Hijri calculation using Islamic Finder's algorithm
const getHijriDate = (gregorianDate) => {
  const gd = gregorianDate.getDate();
  const gm = gregorianDate.getMonth() + 1;
  const gy = gregorianDate.getFullYear();

  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  const jdn = gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const n = jdn - 1948440 + 10632;
  const q = Math.floor(n / 10631);
  const r = n % 10631;
  const a2 = Math.floor((r + 1) / 325.2422);
  const w = Math.floor((a2 + 1) * 30.44);
  const z = r + 1 - Math.floor(325.2422 * a2);
  const hijriDay = Math.floor(z);
  const hijriMonth = w > 11 ? 12 : w + 1;
  const hijriYear = q * 30 + a2 + 1;

  return { day: hijriDay, month: hijriMonth, year: hijriYear };
};

const hijriMonths = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

export const getPrayerTimes = async (latitude, longitude, month, year, customAngles = null) => {
  try {
    let url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&adjustment=0`;
    
    if (customAngles) {
      // Method 99 = Custom angles
      url += `&method=99&fajrAngle=${customAngles.fajr}&ishaAngle=${customAngles.isha}`;
      console.log(`✅ CUSTOM ANGLES: Fajr ${customAngles.fajr}°, Isha ${customAngles.isha}°`);
    } else {
      url += '&method=2';
      console.log('Using ISNA (15°/15°)');
    }

    const response = await axios.get(url);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Aladhan API');
    }

    const prayerData = response.data.data.map((dayData) => {
      const gregorianDay = dayData.date.gregorian.day;
      const gregorianDate = new Date(year, month - 1, gregorianDay);
      const hijri = getHijriDate(gregorianDate);
      
      return {
        date: gregorianDay,
        gregorianDate: `${month}/${gregorianDay}/${year}`,
        dayName: gregorianDate.toLocaleDateString('en-US', { weekday: 'short' }),
        hijriDay: hijri.day,
        hijriMonth: hijri.month,
        hijriMonthName: hijriMonths[hijri.month - 1],
        hijriYear: hijri.year,
        timings: {
          fajr: dayData.timings.Fajr,
          sunrise: dayData.timings.Sunrise,
          dhuhr: dayData.timings.Dhuhr,
          asr: dayData.timings.Asr,
          sunset: dayData.timings.Sunset,
          maghrib: dayData.timings.Maghrib,
          isha: dayData.timings.Isha,
        },
      };
    });
    
    return prayerData;
  } catch (error) {
    console.error('❌ Error fetching prayer times:', error.message);
    throw error;
  }
};

export const getLocationCoordinates = async (city, state) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&country=USA&format=json`
    );
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
      };
    }
    
    throw new Error('Location not found');
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

export const getMonthName = (month) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || '';
};

// Get Iqamah time for a specific day within ranges
export const getIqamahForDay = (day, prayerRanges) => {
  if (!prayerRanges || prayerRanges.length === 0) return null;
  
  for (const range of prayerRanges) {
    const [startDay, endDay, iqamahTime] = range;
    if (day >= startDay && day <= endDay) {
      return iqamahTime;
    }
  }
  
  return null;
};