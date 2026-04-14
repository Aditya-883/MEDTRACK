export function ToastSingle({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg z-50 text-white max-w-sm
        ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}
    >
      {toast.msg}
    </div>
  );
}

export function ToastStack({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium
            flex items-center gap-2 min-w-[260px] max-w-sm
            transition-all duration-300 animate-slide-in
            ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}
        >
          <span className="text-lg leading-none">
            {t.type === 'error' ? '✗' : t.type === 'success' ? '✓' : 'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
