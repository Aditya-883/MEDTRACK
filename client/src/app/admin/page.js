'use client';

import { useEffect, useState, useRef } from 'react';
import { adminLogin, checkUserRole } from '../../lib/auth';

import AccessDenied from '../../components/ui/AccessDenied';
import Sidebar from '../../components/layout/Sidebar'; // ✅ ADDED

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
      <div className="animate-pulse text-lg font-semibold">
        Loading...
      </div>
    </div>
  );
}

/* ⚠️ ERROR UI */
function ErrorUI({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

export default function AdminPage() {
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
  const [error, setError] = useState(null);

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

      if (!address) return setAuthorized(false);

      const user = await checkUserRole(address);

      if (!user || user.role !== 'admin') return setAuthorized(false);

      const token = localStorage.getItem('token');
      if (!token) await adminLogin();

      setAuthorized(true);
      fetchUsers();

    } catch {
      setError("Initialization failed");
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);

      showToast("Users Loaded");

    } catch {
      setError("Failed to fetch users");
      showToast("Error loading users", "error");
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

      await fetch(`http://localhost:5000/api/users/${modal.address}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: modal.role }),
      });

      setUsers(prev =>
        prev.map(u =>
          u.address === modal.address ? { ...u, role: modal.role } : u
        )
      );

      setModal({ open: false, address: '', role: '' });

      showToast("Role Updated");

    } catch {
      setError("Failed to update role");
      showToast("Update failed", "error");
    }
  }

  // 📊 STATS
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;

  const chartData = [
    { name: 'Admins', value: totalAdmins },
    { name: 'Doctors', value: totalDoctors },
    { name: 'Patients', value: totalPatients },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

  const indexOfLast = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - usersPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (authorized === false) return <AccessDenied />;
  if (authorized === null) return null;

  return (
    <div className="flex">

      {/* ✅ SIDEBAR */}
      <Sidebar />

      {/* ✅ MAIN PAGE */}
      <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">

        <LoadingOverlay show={loading} />
        <Toast message={toast?.msg} show={!!toast} type={toast?.type} />
        <ErrorUI message={error} />

        <div className="flex-grow max-w-6xl mx-auto w-full">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin</h1>

            <button onClick={fetchUsers} className="bg-blue-500 text-white px-3 py-1 rounded">
              Refresh
            </button>
          </div>

          {/* SEARCH */}
          <div className="flex gap-3 mb-6">
            <input
              placeholder="Search address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border p-2 rounded"
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
            <div className="bg-purple-500 text-white p-4 rounded-xl">Admins: {totalAdmins}</div>
            <div className="bg-blue-500 text-white p-4 rounded-xl">Doctors: {totalDoctors}</div>
            <div className="bg-green-500 text-white p-4 rounded-xl">Patients: {totalPatients}</div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-6 mb-8">

            <div className="bg-white p-4 rounded-xl shadow">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" outerRadius={80}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* USERS */}
          <div className="space-y-4">
            {loading ? (
              <p>Loading users...</p>
            ) : currentUsers.map((u) => (
              <div key={u._id} className="bg-white p-4 rounded-xl shadow flex justify-between">
                <p className="font-mono text-sm">{u.address}</p>

                <div className="flex gap-2">
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'admin' })} className="bg-purple-500 text-white px-2 py-1 rounded">Admin</button>
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'doctor' })} className="bg-blue-500 text-white px-2 py-1 rounded">Doctor</button>
                  <button onClick={() => setModal({ open: true, address: u.address, role: 'patient' })} className="bg-green-500 text-white px-2 py-1 rounded">Patient</button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* FOOTER */}
        <footer className="bg-black text-white text-center py-4 mt-10 rounded-xl">
          © 2026 MedTrack • Secure Healthcare on Blockchain
        </footer>

      </div>
    </div>
  );
}