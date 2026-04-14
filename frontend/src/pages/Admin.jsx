import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import NotConnected from '../components/ui/NotConnected.jsx';
import WrongRole from '../components/ui/WrongRole.jsx';
import { ToastSingle } from '../components/ui/Toast.jsx';
import { adminLogin, checkUserRole } from '../api/auth.js';
import { getAllUsers, updateUserRole } from '../api/users.js';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pageState, setPageState] = useState('loading');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [modal, setModal] = useState({ open: false, address: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function requestAndInit() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.length > 0) await init(accounts[0]);
      else setPageState('notconnected');
    } catch {
      setPageState('notconnected');
    }
  }

  async function init(forcedAccount) {
    try {
      setPageState('loading');
      if (!window.ethereum) { setPageState('notconnected'); return; }

      let acc = forcedAccount;
      if (!acc) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        acc = accounts?.[0];
      }
      if (!acc) { setPageState('notconnected'); return; }

      setCurrentAccount(acc);

      const user = await checkUserRole(acc);
      if (!user) {
        showToast('Cannot reach backend server. Check that it is running.', 'error');
        setPageState('notconnected');
        return;
      }

      setUserRole(user.role);
      if (user.role !== 'admin') { setPageState('notadmin'); return; }

      // Validate / obtain JWT
      let token = localStorage.getItem('token');
      if (token) {
        try {
          const users = await getAllUsers();
          if (!users) { token = null; localStorage.removeItem('token'); }
        } catch { token = null; localStorage.removeItem('token'); }
      }

      if (!token) {
        showToast('Sign the message in MetaMask to authenticate as admin…');
        await adminLogin();
      }

      setPageState('ready');
      await fetchUsers();
    } catch (err) {
      console.error('Admin init error:', err);
      if (err.message?.includes('Not an admin')) {
        setUserRole('unknown');
        setPageState('notadmin');
      } else {
        showToast(err.message || 'Initialization failed', 'error');
        setPageState('notconnected');
      }
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        showToast('Session expired. Reconnect wallet.', 'error');
        setPageState('notconnected');
      } else {
        showToast('Failed to load users: ' + (err.message ?? 'Unknown error'), 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let temp = [...users];
    if (search) temp = temp.filter((u) => u.address.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'all') temp = temp.filter((u) => u.role === roleFilter);
    setFilteredUsers(temp);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  async function confirmRoleChange() {
    try {
      setLoading(true);
      await updateUserRole(modal.address, modal.role);
      setUsers((prev) =>
        prev.map((u) => (u.address === modal.address ? { ...u, role: modal.role } : u))
      );
      setModal({ open: false, address: '', role: '' });
      showToast(`Role changed to ${modal.role.toUpperCase()} ✅`);
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Session expired. Please reconnect wallet.', 'error');
        setPageState('notconnected');
      } else {
        showToast(err.message || 'Failed to update role', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
    if (window.ethereum) {
      const handleChange = () => window.location.reload();
      window.ethereum.on('accountsChanged', handleChange);
      return () => window.ethereum.removeListener('accountsChanged', handleChange);
    }
  }, []);

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalDoctors = users.filter((u) => u.role === 'doctor').length;
  const totalPatients = users.filter((u) => u.role === 'patient').length;

  const indexOfLast = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - usersPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (pageState === 'loading') return <LoadingSpinner message="Verifying admin access…" color="purple" />;
  if (pageState === 'notconnected') return <NotConnected onConnect={requestAndInit} context="the Admin Panel" />;
  if (pageState === 'notadmin') return <WrongRole requiredRole="admin" userRole={userRole} address={currentAccount} />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-16 flex-1 min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">
        <ToastSingle toast={toast} />

        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              {currentAccount && (
                <span className="text-sm bg-white dark:bg-gray-800 dark:text-white px-3 py-1 rounded-full shadow font-mono">
                  {currentAccount.slice(0, 6)}…{currentAccount.slice(-4)}
                </span>
              )}
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-sm disabled:opacity-50"
              >
                {loading ? 'Loading…' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: users.length, style: 'from-gray-700 to-gray-800' },
              { label: 'Admins', value: totalAdmins, style: 'from-purple-500 to-purple-600' },
              { label: 'Doctors', value: totalDoctors, style: 'from-blue-500 to-blue-600' },
              { label: 'Patients', value: totalPatients, style: 'from-green-500 to-green-600' },
            ].map(({ label, value, style }) => (
              <div key={label} className={`bg-gradient-to-r ${style} text-white p-4 rounded-xl shadow`}>
                <p className="text-sm opacity-80">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* SEARCH */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              placeholder="Search by wallet address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-lg flex-1 min-w-[200px] bg-white dark:bg-gray-800 dark:text-white"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          {/* USER TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-semibold text-lg dark:text-white">User Management</h2>
              <p className="text-sm text-gray-500">
                Showing {currentUsers.length} of {filteredUsers.length}
              </p>
            </div>

            <div className="divide-y dark:divide-gray-700">
              {currentUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {loading ? 'Loading users…' : 'No users found'}
                </div>
              ) : (
                currentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm break-all dark:text-white">{u.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'doctor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => setModal({ open: true, address: u.address, role: 'admin' })}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition"
                        >
                          → Admin
                        </button>
                      )}
                      {u.role !== 'doctor' && (
                        <button
                          onClick={() => setModal({ open: true, address: u.address, role: 'doctor' })}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                        >
                          → Doctor
                        </button>
                      )}
                      {u.role !== 'patient' && (
                        <button
                          onClick={() => setModal({ open: true, address: u.address, role: 'patient' })}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                        >
                          → Patient
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded transition ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Confirm Role Change</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Change role for:</p>
            <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mb-4 break-all dark:text-white">
              {modal.address}
            </p>
            <p className="mb-6 dark:text-white">
              New role:{' '}
              <span
                className={`font-bold ${
                  modal.role === 'admin'
                    ? 'text-purple-600'
                    : modal.role === 'doctor'
                    ? 'text-blue-600'
                    : 'text-green-600'
                }`}
              >
                {modal.role.toUpperCase()}
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, address: '', role: '' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
