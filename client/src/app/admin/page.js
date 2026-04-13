'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { adminLogin, checkUserRole } from '../../lib/auth';
import AccessDenied from '../../components/ui/AccessDenied';
import Sidebar from '../../components/layout/Sidebar';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function Toast({ message, show, type }) {
  if (!show) return null;
  return (
    <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg z-50 text-white
      ${type === "error" ? "bg-red-500" : "bg-black"}`}>
      {message}
    </div>
  );
}

function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="animate-pulse text-lg font-semibold text-gray-900 dark:text-white">
        Loading...
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [authorized, setAuthorized] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [modal, setModal] = useState({
    open: false,
    address: '',
    role: ''
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function init() {
    try {
      setLoading(true);

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      const address = accounts[0];
      setCurrentAccount(address);

      if (!address) {
        router.push('/unauthorized');
        return;
      }

      const user = await checkUserRole(address);

      if (!user || user.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) await adminLogin();

      setAuthorized(true);
      await fetchUsers();

    } catch (error) {
      console.error("Init error:", error);
      router.push('/unauthorized');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const res = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push('/unauthorized');
        return;
      }

      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);

      showToast("Users Loaded");

    } catch (error) {
      console.error("Fetch users error:", error);
      router.push('/unauthorized');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let temp = [...users];

    if (search) {
      temp = temp.filter(u =>
        u.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      temp = temp.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(temp);
    setCurrentPage(1);
  }

  async function confirmRoleChange() {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${BASE_URL}/users/${modal.address}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: modal.role }),
      });

      if (!res.ok) {
        router.push('/unauthorized');
        return;
      }

      setUsers(prev =>
        prev.map(u =>
          u.address === modal.address ? { ...u, role: modal.role } : u
        )
      );

      setFilteredUsers(prev =>
        prev.map(u =>
          u.address === modal.address ? { ...u, role: modal.role } : u
        )
      );

      setModal({ open: false, address: '', role: '' });
      showToast("Role Updated");

    } catch (error) {
      console.error("Role change error:", error);
      router.push('/unauthorized');
    }
  }

  const handleAccountsChanged = async (accounts) => {
    localStorage.removeItem('token');
    localStorage.removeItem('wallet');
    window.location.reload();
  };

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    let intervalId;

    if (window.ethereum) {
      intervalId = setInterval(async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const currentAddress = accounts[0];

        if (currentAddress && currentAccount && currentAddress !== currentAccount) {
          window.location.reload();
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentAccount]);

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;

  const indexOfLast = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - usersPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (authorized === null) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-16 flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">

        <LoadingOverlay show={loading} />
        <Toast message={toast?.msg} show={!!toast} type={toast?.type} />

        <div className="flex-grow max-w-6xl mx-auto w-full">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            {currentAccount && (
              <div className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow">
                {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="flex gap-3 mb-6">
            <input
              placeholder="Search address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-black dark:text-white"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>

            <button
              onClick={applyFilters}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
            >
              Apply Filters
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow">
              <p className="text-sm opacity-90">Total Admins</p>
              <p className="text-2xl font-bold">{totalAdmins}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow">
              <p className="text-sm opacity-90">Total Doctors</p>
              <p className="text-2xl font-bold">{totalDoctors}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow">
              <p className="text-sm opacity-90">Total Patients</p>
              <p className="text-2xl font-bold">{totalPatients}</p>
            </div>
          </div>

          {/* USERS LIST */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-semibold text-lg">User Management</h2>
              <p className="text-sm text-gray-500">Manage user roles and permissions</p>
            </div>

            <div className="divide-y dark:divide-gray-700">
              {currentUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                currentUsers.map((u) => (
                  <div key={u._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="font-mono text-sm break-all">{u.address}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ open: true, address: u.address, role: 'admin' })}
                        className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition"
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => setModal({ open: true, address: u.address, role: 'doctor' })}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                      >
                        Make Doctor
                      </button>
                      <button
                        onClick={() => setModal({ open: true, address: u.address, role: 'patient' })}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                      >
                        Make Patient
                      </button>
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
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded transition
                    ${currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300'}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Role Change Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Role Change</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to change the role of
            </p>
            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded mb-4 break-all">
              {modal.address}
            </p>
            <p className="mb-6">
              to <span className="font-bold text-blue-600">{modal.role.toUpperCase()}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, address: '', role: '' })}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
