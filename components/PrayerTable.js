// components/PrayerTable.js - FINAL VERSION: Perfect formatting, Hijri dates, alternating colors
import { useRef } from 'react';
import { exportTableToPDF } from '../utils/pdfExport';
import { getMonthName } from '../utils/prayerTimes';

export default function PrayerTable({ prayerData, mosqueInfo, customAngles, searchParams, iqamahRanges }) {
  const tableRef = useRef(null);

  const handleExportPDF = async () => {
    if (tableRef.current) {
      const monthName = getMonthName(searchParams.month);
      const year = searchParams.year;
      const filename = `${mosqueInfo.name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`;
      await exportTableToPDF(tableRef.current, filename, monthName);
    }
  };

  if (!prayerData || prayerData.length === 0) {
    return null;
  }

  const monthName = searchParams?.monthName || getMonthName(searchParams?.month);
  const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][searchParams.month - 1];
  const hasIqamah = iqamahRanges && Object.values(iqamahRanges).some(arr => arr.length > 0);

  // Alternating colors for ranges: Light Blue, White, Blue
  const getIqamahCellColor = (dayNum, prayer) => {
    if (!prayerData[dayNum]?.iqamahInfo[prayer]) return '';
    const rangeIndex = prayerData[dayNum].iqamahInfo[prayer].rangeIndex || 0;
    const colors = ['bg-blue-100', 'bg-white', 'bg-blue-200'];
    return colors[rangeIndex % colors.length];
  };

  // Show Iqamah only in middle cell
  const shouldShowIqamah = (dayNum, prayer) => {
    if (!prayerData[dayNum]?.iqamahInfo[prayer]) return false;
    const info = prayerData[dayNum].iqamahInfo[prayer];
    return prayerData[dayNum].date === info.middleDay;
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-md p-2" ref={tableRef} style={{ width: '100%', maxWidth: '100%' }}>
        {/* Header Section */}
        <div className="border-b-2 border-islamic-700 pb-4 mb-4 text-center">
          <h1 className="text-4xl font-bold text-islamic-700 mb-1">
            🕌 {mosqueInfo.name}
          </h1>
          <p className="text-2xl font-semibold text-gray-800 mb-2">{monthName} {searchParams.year}</p>
          <div className="text-gray-700 text-sm">
            <p>{mosqueInfo.address} {mosqueInfo.phone && `| ${mosqueInfo.phone}`}</p>
            {mosqueInfo.website && <p>{mosqueInfo.website}</p>}
          </div>
        </div>

        {/* Prayer Times Table - NO STRETCHING, PROPER SIZING */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-base" style={{ minWidth: '100%' }}>
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-4 text-center font-bold text-xl">Day</th>
                <th className="px-4 py-4 text-center font-bold text-xl">{monthAbbr}</th>
                <th className="px-4 py-4 text-center font-bold text-xl">Hijri</th>
                <th className="px-4 py-4 text-center font-bold text-xl">Fajr</th>
                {hasIqamah && <th className="px-4 py-4 text-center font-bold bg-orange-400 text-xl">Fajr Iqamah</th>}
                <th className="px-4 py-4 text-center font-bold text-xl">Duha</th>
                <th className="px-4 py-4 text-center font-bold text-xl">Zuhr</th>
                {hasIqamah && <th className="px-4 py-4 text-center font-bold bg-orange-400 text-xl">Zuhr Iqamah</th>}
                <th className="px-4 py-4 text-center font-bold text-xl">Asr</th>
                {hasIqamah && <th className="px-4 py-4 text-center font-bold bg-orange-400 text-xl">Asr Iqamah</th>}
                <th className="px-4 py-4 text-center font-bold text-xl">Maghrib</th>
                {hasIqamah && <th className="px-4 py-4 text-center font-bold bg-orange-400 text-xl">Maghrib Iqamah</th>}
                <th className="px-4 py-4 text-center font-bold text-xl">Isha</th>
                {hasIqamah && <th className="px-4 py-4 text-center font-bold bg-orange-400 text-xl">Isha Iqamah</th>}
              </tr>
            </thead>
            <tbody>
              {prayerData.map((day, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-4 text-center font-bold text-gray-800 text-xl">
                    {day.dayName}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-gray-800 text-xl">
                    {day.date}
                  </td>
                  <td className="px-4 py-4 text-center text-xl font-semibold text-blue-700">
                    {day.hijri || '-'}
                  </td>
          <td className="px-4 py-4 text-center font-semibold text-2xl text-gray-900 whitespace-nowrap">
                    {day.timings.fajr}
                  </td>
                  {hasIqamah && (
                    <td className={`px-4 py-4 text-center font-bold text-2xl whitespace-nowrap ${getIqamahCellColor(index, 'fajr')}`}>
                      {shouldShowIqamah(index, 'fajr') ? day.iqamahInfo.fajr?.time : ''}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center text-2xl text-gray-800 font-semibold whitespace-nowrap">
                    {day.duha}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-2xl text-gray-900 whitespace-nowrap">
                    {day.timings.dhuhr}
                  </td>
                  {hasIqamah && (
                    <td className={`px-4 py-4 text-center font-bold text-2xl whitespace-nowrap ${getIqamahCellColor(index, 'zuhr')}`}>
                      {shouldShowIqamah(index, 'zuhr') ? day.iqamahInfo.zuhr?.time : ''}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center font-semibold text-2xl text-gray-900 whitespace-nowrap">
                    {day.timings.asr}
                  </td>
                  {hasIqamah && (
                    <td className={`px-4 py-4 text-center font-bold text-2xl whitespace-nowrap ${getIqamahCellColor(index, 'asr')}`}>
                      {shouldShowIqamah(index, 'asr') ? day.iqamahInfo.asr?.time : ''}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center font-semibold text-2xl text-gray-900 whitespace-nowrap">
                    {day.timings.maghrib}
                  </td>
                  {hasIqamah && (
                    <td className={`px-4 py-4 text-center font-bold text-2xl whitespace-nowrap ${getIqamahCellColor(index, 'maghrib')}`}>
                      {shouldShowIqamah(index, 'maghrib') ? day.iqamahInfo.maghrib?.time : ''}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center font-semibold text-2xl text-gray-900 whitespace-nowrap">
                    {day.timings.isha}
                  </td>
                  {hasIqamah && (
                    <td className={`px-4 py-4 text-center font-bold text-2xl whitespace-nowrap ${getIqamahCellColor(index, 'isha')}`}>
                      {shouldShowIqamah(index, 'isha') ? day.iqamahInfo.isha?.time : ''}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Generated with Prayer Times App</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleExportPDF}
          className="bg-islamic-600 hover:bg-islamic-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md"
        >
          📥 Export as PDF
        </button>
      </div>
    </div>
  );
}
