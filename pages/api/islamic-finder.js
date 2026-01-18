// pages/api/islamic-finder.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, month, year, fajrAngle, ishaAngle, madhab = 'hanafi' } = req.body;

  try {
    console.log(`📡 Fetching from Islamic Finder API`);
    console.log(`📍 Lat: ${latitude}, Lon: ${longitude}`);
    console.log(`🎯 Fajr: ${fajrAngle}°, Isha: ${ishaAngle}°`);

    // Islamic Finder API endpoint
    // Parameters: latitude, longitude, month, year, method (calculation method), fajr_angle, isha_angle
    const url = `https://api.islamicfinder.org/v3/calendar?latitude=${latitude}&longitude=${longitude}&month=${month}&year=${year}&method=99&fajr_angle=${fajrAngle}&isha_angle=${ishaAngle}&madhab=${madhab}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Prayer Times App)',
        'Accept': 'application/json'
      }
    });

    if (!response.data || !response.data.data) {
      console.log('Islamic Finder API failed, falling back to Aladhan');
      return fallbackToAladhan(latitude, longitude, month, year, fajrAngle, ishaAngle, res);
    }

    // Parse Islamic Finder response
    const prayerData = response.data.data.map((dayData) => {
      const hijriMonths = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ];

      const dateStr = dayData.date_for;
      const [year, month, day] = dateStr.split('-').map(Number);
      
      const hijri = dayData.hijri || {};
      const hijriDay = hijri.day || dayData.hijri_day || '';
      const hijriMonth = hijri.month || dayData.hijri_month || '';
      const hijriYear = hijri.year || dayData.hijri_year || '';

      return {
        date: day,
        gregorianDate: `${month}/${day}/${year}`,
        dayName: new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' }),
        hijriDay: hijriDay,
        hijriMonth: hijriMonth,
        hijriMonthName: hijriMonths[hijriMonth - 1] || '',
        hijriYear: hijriYear,
        timings: {
          fajr: dayData.fajr || dayData.prayer_times?.fajr || '',
          sunrise: dayData.sunrise || dayData.prayer_times?.sunrise || '',
          dhuhr: dayData.dhuhr || dayData.prayer_times?.dhuhr || '',
          asr: dayData.asr || dayData.prayer_times?.asr || '',
          sunset: dayData.sunset || dayData.prayer_times?.sunset || '',
          maghrib: dayData.maghrib || dayData.prayer_times?.maghrib || '',
          isha: dayData.isha || dayData.prayer_times?.isha || '',
        },
      };
    });

    return res.status(200).json({ 
      success: true, 
      data: prayerData,
      source: 'Islamic Finder',
      customAngles: { fajr: fajrAngle, isha: ishaAngle }
    });
  } catch (error) {
    console.error('❌ Islamic Finder API Error:', error.message);
    return fallbackToAladhan(latitude, longitude, month, year, fajrAngle, ishaAngle, res);
  }
}

async function fallbackToAladhan(latitude, longitude, month, year, fajrAngle, ishaAngle, res) {
  try {
    console.log('⚡ Falling back to Aladhan API');
    
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=99&fajrAngle=${fajrAngle}&ishaAngle=${ishaAngle}&adjustment=0`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Prayer Times App)'
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error('Aladhan API also failed');
    }

    const hijriMonths = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];

    const prayerData = response.data.data.map((dayData) => {
      const hijri = dayData.date.hijri;
      const day = dayData.date.gregorian.day;

      return {
        date: day,
        gregorianDate: `${month}/${day}/${year}`,
        dayName: new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' }),
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

    return res.status(200).json({ 
      success: true, 
      data: prayerData,
      source: 'Aladhan (fallback)',
      customAngles: { fajr: fajrAngle, isha: ishaAngle }
    });
  } catch (error) {
    console.error('❌ Both APIs failed:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch prayer times from both Islamic Finder and Aladhan',
      message: error.message 
    });
  }
}
