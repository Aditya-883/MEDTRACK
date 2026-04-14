import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar.jsx';
import { shortenAddress } from '../../utils/wallet.js';

const ROLE_ROUTES = { admin: '/admin', doctor: '/doctor', patient: '/patient' };

export default function WrongRole({ requiredRole, userRole, address }) {
  const navigate = useNavigate();
  const dest = ROLE_ROUTES[userRole];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-16 flex-1 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">
            {requiredRole
              ? `${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} Access Required`
              : 'Wrong Role'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            This page is for <strong>{requiredRole ?? 'a different role'}</strong> only.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Wallet <span className="font-mono">{shortenAddress(address)}</span> is registered as{' '}
            <strong className="uppercase">{userRole ?? 'unknown'}</strong>.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {dest && (
              <button
                onClick={() => navigate(dest)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
              >
                Go to {userRole} dashboard →
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 dark:bg-gray-600 dark:text-white px-6 py-2 rounded-lg transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
