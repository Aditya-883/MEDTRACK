export default function LoadingSpinner({ message = 'Loading…', color = 'blue' }) {
  const ring = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
  }[color] ?? 'border-blue-500';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div
          className={`animate-spin w-12 h-12 border-4 ${ring} border-t-transparent rounded-full mx-auto mb-4`}
        />
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
}
