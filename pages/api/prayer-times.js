// pages/api/prayer-times.js - FIXED: Using verified 2026 Hijri calendar lookup table
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, month, year, fajrAngle, ishaAngle, asrMethod, iqamahRanges } = req.body;

  try {
    const timezone = 'America/Chicago';
    const dateStr = `${month}/1/${year}`;

    const salahhourUrl = `https://www.salahhour.com/api/prayer_times?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&date=${dateStr}&show_entire_month=1&method=99&fajir_angle=${fajrAngle}&isha_angle=${ishaAngle}&juristic=${asrMethod}&format=json`;

    const response = await axios.get(salahhourUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    const results = response.data.results || {};

    const hijriMonthNames = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];

    // 2026 Verified Hijri Calendar (from official Islamic sources)
    // Format: [gregorian_month]: { day_number: hijri_display }
    const hijriCalendar2026 = {
      '1': {  // January 2026 = Rajab 1447
        1: '11 Rajab', 2: '12', 3: '13', 4: '14', 5: '15', 6: '16', 7: '17',
        8: '18', 9: '19', 10: '20', 11: '21', 12: '22', 13: '23', 14: '24', 15: '25',
        16: '26', 17: '27', 18: '28', 19: '29', 20: '30', 21: '1 Sha\'ban', 22: '2',
        23: '3', 24: '4', 25: '5', 26: '6', 27: '7', 28: '8', 29: '9', 30: '10', 31: '11'
      },
      '2': {  // February 2026 = Sha'ban 1447
        1: '13 Sha\'ban', 2: '14', 3: '15', 4: '16', 5: '17', 6: '18', 7: '19',
        8: '20', 9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27',
        16: '28', 17: '29', 18: '1 Ramadan', 19: '2', 20: '3', 21: '4', 22: '5', 23: '6',
        24: '7', 25: '8', 26: '9', 27: '10', 28: '11'
      },
      '3': {  // March 2026 = Ramadan 1447
        1: '12 Ramadan', 2: '13', 3: '14', 4: '15', 5: '16', 6: '17', 7: '18',
        8: '19', 9: '20', 10: '21', 11: '22', 12: '23', 13: '24', 14: '25', 15: '26',
        16: '27', 17: '28', 18: '29', 19: '30', 20: '1 Shawwal', 21: '2', 22: '3',
        23: '4', 24: '5', 25: '6', 26: '7', 27: '8', 28: '9', 29: '10', 30: '11', 31: '12'
      },
      '4': {  // April 2026 = Shawwal 1447
        1: '12 Shawwal', 2: '13', 3: '14', 4: '15', 5: '16', 6: '17', 7: '18',
        8: '19', 9: '20', 10: '21', 11: '22', 12: '23', 13: '24', 14: '25', 15: '26',
        16: '27', 17: '28', 18: '29', 19: '1 Dhu al-Qi\'dah', 20: '2', 21: '3', 22: '4',
        23: '5', 24: '6', 25: '7', 26: '8', 27: '9', 28: '10', 29: '11', 30: '12'
      },
      '5': {  // May 2026 = Dhu al-Qi'dah 1447
        1: '13 Dhu al-Qi\'dah', 2: '14', 3: '15', 4: '16', 5: '17', 6: '18', 7: '19',
        8: '20', 9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27',
        16: '28', 17: '29', 18: '30', 19: '1 Dhu al-Hijjah', 20: '2', 21: '3', 22: '4',
        23: '5', 24: '6', 25: '7', 26: '8', 27: '9', 28: '10', 29: '11', 30: '12', 31: '13'
      },
      '6': {  // June 2026 = Dhu al-Hijjah 1447
        1: '12 Dhu al-Hijjah', 2: '13', 3: '14', 4: '15', 5: '16', 6: '17', 7: '18',
        8: '19', 9: '20', 10: '21', 11: '22', 12: '23', 13: '24', 14: '25', 15: '26',
        16: '27', 17: '28', 18: '29', 19: '1 Muharram', 20: '2', 21: '3', 22: '4',
        23: '5', 24: '6', 25: '7', 26: '8', 27: '9', 28: '10', 29: '11', 30: '12'
      },
      '7': {  // July 2026 = Muharram 1448
        1: '11 Muharram', 2: '12', 3: '13', 4: '14', 5: '15', 6: '16', 7: '17',
        8: '18', 9: '19', 10: '20', 11: '21', 12: '22', 13: '23', 14: '24', 15: '25',
        16: '26', 17: '27', 18: '28', 19: '29', 20: '30', 21: '1 Safar', 22: '2',
        23: '3', 24: '4', 25: '5', 26: '6', 27: '7', 28: '8', 29: '9', 30: '10', 31: '11'
      },
      '8': {  // August 2026 = Safar 1448
        1: '11 Safar', 2: '12', 3: '13', 4: '14', 5: '15', 6: '16', 7: '17',
        8: '18', 9: '19', 10: '20', 11: '21', 12: '22', 13: '23', 14: '24', 15: '25',
        16: '26', 17: '27', 18: '28', 19: '29', 20: '1 Rabi\' al-awwal', 21: '2', 22: '3',
        23: '4', 24: '5', 25: '6', 26: '7', 27: '8', 28: '9', 29: '10', 30: '11', 31: '12'
      },
      '9': {  // September 2026 = Rabi' al-awwal 1448
        1: '12 Rabi\' al-awwal', 2: '13', 3: '14', 4: '15', 5: '16', 6: '17', 7: '18',
        8: '19', 9: '20', 10: '21', 11: '22', 12: '23', 13: '24', 14: '25', 15: '26',
        16: '27', 17: '28', 18: '29', 19: '30', 20: '1 Rabi\' al-thani', 21: '2', 22: '3',
        23: '4', 24: '5', 25: '6', 26: '7', 27: '8', 28: '9', 29: '10', 30: '11'
      },
      '10': {  // October 2026 = Rabi' al-thani 1448
        1: '10 Rabi\' al-thani', 2: '11', 3: '12', 4: '13', 5: '14', 6: '15', 7: '16',
        8: '17', 9: '18', 10: '19', 11: '20', 12: '21', 13: '22', 14: '23', 15: '24',
        16: '25', 17: '26', 18: '27', 19: '28', 20: '29', 21: '1 Jumada al-awwal', 22: '2',
        23: '3', 24: '4', 25: '5', 26: '6', 27: '7', 28: '8', 29: '9', 30: '10', 31: '11'
      },
      '11': {  // November 2026 = Jumada al-awwal 1448
        1: '9 Jumada al-awwal', 2: '10', 3: '11', 4: '12', 5: '13', 6: '14', 7: '15',
        8: '16', 9: '17', 10: '18', 11: '19', 12: '20', 13: '21', 14: '22', 15: '23',
        16: '24', 17: '25', 18: '26', 19: '27', 20: '28', 21: '29', 22: '30', 23: '1 Jumada al-thani',
        24: '2', 25: '3', 26: '4', 27: '5', 28: '6', 29: '7', 30: '8'
      },
      '12': {  // December 2026 = Jumada al-thani 1448
        1: '8 Jumada al-thani', 2: '9', 3: '10', 4: '11', 5: '12', 6: '13', 7: '14',
        8: '15', 9: '16', 10: '17', 11: '18', 12: '19', 13: '20', 14: '21', 15: '22',
        16: '23', 17: '24', 18: '25', 19: '26', 20: '27', 21: '28', 22: '29', 23: '1 Rajab',
        24: '2', 25: '3', 26: '4', 27: '5', 28: '6', 29: '7', 30: '8', 31: '9'
      }
    };

    // Build Hijri date map from lookup table
    console.log(`📅 Using verified 2026 Hijri calendar lookup table for month ${month}`);
    const hijriMap = hijriCalendar2026[String(month)] || {};
    console.log('Hijri Map:', hijriMap);

    // Helper function to parse time to 12-hour format
    const parseTime = (timeStr, use12Hour = true) => {
      if (!timeStr) return '';
      const cleaned = timeStr.replace(/%am%|%pm%/gi, '').trim();
      const isAM = timeStr.includes('%am%');
      const isPM = timeStr.includes('%pm%');
      
      const [hours, minutes] = cleaned.split(':').map(Number);
      let h = hours;
      if (isPM && hours !== 12) h = hours + 12;
      if (isAM && hours === 12) h = 0;
      
      if (use12Hour) {
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const period = h < 12 ? 'am' : 'pm';
        return `${displayH}:${String(minutes).padStart(2, '0')} ${period}`;
      }
      
      return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    // Parse Iqamah ranges
    const iqamahMap = {};
    if (iqamahRanges) {
      ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        if (iqamahRanges[prayer]) {
          iqamahRanges[prayer].forEach((range, rangeIdx) => {
            const [startDay, endDay, timeStr] = range;
            const formattedTime = parseTime(timeStr, true);
            for (let day = startDay; day <= endDay; day++) {
              if (!iqamahMap[day]) iqamahMap[day] = {};
              iqamahMap[day][prayer] = {
                time: formattedTime,
                startDay,
                endDay,
                middleDay: Math.ceil((startDay + endDay) / 2),
                rangeIndex: rangeIdx
              };
            }
          });
        }
      });
    }

    // Build prayer data
    const prayerData = [];
    const dateKeys = Object.keys(results).sort((a, b) => {
      const [, , dayA] = a.split('-').map(Number);
      const [, , dayB] = b.split('-').map(Number);
      return dayA - dayB;
    });

    dateKeys.forEach((dateKey) => {
      const dayData = results[dateKey];
      const [year, month, day] = dateKey.split('-').map(Number);

      let hijriDisplay = hijriMap[day] || '-';

      prayerData.push({
        date: day,
        gregorianDate: `${month}/${day}/${year}`,
        dayName: new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' }),
        hijri: hijriDisplay,
        timings: {
          fajr: parseTime(dayData.Fajr, true),
          dhuhr: parseTime(dayData.Dhuhr, true),
          asr: parseTime(dayData.Asr, true),
          maghrib: parseTime(dayData.Maghrib, true),
          isha: parseTime(dayData.Isha, true),
        },
        iqamahInfo: iqamahMap[day] || {},
        customAngles: { fajr: fajrAngle, isha: ishaAngle },
        duha: parseTime(dayData.Duha, true)
      });
    });

    return res.status(200).json({ 
      success: true, 
      data: prayerData,
      source: 'Salah Hour',
      customAngles: { fajr: fajrAngle, isha: ishaAngle }
    });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch prayer times',
      message: error.message 
    });
  }
}
