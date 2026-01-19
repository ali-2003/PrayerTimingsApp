// components/NotesSection.js - UP TO 3 NOTES
import { useState } from 'react';

export default function NotesSection({ onNotesChange }) {
  const [notes, setNotes] = useState([
    { heading: '', body: '' },
    { heading: '', body: '' },
    { heading: '', body: '' }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...notes];
    updated[index][field] = value;
    setNotes(updated);
    onNotesChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-islamic-700 mb-4">📝 Notes (Up to 3)</h2>
      
      {notes.map((note, idx) => (
        <div key={idx} className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Note {idx + 1}</h3>
          
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Heading (Optional)</label>
            <input
              type="text"
              value={note.heading}
              onChange={(e) => handleChange(idx, 'heading', e.target.value)}
              placeholder="e.g., Jumu'ah Notice"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{note.heading.length}/50</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Body Text (Optional)</label>
            <textarea
              value={note.body}
              onChange={(e) => handleChange(idx, 'body', e.target.value)}
              placeholder="e.g., Jumu'ah is at 1:30 PM on Fridays..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-islamic-600 h-20 resize-none"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{note.body.length}/150</p>
          </div>
        </div>
      ))}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Preview:</strong> Notes will appear on PDF
        </p>
        {notes.some(n => n.heading || n.body) && (
          <div className="mt-3 space-y-3">
            {notes.map((note, idx) => (
              (note.heading || note.body) && (
                <div key={idx} className="bg-white p-2 rounded border border-blue-200">
                  {note.heading && <p className="font-bold text-sm">{note.heading}</p>}
                  {note.body && <p className="text-xs text-gray-700">{note.body}</p>}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
