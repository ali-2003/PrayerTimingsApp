// components/IqamahSettings.js - FIXED: Mixed Fixed/Variable per range
import { useState } from 'react';

export default function IqamahSettings({ onIqamahChange }) {
  const [iqamahSettings, setIqamahSettings] = useState({
    fajr: { ranges: [] },
    zuhr: { ranges: [] },
    asr: { ranges: [] },
    maghrib: { ranges: [] },
    isha: { ranges: [] }
  });

  const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
  const prayerNames = { fajr: 'Fajr', zuhr: 'Zuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

  const handleAddRange = (prayer) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: {
        ranges: [...(iqamahSettings[prayer].ranges || []), { startDay: 1, endDay: 15, type: 'fixed', time: '12:00 pm', variable: 5 }]
      }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  const handleRangeChange = (prayer, index, field, value) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: {
        ranges: iqamahSettings[prayer].ranges.map((range, i) => {
          if (i === index) {
            const newRange = { ...range };
            if (field === 'startDay' || field === 'endDay') {
              newRange[field] = parseInt(value);
            } else if (field === 'variable') {
              newRange[field] = parseInt(value);
            } else {
              newRange[field] = value;
            }
            return newRange;
          }
          return range;
        })
      }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  const handleRemoveRange = (prayer, index) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: {
        ranges: iqamahSettings[prayer].ranges.filter((_, i) => i !== index)
      }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-islamic-700 mb-6">⏰ Iqamah Settings (Mixed Ranges)</h2>

      <div className="space-y-6">
        {prayers.map((prayer) => (
          <div key={prayer} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{prayerNames[prayer]}</h3>
              <button
                onClick={() => handleAddRange(prayer)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm"
              >
                + Add Range
              </button>
            </div>

            {iqamahSettings[prayer].ranges && iqamahSettings[prayer].ranges.length > 0 ? (
              <div className="space-y-3">
                {iqamahSettings[prayer].ranges.map((range, idx) => (
                  <div key={idx} className={`p-4 rounded border-2 space-y-3 ${idx % 2 === 0 ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
                    {/* Date Range */}
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-semibold text-gray-700 w-12">Days</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={range.startDay}
                        onChange={(e) => handleRangeChange(prayer, idx, 'startDay', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-600">to</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={range.endDay}
                        onChange={(e) => handleRangeChange(prayer, idx, 'endDay', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    {/* Type Selection */}
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-semibold text-gray-700 w-12">Type</label>
                      <select
                        value={range.type}
                        onChange={(e) => handleRangeChange(prayer, idx, 'type', e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="fixed">📅 Fixed Time</option>
                        <option value="variable">➕ Variable (+minutes)</option>
                      </select>
                    </div>

                    {/* Fixed Time Input */}
                    {range.type === 'fixed' && (
                      <div className="flex gap-2 items-center">
                        <label className="text-sm font-semibold text-gray-700 w-12">Time</label>
                        <input
                          type="text"
                          placeholder="HH:MM am/pm"
                          value={range.time}
                          onChange={(e) => handleRangeChange(prayer, idx, 'time', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}

                    {/* Variable Minutes Input */}
                    {range.type === 'variable' && (
                      <div className="flex gap-2 items-center">
                        <label className="text-sm font-semibold text-gray-700 w-12">Minutes</label>
                        <input
                          type="number"
                          value={range.variable}
                          onChange={(e) => handleRangeChange(prayer, idx, 'variable', e.target.value)}
                          min="0"
                          max="60"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-600 text-sm">minutes after {prayerNames[prayer]}</span>
                      </div>
                    )}

                    {/* Remove Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveRange(prayer, idx)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Remove Range
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic bg-white p-3 rounded border border-dashed">
                No ranges added. Click "Add Range" to create one.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-200">
        <p className="text-sm font-bold text-blue-900 mb-2">💡 How to Use:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✅ Days 1-18: Add range with "Fixed Time" (e.g., 6:15 am)</li>
          <li>✅ Days 19-31: Add range with "Variable" (e.g., +5 minutes)</li>
          <li>✅ Mix and match different types for same prayer</li>
        </ul>
      </div>
    </div>
  );
}
