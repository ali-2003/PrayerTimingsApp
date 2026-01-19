// pages/index.js - FIX: PROPER DATA CONVERSION
import { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchBar from '../components/SearchBar';
import PrayerTable from '../components/PrayerTable';
import MosqueForm from '../components/MosqueForm';
import ErrorMessage from '../components/ErrorMessage';
import NotesSection from '../components/NotesSection';
import IqamahSettings from '../components/IqamahSettings';

export default function Home() {
  const [prayerData, setPrayerData] = useState(null);
  const [mosqueInfo, setMosqueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customAngles, setCustomAngles] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [iqamahRanges, setIqamahRanges] = useState(null);
  const [showMosqueForm, setShowMosqueForm] = useState(true);
  const [notes, setNotes] = useState([
    { heading: '', body: '' },
    { heading: '', body: '' },
    { heading: '', body: '' }
  ]);

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

  const handleIqamahChange = (iqamahSettings) => {
    console.log('\n🔴🔴🔴 INDEX.JS RECEIVED IQAMAH SETTINGS 🔴🔴🔴');
    console.log('Raw iqamahSettings:', iqamahSettings);

    // CONVERT from IqamahSettings format to PrayerTable format
    const convertedRanges = {};
    
    Object.keys(iqamahSettings).forEach(prayer => {
      const prayerSettings = iqamahSettings[prayer];
      console.log(`\n📝 Converting ${prayer}:`, prayerSettings);
      
      if (prayerSettings.mode === 'variable') {
        // VARIABLE MODE: Create array with offset
        convertedRanges[prayer] = [{
          startDay: 1,
          endDay: 31,
          offset: prayerSettings.variable,
          isVariable: true,
          rangeIndex: 0
        }];
        console.log(`✅ ${prayer} VARIABLE: offset=${prayerSettings.variable}`);
      } else {
        // FIXED MODE: Convert ranges array
        convertedRanges[prayer] = prayerSettings.ranges.map((range, idx) => ({
          startDay: range[0],
          endDay: range[1],
          time: range[2],
          isVariable: false,
          rangeIndex: idx
        }));
        console.log(`✅ ${prayer} FIXED: ${prayerSettings.ranges.length} ranges`);
      }
    });

    console.log('\n🟢 CONVERTED RANGES:');
    console.log(JSON.stringify(convertedRanges, null, 2));
    console.log('🟢🟢🟢 SETTING STATE 🟢🟢🟢\n');

    setIqamahRanges(convertedRanges);
  };

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setPrayerData(null);
    setSearchParams(params);

    try {
      let fajrAngle = 18;
      let ishaAngle = 10;
      
      if (params.customAngles) {
        fajrAngle = params.customAngles.fajr;
        ishaAngle = params.customAngles.isha;
      }

      console.log(`\n🕌 Fetching Prayer Times: ${params.city}, ${params.state}`);
      console.log(`Fajr ${fajrAngle}°, Isha ${ishaAngle}°`);

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
          asrMethod: params.asrMethod,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch prayer times');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setPrayerData(data.data);
      setCustomAngles({ fajr: fajrAngle, isha: ishaAngle });
      console.log('✅ Prayer times fetched successfully\n');
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Prayer Times Generator</title>
        <meta name="description" content="Generate prayer times with Iqamah schedules" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-islamic-700 mb-2">🕌 Prayer Times Generator</h1>
            <p className="text-gray-600 text-lg">With Iqamah Schedules & PDF Export</p>
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
              
              {/* Iqamah Settings */}
              <IqamahSettings onIqamahChange={handleIqamahChange} />
              
              {/* Notes Section */}
              <NotesSection onNotesChange={setNotes} />
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
              notes={notes}
            />
          )}
        </div>
      </main>
    </>
  );
}
