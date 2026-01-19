// components/PrayerTable.js - FIXED: Proper PDF rendering
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
      if (prayerSettings.mode === 'variable' && prayerSettings.variable > 0) return true;
      if (prayerSettings.mode === 'fixed' && Array.isArray(prayerSettings.ranges) && prayerSettings.ranges.length > 0) return true;
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
    
    // Show for VARIABLE - always show
    if (prayerSettings.mode === 'variable') return true;
    
    // Show for FIXED - show on ALL days in range (not just middle)
    if (prayerSettings.mode === 'fixed' && Array.isArray(prayerSettings.ranges)) {
      const matchingRange = prayerSettings.ranges.find(range => {
        return day >= range[0] && day <= range[1];
      });
      // Return true for ALL days in range (removed middle-day logic)
      return matchingRange ? true : false;
    }
    
    return false;
  };

  const getIqamahTime = (dayIndex, prayer, prayerTime) => {
    if (!hasIqamah || !iqamahRanges?.[prayer]) return null;
    
    const prayerSettings = iqamahRanges[prayer];
    
    if (prayerSettings.mode === 'variable') {
      return calculateVariableIqamah(prayerTime, prayerSettings.variable);
    }
    
    if (prayerSettings.mode === 'fixed' && Array.isArray(prayerSettings.ranges)) {
      const day = dayIndex + 1;
      const matchingRange = prayerSettings.ranges.find(range => {
        return day >= range[0] && day <= range[1];
      });
      if (matchingRange) {
        return matchingRange[2];
      }
    }
    
    return null;
  };

  const handleExportPDF = async () => {
    try {
      const element = tableRef.current;
      
      // Get the actual element dimensions
      const elementWidth = element.scrollWidth;
      const elementHeight = element.scrollHeight;
      
      console.log('Element dimensions:', elementWidth, 'x', elementHeight);
      
      const canvas = await html2canvas(element, {
        scale: 2.0,  // Changed back to 2.0
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Force canvas to be exact size of element
        width: elementWidth,
        height: elementHeight,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
      });

      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = 210;   // A4 Portrait width
      const pdfHeight = 297;  // A4 Portrait height
      const margin = 3;       // Minimal margin
      const bottomPadding = 15; // Extra space at bottom
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const aspectRatio = imgWidth / imgHeight;
      
      const availWidth = pdfWidth - (margin * 2);
      const availHeight = pdfHeight - (margin * 2) - bottomPadding;
      
      // Calculate height based on width to maintain aspect ratio
      let finalWidth = availWidth;
      let finalHeight = finalWidth / aspectRatio;
      
      // If height exceeds available, scale down to fit
      if (finalHeight > availHeight) {
        finalHeight = availHeight;
        finalWidth = finalHeight * aspectRatio;
      }
      
      // Start from left margin
      const xPos = margin;
      const yPos = margin;
      
      console.log('Final PDF dimensions:', finalWidth, 'x', finalHeight, 'at position', xPos, yPos);
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
      
      // Multi-page support
      if (finalHeight > availHeight) {
        let heightRemaining = finalHeight - availHeight;
        let pageNum = 1;
        
        while (heightRemaining > 0.5) {
          pageNum++;
          pdf.addPage([pdfWidth, pdfHeight], 'portrait');
          
          const nextYPos = margin - ((pageNum - 1) * availHeight);
          pdf.addImage(imgData, 'PNG', xPos, nextYPos, finalWidth, finalHeight);
          
          heightRemaining -= availHeight;
        }
      }

      pdf.save(`${mosqueInfo.name}_${monthName}_${searchParams.year}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Error generating PDF');
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-md p-4 border-4 border-islamic-700 min-h-screen flex flex-col" ref={tableRef} style={{ width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <div className="border-b-4 border-islamic-700 pb-3 mb-4 px-4 text-center flex-shrink-0 w-full">
          <h1 className="text-3xl font-bold text-islamic-700 mb-1">🕌 {mosqueInfo.name}</h1>
          <p className="text-xl font-semibold text-gray-800 mb-4">{monthName} {searchParams.year}</p>
          
          <div className="bg-blue-100 p-2 rounded mb-2 border-2 border-blue-400 w-full">
            <p className="text-xs font-bold text-blue-900">Hijri:</p>
            <p className="text-sm font-bold text-blue-800">{hijriMonthsArray.join(' - ')} 1447</p>
          </div>
          
          <div className="text-gray-800 text-xs font-semibold w-full">
            <p>{mosqueInfo.address}</p>
            <p>{mosqueInfo.phone}</p>
          </div>
        </div>

        {/* Table */}
        <div className="w-full flex-grow overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Day</th>
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Date</th>
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Hijri</th>
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Fajr</th>
                  {hasIqamah && <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs bg-orange-400">Fajr Iqamah</th>}
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Duha</th>
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Zuhr</th>
                  {hasIqamah && <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs bg-orange-400">Zuhr Iqamah</th>}
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Asr</th>
                  {hasIqamah && <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs bg-orange-400">Asr Iqamah</th>}
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Maghrib</th>
                  {hasIqamah && <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs bg-orange-400">Maghrib Iqamah</th>}
                  <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs">Isha</th>
                  {hasIqamah && <th className="px-2 py-1 border-2 border-gray-400 font-bold text-xs bg-orange-400">Isha Iqamah</th>}
                </tr>
              </thead>
              <tbody>
                {prayerData.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.dayName}</td>
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.date}</td>
                    <td className="px-2 py-1 border-2 border-gray-300 text-center text-xs font-bold text-blue-700">{day.hijri || '-'}</td>
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.timings.fajr}</td>
                    {hasIqamah && (
                      <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'fajr') ? (getIqamahTime(index, 'fajr', day.timings.fajr) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.duha}</td>
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.timings.dhuhr}</td>
                    {hasIqamah && (
                      <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'zuhr') ? (getIqamahTime(index, 'zuhr', day.timings.dhuhr) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.timings.asr}</td>
                    {hasIqamah && (
                      <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'asr') ? (getIqamahTime(index, 'asr', day.timings.asr) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.timings.maghrib}</td>
                    {hasIqamah && (
                      <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'maghrib') ? (getIqamahTime(index, 'maghrib', day.timings.maghrib) || '-') : '-'}
                      </td>
                    )}
                    <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs">{day.timings.isha}</td>
                    {hasIqamah && (
                      <td className="px-2 py-1 border-2 border-gray-300 text-center font-bold text-xs bg-blue-100">
                        {shouldShowIqamah(index, 'isha') ? (getIqamahTime(index, 'isha', day.timings.isha) || '-') : '-'}
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
          <div className="mt-4 px-4 border-t-2 border-gray-400 pt-4 flex-shrink-0 w-full">
            <div className="grid grid-cols-3 gap-3">
              {notes.map((note, idx) => (
                (note.heading || note.body) && (
                  <div key={idx} className="border-2 border-blue-400 rounded-lg p-2 bg-blue-50 text-center">
                    {note.heading && <p className="text-xs font-bold text-gray-900 mb-1">{note.heading}</p>}
                    {note.body && <p className="text-xs text-gray-800 leading-relaxed">{note.body}</p>}
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
