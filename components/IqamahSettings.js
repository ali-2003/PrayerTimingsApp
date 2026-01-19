// components/IqamahSettings.js - FIXED: Alternating colors for ranges
import { useState } from 'react';

export default function IqamahSettings({ onIqamahChange }) {
  const [iqamahSettings, setIqamahSettings] = useState({
    fajr: { mode: 'fixed', ranges: [], variable: 10 },
    zuhr: { mode: 'fixed', ranges: [], variable: 5 },
    asr: { mode: 'fixed', ranges: [], variable: 5 },
    maghrib: { mode: 'fixed', ranges: [], variable: 0 },
    isha: { mode: 'fixed', ranges: [], variable: 10 }
  });

  const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
  const prayerNames = { fajr: 'Fajr', zuhr: 'Zuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

  const handleModeChange = (prayer, mode) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: { ...iqamahSettings[prayer], mode }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  const handleVariableChange = (prayer, minutes) => {
    const numMins = parseInt(minutes) || 0;
    const updated = {
      ...iqamahSettings,
      [prayer]: { ...iqamahSettings[prayer], variable: numMins }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  const handleAddRange = (prayer) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: {
        ...iqamahSettings[prayer],
        ranges: [...(iqamahSettings[prayer].ranges || []), [1, 15, '12:00 pm']]
      }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  const handleRangeChange = (prayer, index, field, value) => {
    const updated = {
      ...iqamahSettings,
      [prayer]: {
        ...iqamahSettings[prayer],
        ranges: iqamahSettings[prayer].ranges.map((range, i) => {
          if (i === index) {
            const newRange = [...range];
            newRange[field] = field === 0 || field === 1 ? parseInt(value) : value;
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
        ...iqamahSettings[prayer],
        ranges: iqamahSettings[prayer].ranges.filter((_, i) => i !== index)
      }
    };
    setIqamahSettings(updated);
    onIqamahChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-islamic-700 mb-6">⏰ Iqamah Settings</h2>

      <div className="space-y-6">
        {prayers.map((prayer) => (
          <div key={prayer} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{prayerNames[prayer]}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeChange(prayer, 'fixed')}
                  className={`px-4 py-2 rounded font-semibold text-sm transition ${
                    iqamahSettings[prayer].mode === 'fixed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  📅 Fixed
                </button>
                <button
                  onClick={() => handleModeChange(prayer, 'variable')}
                  className={`px-4 py-2 rounded font-semibold text-sm transition ${
                    iqamahSettings[prayer].mode === 'variable'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  ➕ Variable
                </button>
              </div>
            </div>

            {/* Fixed Mode */}
            {iqamahSettings[prayer].mode === 'fixed' && (
              <div>
                <button
                  onClick={() => handleAddRange(prayer)}
                  className="mb-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm"
                >
                  + Add Range
                </button>
                
                {iqamahSettings[prayer].ranges && iqamahSettings[prayer].ranges.length > 0 ? (
                  <div className="space-y-3">
                    {iqamahSettings[prayer].ranges.map((range, idx) => (
                      <div key={idx} className={`p-3 rounded border-2 space-y-2 ${idx % 2 === 0 ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
                        <div className="flex gap-2 items-center">
                          <label className="text-sm font-semibold text-gray-700 w-8">Day</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={range[0]}
                            onChange={(e) => handleRangeChange(prayer, idx, 0, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-600">to</span>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={range[1]}
                            onChange={(e) => handleRangeChange(prayer, idx, 1, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <label className="text-sm font-semibold text-gray-700 w-8">Time</label>
                          <input
                            type="text"
                            placeholder="HH:MM am/pm"
                            value={range[2]}
                            onChange={(e) => handleRangeChange(prayer, idx, 2, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleRemoveRange(prayer, idx)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic bg-white p-3 rounded border border-dashed">
                    No ranges added
                  </p>
                )}
              </div>
            )}

            {/* Variable Mode */}
            {iqamahSettings[prayer].mode === 'variable' && (
              <div className="bg-white p-4 rounded border border-green-300">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Minutes after {prayerNames[prayer]}
                    </label>
                    <input
                      type="number"
                      value={iqamahSettings[prayer].variable}
                      onChange={(e) => handleVariableChange(prayer, e.target.value)}
                      min="0"
                      max="60"
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200 text-center">
                    <p className="text-xs text-gray-600">Current</p>
                    <p className="text-sm font-bold text-green-700">+{iqamahSettings[prayer].variable} mins</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
