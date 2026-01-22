// components/PrayerTable.js - FIXED: Proper PDF rendering
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportTableToPDF } from '../utils/pdfExport';
import { getMonthName } from '../utils/prayerTimes';

export default function PrayerTable({ prayerData, mosqueInfo, customAngles, searchParams, iqamahRanges, notes, iqamahMode }) {
  const tableRef = useRef(null);

  if (!prayerData || prayerData.length === 0) {
    return <div className="text-center text-gray-600">No prayer data available</div>;
  }

  const monthName = getMonthName(searchParams.month);
  const firstDayHijri = prayerData[0]?.hijri || '';

  // Extract ALL unique Hijri months in this Gregorian month
  const hijriMonths = new Set();
  prayerData.forEach(day => {
    if (day.hijri && day.hijri.includes(' ')) {
      const monthPart = day.hijri.split(' ').slice(1).join(' ');
      hijriMonths.add(monthPart);
    }
  });
  const hijriMonthsArray = Array.from(hijriMonths);

  // Check if ANY iqamah exists
  let hasIqamah = false;
  if (iqamahRanges && typeof iqamahRanges === 'object') {
    hasIqamah = Object.keys(iqamahRanges).some(prayer => {
      const prayerSettings = iqamahRanges[prayer];
      if (Array.isArray(prayerSettings.ranges) && prayerSettings.ranges.length > 0) {
        return true;
      }
      return false;
    });
  }

  const calculateVariableIqamah = (prayerTime, offsetMins) => {
    if (!prayerTime || offsetMins === 0) return null;
    
    const [time, period] = prayerTime.split(' ');
    let [hours, mins] = time.split(':').map(Number);
    
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    mins += offsetMins;
    if (mins >= 60) {
      hours += Math.floor(mins / 60);
      mins = mins % 60;
    }
    
    const finalHours = hours % 12 || 12;
    const finalPeriod = hours < 12 ? 'am' : 'pm';
    
    return `${finalHours}:${String(mins).padStart(2, '0')} ${finalPeriod}`;
  };

  const shouldShowIqamah = (dayIndex, prayer) => {
    if (!hasIqamah || !iqamahRanges?.[prayer]) return false;
    
    const prayerSettings = iqamahRanges[prayer];
    const day = dayIndex + 1;
    
    // Check if day falls within ANY range
    if (Array.isArray(prayerSettings.ranges)) {
      const matchingRange = prayerSettings.ranges.find(range => {
        return day >= range.startDay && day <= range.endDay;
      });
      return matchingRange ? true : false;
    }
    
    return false;
  };

  const getIqamahTime = (dayIndex, prayer, prayerTime) => {
    if (!hasIqamah || !iqamahRanges?.[prayer]) return null;
    
    const prayerSettings = iqamahRanges[prayer];
    const day = dayIndex + 1;
    
    if (Array.isArray(prayerSettings.ranges)) {
      // Find matching range for this day
      const matchingRange = prayerSettings.ranges.find(range => {
        return day >= range.startDay && day <= range.endDay;
      });
      
      if (!matchingRange) return null;
      
      // FIXED type - return the fixed time
      if (matchingRange.type === 'fixed') {
        return matchingRange.time;
      }
      
      // VARIABLE type - calculate offset
      if (matchingRange.type === 'variable') {
        return calculateVariableIqamah(prayerTime, matchingRange.variable);
      }
    }
    
    return null;
  };

  // Remove am/pm and whitespace from time strings
  const formatTime = (time) => {
    if (!time) return '-';
    // Remove am/pm and any whitespace
    return time.replace(/\s*(am|pm)\s*/gi, '').trim();
  };

  const handleExportPDF = async () => {
    const filename = `${mosqueInfo.name}_${monthName}_${searchParams.year}.pdf`;
    await exportTableToPDF(tableRef.current, filename, monthName);
  };

  return (
    <div className="mt-0">
      <div className="bg-white p-0 border-2 border-islamic-700 flex flex-col" ref={tableRef} style={{ width: '100%', margin: '0', padding: '0' }}>
        {/* Header */}
        <div className="border-b-2 border-islamic-700 pb-0 mb-0 px-0 flex-shrink-0 w-full">
          <div className="flex justify-between items-center px-1">
            <h1 className="text-base font-bold text-islamic-700">🕌 {mosqueInfo.name}</h1>
            <p className="text-xs font-semibold text-gray-800">{monthName} {searchParams.year} • {hijriMonthsArray.join(' - ')} 1447</p>
          </div>
        </div>

        {/* Table */}
        <div className="w-full flex-grow overflow-visible px-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Day</th>
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Date</th>
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Hijri</th>
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Fajr</th>
                  {hasIqamah && <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs bg-orange-400">Fajr Iqamah</th>}
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Duha</th>
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Zuhr</th>
                  {hasIqamah && <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs bg-orange-400">Zuhr Iqamah</th>}
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Asr</th>
                  {hasIqamah && <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs bg-orange-400">Asr Iqamah</th>}
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Maghrib</th>
                  {hasIqamah && <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs bg-orange-400">Maghrib Iqamah</th>}
                  <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs">Isha</th>
                  {hasIqamah && <th className="px-2 py-2 border-2 border-gray-400 font-bold text-xs bg-orange-400">Isha Iqamah</th>}
                </tr>
              </thead>
              <tbody>
                {prayerData.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{day.dayName}</td>
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{day.date}</td>
                    <td className="px-2 py-2 border-2 border-gray-300 text-center text-xs font-bold text-blue-700">{day.hijri || '-'}</td>
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.timings.fajr)}</td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'fajr') ? (formatTime(getIqamahTime(index, 'fajr', day.timings.fajr)) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.duha)}</td>
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.timings.dhuhr)}</td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'zuhr') ? (formatTime(getIqamahTime(index, 'zuhr', day.timings.dhuhr)) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.timings.asr)}</td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'asr') ? (formatTime(getIqamahTime(index, 'asr', day.timings.asr)) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.timings.maghrib)}</td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'maghrib') ? (formatTime(getIqamahTime(index, 'maghrib', day.timings.maghrib)) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs">{formatTime(day.timings.isha)}</td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'isha') ? (formatTime(getIqamahTime(index, 'isha', day.timings.isha)) || '-') : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {notes && notes.length > 0 && notes.some(n => n.heading || n.body) && (
          <div className="px-2 border-t-2 border-gray-400 flex-shrink-0 w-full" style={{ marginTop: '0px', paddingTop: '2px' }}>
            <div className="grid grid-cols-3 gap-1">
              {notes.map((note, idx) => (
                (note.heading || note.body) && (
                  <div key={idx} className="border-2 border-blue-400 rounded-lg p-1 bg-blue-50 text-center">
                    {note.heading && <p className="text-xs font-bold text-gray-900 mb-0">{note.heading}</p>}
                    {note.body && <p className="text-xs text-gray-800 leading-tight">{note.body}</p>}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 pt-2 border-t-2 border-gray-400 text-center text-xs text-gray-600 px-4 flex-shrink-0 w-full">
          <p>Generated with Prayer Times App</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 text-center mb-8">
        <button
          onClick={handleExportPDF}
          className="bg-islamic-600 hover:bg-islamic-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
        >
          📥 Export as PDF
        </button>
      </div>
    </div>
  );
}
