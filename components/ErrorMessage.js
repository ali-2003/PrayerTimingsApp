export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4">
      <p className="font-semibold">⚠️ Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
