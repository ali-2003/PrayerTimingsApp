// components/MosqueForm.js
import { useState } from 'react';

export default function MosqueForm({ onSave, initialData }) {
  const [mosqueInfo, setMosqueInfo] = useState(
    initialData || {
      name: '',
      address: '',
      phone: '',
      website: '',
    }
  );

  const handleChange = (field, value) => {
    setMosqueInfo({
      ...mosqueInfo,
      [field]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mosqueInfo.name && mosqueInfo.address) {
      onSave(mosqueInfo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-islamic-700 mb-4">Mosque Information</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mosque Name *</label>
        <input
          type="text"
          value={mosqueInfo.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Islamic Center of Glen Ellyn"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
        <input
          type="text"
          value={mosqueInfo.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="e.g., 123 Main St, Glen Ellyn, IL 60137"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={mosqueInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={mosqueInfo.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full button-primary"
      >
        Save Mosque Info
      </button>
    </form>
  );
}
