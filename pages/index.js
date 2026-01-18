// pages/index.js - COMPLETE WITH IQAMAH SUPPORT
import { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchBar from '../components/SearchBar';
import PrayerTable from '../components/PrayerTable';
import MosqueForm from '../components/MosqueForm';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [prayerData, setPrayerData] = useState(null);
  const [mosqueInfo, setMosqueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customAngles, setCustomAngles] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [iqamahRanges, setIqamahRanges] = useState(null);
  const [showMosqueForm, setShowMosqueForm] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mosqueInfo');
    if (saved) {
      setMosqueInfo(JSON.parse(saved));
      setShowMosqueForm(false);
    }
  }, []);

  const handleMosqueSave = (mosque) => {
    setMosqueInfo(mosque);
    localStorage.setItem('mosqueInfo', JSON.stringify(mosque));
    setShowMosqueForm(false);
  };

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setPrayerData(null);
    setSearchParams(params);
    setIqamahRanges(params.iqamahRanges || null);

    try {
      // Use form values if provided, otherwise use defaults
      let fajrAngle = 18;
      let ishaAngle = 10;
      
      if (params.customAngles) {
        fajrAngle = params.customAngles.fajr;
        ishaAngle = params.customAngles.isha;
      }

      console.log(`🕌 Prayer Times: ${params.city}, ${params.state}`);
      console.log(`📍 Fajr ${fajrAngle}°, Isha ${ishaAngle}°`);
      console.log(`🕐 Iqamah Ranges:`, params.iqamahRanges);

      // Get coordinates (Glen Ellyn is hardcoded)
      let latitude, longitude;
      if (params.city.toLowerCase() === 'glen ellyn' && params.state.toLowerCase() === 'illinois') {
        latitude = 41.8796;
        longitude = -88.0658;
      } else {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${params.city}&state=${params.state}&country=USA&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData || !geoData[0]) throw new Error('Location not found');
        latitude = parseFloat(geoData[0].lat);
        longitude = parseFloat(geoData[0].lon);
      }

      // Call Salah Hour (salahhour.com) via server-side route
      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          month: params.month,
          year: params.year,
          fajrAngle,
          ishaAngle,
          asrMethod: params.asrMethod || 0,
          iqamahRanges: params.iqamahRanges || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch');
      }

      const data = await response.json();
      setPrayerData(data.data);
      setCustomAngles(data.customAngles);
      setSearchParams({
        city: params.city,
        state: params.state,
        month: params.month,
        year: params.year,
        monthName: new Date(params.year, params.month - 1).toLocaleDateString('en-US', { month: 'long' })
      });

      console.log('✅ Prayer times fetched successfully');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Prayer Times Generator</title>
        <meta name="description" content="Generate prayer times with custom angles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-islamic-700 mb-2">🕌 Prayer Times Generator</h1>
            <p className="text-gray-600">Generate professional prayer time schedules with custom angles</p>
          </div>

          {showMosqueForm ? (
            <MosqueForm onSave={handleMosqueSave} />
          ) : (
            <>
              <button
                onClick={() => setShowMosqueForm(true)}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
              >
                ✏️ Edit Mosque Info
              </button>
              <SearchBar onSearch={handleSearch} loading={loading} />
            </>
          )}

          {error && <ErrorMessage message={error} />}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-gray-600 mt-4">Loading prayer times...</p>
            </div>
          )}
          {prayerData && (
            <PrayerTable 
              prayerData={prayerData}
              mosqueInfo={mosqueInfo}
              customAngles={customAngles}
              searchParams={searchParams}
              iqamahRanges={iqamahRanges}
            />
          )}
        </div>
      </main>
    </>
  );
}
