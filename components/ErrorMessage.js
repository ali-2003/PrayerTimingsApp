// components/ErrorMessage.js
export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between items-start">
      <div>
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-700 text-sm mt-1">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-800 font-bold"
      >
        ✕
      </button>
    </div>
  );
}
