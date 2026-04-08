export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`fixed top-5 right-5 px-4 py-2 rounded text-white shadow z-50
      ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
      {toast.msg}
    </div>
  );
}