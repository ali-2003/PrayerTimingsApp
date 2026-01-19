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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-islamic-600 hover:bg-islamic-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Prayer Times'}
      </button>
    </form>
  );
}