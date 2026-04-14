import Sidebar from '../layout/Sidebar.jsx';

export default function NotConnected({ onConnect, context = 'this page' }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-16 flex-1 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please connect your MetaMask wallet to access {context}.
          </p>
          <button
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
