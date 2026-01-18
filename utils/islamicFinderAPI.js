// utils/islamicFinderAPI.js
import axios from 'axios';

// Islamic Finder location IDs for US cities
const locationMap = {
  'glen ellyn': 4893811,
  'chicago': 4887398,
  'new york': 5128581,
  'los angeles': 5368361,
  'houston': 4699066,
  'phoenix': 5308655,
  'philadelphia': 4560349,
  'san antonio': 4726206,
  'san diego': 5391811,
};

export const getLocationId = async (city, state) => {
  const cityKey = city.toLowerCase().trim();
  if (locationMap[cityKey]) {
    return locationMap[cityKey];
  }
  
  // Fallback to Nominatim + construct a location ID
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&country=USA&format=json`
    );
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        name: city,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
      };
    }
  } catch (error) {
    console.error('Error getting location:', error);
  }
  
  return null;
};

export const getIslamicFinderPrayerTimes = async (locationId, month, year, fajrAngle, ishaAngle) => {
  try {
    // Islamic Finder API endpoint
    // Format: /prayer-widget/{locationId}/hanfi/6/0/{fajrAngle}/{ishaAngle}
    
    const url = `https://api.islamicfinder.org/v3/calendar?month=${month}&year=${year}&location_id=${locationId}&method=99&fajr_angle=${fajrAngle}&isha_angle=${ishaAngle}`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.data) {
      return parseIslamicFinderData(response.data.data);
    }
    
    throw new Error('No prayer times data from Islamic Finder');
  } catch (error) {
    console.error('Error fetching from Islamic Finder:', error);
    // Fallback to Aladhan if Islamic Finder fails
    return fallbackToAladhan(month, year, fajrAngle, ishaAngle);
  }
};

const parseIslamicFinderData = (data) => {
  return data.map((day) => {
    const hijri = day.hijri || {};
    return {
      date: day.date.split('-')[2],
      gregorianDate: day.date,
      dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      hijriDay: hijri.day || '',
      hijriMonth: hijri.month || '',
      hijriMonthName: hijri.month_name || '',
      hijriYear: hijri.year || '',
      timings: {
        fajr: day.fajr,
        sunrise: day.sunrise,
        dhuhr: day.dhuhr,
        asr: day.asr,
        sunset: day.sunset,
        maghrib: day.maghrib,
        isha: day.isha,
      },
    };
  });
};

const fallbackToAladhan = async (month, year, fajrAngle, ishaAngle) => {
  // Fallback to Aladhan with coordinates
  const response = await axios.get(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=41.8796&longitude=-88.0658&method=99&fajrAngle=${fajrAngle}&ishaAngle=${ishaAngle}`
  );
  
  if (response.data && response.data.data) {
    return response.data.data.map((dayData) => {
      const hijri = dayData.date.hijri;
      return {
        date: dayData.date.gregorian.day,
        gregorianDate: `${month}/${dayData.date.gregorian.day}/${year}`,
        dayName: new Date(year, month - 1, dayData.date.gregorian.day).toLocaleDateString('en-US', { weekday: 'short' }),
        hijriDay: hijri.day,
        hijriMonth: hijri.month,
        hijriMonthName: getHijriMonthName(hijri.month),
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
  }
  
  throw new Error('Both APIs failed');
};

const getHijriMonthName = (month) => {
  const months = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  return months[month - 1] || '';
};
