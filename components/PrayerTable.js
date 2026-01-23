// components/PrayerTable.js
import { useRef } from 'react';
import { exportTableToPDF } from '../utils/pdfExport';
import { getMonthName } from '../utils/prayerTimes';

export default function PrayerTable({
  prayerData,
  mosqueInfo,
  customAngles,
  searchParams,
  iqamahRanges,
  notes,
  iqamahMode,
  // Friday salat configurable props
  fridayTitle = 'Friday Salat',
  fridayFirstLabel = '1st English Talk:',
  fridayFirstTime = '1:10 PM',
  fridaySecondLabel = '1st Khutbah:',
  fridaySecondTime = '1:30 PM',
}) {
  const tableRef = useRef(null);

  if (!prayerData || prayerData.length === 0) {
    return <div className="text-center text-gray-600">No prayer data available</div>;
  }

  const monthName = getMonthName(searchParams.month);

  // Extract ALL unique Hijri months in this Gregorian month
  const hijriMonths = new Set();
  prayerData.forEach((day) => {
    if (day.hijri && day.hijri.includes(' ')) {
      const monthPart = day.hijri.split(' ').slice(1).join(' ');
      hijriMonths.add(monthPart);
    }
  });
  const hijriMonthsArray = Array.from(hijriMonths);

  // Check if ANY iqamah exists
  let hasIqamah = false;
  if (iqamahRanges && typeof iqamahRanges === 'object') {
    hasIqamah = Object.keys(iqamahRanges).some((prayer) => {
      const prayerSettings = iqamahRanges[prayer];
      return Array.isArray(prayerSettings.ranges) && prayerSettings.ranges.length > 0;
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

    if (Array.isArray(prayerSettings.ranges)) {
      const matchingRange = prayerSettings.ranges.find(
        (range) => day >= range.startDay && day <= range.endDay
      );
      return !!matchingRange;
    }

    return false;
  };

  const getIqamahTime = (dayIndex, prayer, prayerTime) => {
    if (!hasIqamah || !iqamahRanges?.[prayer]) return null;

    const prayerSettings = iqamahRanges[prayer];
    const day = dayIndex + 1;

    if (Array.isArray(prayerSettings.ranges)) {
      const matchingRange = prayerSettings.ranges.find(
        (range) => day >= range.startDay && day <= range.endDay
      );

      if (!matchingRange) return null;

      if (matchingRange.type === 'fixed') {
        return matchingRange.time;
      }

      if (matchingRange.type === 'variable') {
        return calculateVariableIqamah(prayerTime, matchingRange.variable);
      }
    }

    return null;
  };

  // Remove am/pm and whitespace from time strings
  const formatTime = (time) => {
    if (!time) return '-';
    return time.replace(/\s*(am|pm)\s*/gi, '').trim();
  };

  const handleExportPDF = async () => {
    const filename = `${mosqueInfo.name}_${monthName}_${searchParams.year}.pdf`;
    await exportTableToPDF(tableRef.current, filename, monthName);
  };

  return (
    <div className="mt-0">
      <div
        className="bg-white p-0 border-4 border-gray-700 flex flex-col"
        ref={tableRef}
        style={{ width: '100%', margin: '0', padding: '0' }}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 w-full border-b-2 border-gray-500">
          <div className="grid grid-cols-12 bg-gray-100">
            {/* Left: custom picture / logo */}
            <div className="col-span-2 border-r-2 border-gray-400 flex items-center justify-center py-6">
              <img
                src={mosqueInfo.logoUrl || 'https://static.vecteezy.com/system/resources/previews/025/263/660/non_2x/low-poly-and-mosque-logo-design-islamic-logo-template-illustration-free-vector.jpg'}
                alt={mosqueInfo.name}
                className="w-36 h-24 rounded-full object-cover border-2 border-gray-500 shadow-md"
              />
            </div>

            {/* Center: hero-style middle */}
            <div className="col-span-7 border-r-2 border-gray-400 flex flex-col items-center justify-center py-6 px-6">
              <p className="text-sm tracking-[0.25em] uppercase text-gray-500 mb-2">
                Monthly Prayer Schedule
              </p>

              <h1 className="text-4xl font-extrabold tracking-wide text-gray-900 uppercase">
                {mosqueInfo.name}
              </h1>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center">
                <div className="px-5 py-2 border-2 border-gray-600 bg-white shadow-sm rounded-md">
                  <p className="text-md font-semibold text-gray-800">
                    {monthName} {searchParams.year}
                  </p>
                </div>
                <div className="px-5 py-2 border-2 border-gray-600 bg-white shadow-sm rounded-md">
                  <p className="text-md font-semibold text-gray-800">
                    {hijriMonthsArray.join(' / ')} 1447
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Friday Salat box */}
            <div className="col-span-3 bg-gray-200 px-4 py-4 flex flex-col">
              <div className="border-b-2 border-gray-500 pb-2 mb-2">
                <p className="text-xl font-bold text-gray-900 text-center tracking-wide">
                  {fridayTitle}
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-3 text-base font-semibold text-gray-800">
                <div className="text-center">
                  <p>{fridayFirstLabel}</p>
                  <p className="text-lg font-bold">{fridayFirstTime}</p>
                </div>
                <div className="text-center">
                  <p>{fridaySecondLabel}</p>
                  <p className="text-lg font-bold">{fridaySecondTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full flex-grow overflow-visible px-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse" style={{ width: '100%' }}>
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Day</div>
                  </th>
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Date</div>
                  </th>
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Hijri</div>
                  </th>
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Fajr</div>
                  </th>
                  {hasIqamah && (
                    <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md bg-orange-500">
                      <div className="flex items-center justify-center h-full">
                        Fajr Iqamah
                      </div>
                    </th>
                  )}
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Duha</div>
                  </th>
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Zuhr</div>
                  </th>
                  {hasIqamah && (
                    <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md bg-orange-500">
                      <div className="flex items-center justify-center h-full">
                        Zuhr Iqamah
                      </div>
                    </th>
                  )}
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Asr</div>
                  </th>
                  {hasIqamah && (
                    <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md bg-orange-500">
                      <div className="flex items-center justify-center h-full">
                        Asr Iqamah
                      </div>
                    </th>
                  )}
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Maghrib</div>
                  </th>
                  {hasIqamah && (
                    <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md bg-orange-500">
                      <div className="flex items-center justify-center h-full">
                        Maghrib Iqamah
                      </div>
                    </th>
                  )}
                  <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md">
                    <div className="flex items-center justify-center h-full">Isha</div>
                  </th>
                  {hasIqamah && (
                    <th className="px-2 py-2 border-2 border-gray-500 font-bold text-md bg-orange-500">
                      <div className="flex items-center justify-center h-full">
                        Isha Iqamah
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {prayerData.map((day, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                  >
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {day.dayName}
                      </div>
                    </td>
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {day.date}
                      </div>
                    </td>
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold text-blue-700">
                        {day.hijri || '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.timings.fajr)}
                      </div>
                    </td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-400 text-md bg-blue-100">
                        <div className="flex items-center justify-center h-full font-bold">
                          {shouldShowIqamah(index, 'fajr')
                            ? formatTime(
                                getIqamahTime(index, 'fajr', day.timings.fajr)
                              ) || '-'
                            : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.duha)}
                      </div>
                    </td>
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.timings.dhuhr)}
                      </div>
                    </td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-400 text-md bg-blue-100">
                        <div className="flex items-center justify-center h-full font-bold">
                          {shouldShowIqamah(index, 'zuhr')
                            ? formatTime(
                                getIqamahTime(index, 'zuhr', day.timings.dhuhr)
                              ) || '-'
                            : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.timings.asr)}
                      </div>
                    </td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-400 text-md bg-blue-100">
                        <div className="flex items-center justify-center h-full font-bold">
                          {shouldShowIqamah(index, 'asr')
                            ? formatTime(
                                getIqamahTime(index, 'asr', day.timings.asr)
                              ) || '-'
                            : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.timings.maghrib)}
                      </div>
                    </td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-400 text-md bg-blue-100">
                        <div className="flex items-center justify-center h-full font-bold">
                          {shouldShowIqamah(index, 'maghrib')
                            ? formatTime(
                                getIqamahTime(
                                  index,
                                  'maghrib',
                                  day.timings.maghrib
                                )
                              ) || '-'
                            : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-2 py-2 border-2 border-gray-400 text-md">
                      <div className="flex items-center justify-center h-full font-bold">
                        {formatTime(day.timings.isha)}
                      </div>
                    </td>
                    {hasIqamah && (
                      <td className="px-2 py-2 border-2 border-gray-400 text-md bg-blue-100">
                        <div className="flex items-center justify-center h-full font-bold">
                          {shouldShowIqamah(index, 'isha')
                            ? formatTime(
                                getIqamahTime(index, 'isha', day.timings.isha)
                              ) || '-'
                            : '-'}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {notes &&
          notes.length > 0 &&
          notes.some((n) => n.heading || n.body) && (
            <div className="px-3 border-t-4 border-gray-700 flex-shrink-0 w-full py-3">
              <div className="grid grid-cols-3 gap-2">
                {notes.map(
                  (note, idx) =>
                    (note.heading || note.body) && (
                      <div
                        key={idx}
                        className="border-2 border-gray-600 rounded-md p-2 bg-gray-50 text-center"
                      >
                        {note.heading && (
                          <p className="text-md font-bold text-gray-900 mb-1">
                            {note.heading}
                          </p>
                        )}
                        {note.body && (
                          <p className="text-md text-gray-800 leading-snug">
                            {note.body}
                          </p>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

        {/* Footer */}
        <div className="mt-2 pt-2 border-t-4 border-gray-700 text-center text-md font-semibold text-gray-700 px-4 py-2 flex-shrink-0 w-full bg-gray-100">
          <p>Generated with Prayer Times App</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 text-center mb-8">
        <button
          onClick={handleExportPDF}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
        >
          📥 Export as PDF
        </button>
      </div>
    </div>
  );
}
