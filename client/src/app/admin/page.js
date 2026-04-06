'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { adminLogin, checkUserRole } from '../../lib/auth';

import AccessDenied from '../../components/ui/AccessDenied';
import Sidebar from '../../components/layout/Sidebar'; 

/* 🔔 TOAST */
function Toast({ message, show, type }) {
  if (!show) return null;

  return (
    <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg z-50 text-white
      ${type === "error" ? "bg-red-500" : "bg-black"}`}>
      {message}
    </div>
  );
}

/* ⏳ LOADING */
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

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', init);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', init);
      }
    };
  }, []);

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
      fetchUsers();

    } catch {
      router.push('/unauthorized');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/users', {
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

    } catch {
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

      const res = await fetch(`http://localhost:5000/api/users/${modal.address}/role`, {
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

      setModal({ open: false, address: '', role: '' });

      showToast("Role Updated");

    } catch {
      router.push('/unauthorized');
    }
  }

  /* 📊 STATS */
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;

  /* 📄 PAGINATION */
  const indexOfLast = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - usersPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (authorized === null) return null;

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">

        <LoadingOverlay show={loading} />
        <Toast message={toast?.msg} show={!!toast} type={toast?.type} />

        <div className="flex-grow max-w-6xl mx-auto w-full">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin
            </h1>
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
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>

            <button onClick={applyFilters} className="bg-indigo-500 text-white px-4 py-2 rounded">
              Apply
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-500 text-white p-4 rounded-xl text-center font-semibold">
              Admins: {totalAdmins}
            </div>
            <div className="bg-blue-500 text-white p-4 rounded-xl text-center font-semibold">
              Doctors: {totalDoctors}
            </div>
            <div className="bg-green-500 text-white p-4 rounded-xl text-center font-semibold">
              Patients: {totalPatients}
            </div>
          </div>

          {/* USERS */}
          <div className="space-y-4">
            {currentUsers.map((u) => (
              <div key={u._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between text-black dark:text-white">
                <p className="font-mono text-sm">{u.address}</p>

                <div className="flex gap-2">
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'admin' })} className="bg-purple-500 text-white px-2 py-1 rounded">Admin</button>
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'doctor' })} className="bg-blue-500 text-white px-2 py-1 rounded">Doctor</button>
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'patient' })} className="bg-green-500 text-white px-2 py-1 rounded">Patient</button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center flex-wrap gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded 
                  ${currentPage === page 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}
              >
                {page}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}