// components/SearchBar.js
import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [useFajr, setUseFajr] = useState(false);
  const [fajrAngle, setFajrAngle] = useState(15);
  const [ishaAngle, setIshaAngle] = useState(18);
  const [asrMethod, setAsrMethod] = useState(0); // 0 = Standard, 1 = Hanafi
  
  // Iqamah state
  const [iqamahRanges, setIqamahRanges] = useState({
    fajr: [[1, 31, '06:15']],
    zuhr: [[1, 31, '13:30']],
    asr: [[1, 31, '15:20']],
    maghrib: [[1, 31, '17:00']],
    isha: [[1, 31, '19:30']],
  });

  const handleAddRange = (prayer) => {
    const newRange = [1, 31, '00:00'];
    setIqamahRanges({
      ...iqamahRanges,
      [prayer]: [...(iqamahRanges[prayer] || []), newRange],
    });
  };

  const handleUpdateRange = (prayer, index, field, value) => {
    const updated = [...iqamahRanges[prayer]];
    updated[index][field] = field === 2 ? value : parseInt(value);
    setIqamahRanges({
      ...iqamahRanges,
      [prayer]: updated,
    });
  };

  const handleRemoveRange = (prayer, index) => {
    const updated = iqamahRanges[prayer].filter((_, i) => i !== index);
    setIqamahRanges({
      ...iqamahRanges,
      [prayer]: updated.length > 0 ? updated : [[1, 31, '00:00']],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customAngles = useFajr ? { fajr: parseFloat(fajrAngle), isha: parseFloat(ishaAngle) } : null;
    
    onSearch({
      city,
      state,
      month: parseInt(month),
      year: parseInt(year),
      customAngles,
      asrMethod: parseInt(asrMethod),
      iqamahRanges,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Location & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Glen Ellyn"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., Illinois"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Custom Angles & ASR Method */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="customAngles"
            checked={useFajr}
            onChange={(e) => setUseFajr(e.target.checked)}
            className="h-4 w-4 text-islamic-600"
          />
          <label htmlFor="customAngles" className="ml-2 text-sm font-medium text-gray-700">
            Use Custom Angles
          </label>
        </div>

        {useFajr && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fajr Angle: {fajrAngle}°
              </label>
              <input
                type="number"
                value={fajrAngle}
                onChange={(e) => setFajrAngle(e.target.value)}
                step="0.5"
                min="0"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isha Angle: {ishaAngle}°
              </label>
              <input
                type="number"
                value={ishaAngle}
                onChange={(e) => setIshaAngle(e.target.value)}
                step="0.5"
                min="0"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ ASR Calculation Method
          </label>
          <select
            value={asrMethod}
            onChange={(e) => setAsrMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="0">Standard (Shafi, Hanbli, Maliki) - Earlier</option>
            <option value="1">Hanafi - Later</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            Standard: ~14:14 | Hanafi: ~14:51
          </p>
        </div>
      </div>

      {/* Iqamah Schedule */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-islamic-700 mb-4">⏱️ Iqamah Schedule</h3>
        
        {Object.keys(iqamahRanges).map((prayer) => (
          <div key={prayer} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800 capitalize">{prayer}</h4>
              <button
                type="button"
                onClick={() => handleAddRange(prayer)}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                + Add Range
              </button>
            </div>

            {(iqamahRanges[prayer] || []).map((range, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center flex-wrap">
                <span className="text-xs text-gray-600">Days</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={range[0]}
                  onChange={(e) => handleUpdateRange(prayer, index, 0, e.target.value)}
                  className="w-14 px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <span className="text-xs text-gray-600">to</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={range[1]}
                  onChange={(e) => handleUpdateRange(prayer, index, 1, e.target.value)}
                  className="w-14 px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <span className="text-xs text-gray-600">Time</span>
                <input
                  type="time"
                  value={range[2]}
                  onChange={(e) => handleUpdateRange(prayer, index, 2, e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                />
                {(iqamahRanges[prayer]?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRange(prayer, index)}
                    className="text-red-600 text-xs hover:text-red-800 ml-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-islamic-600 hover:bg-islamic-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Prayer Times & Iqamah'}
      </button>
    </form>
  );
}