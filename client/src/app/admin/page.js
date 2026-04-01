'use client';

import { useEffect, useState, useRef } from 'react';
import { adminLogin, checkUserRole } from '../../lib/auth';

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

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    init();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, roleFilter, users]);

  async function init() {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      const address = accounts[0];

      if (!address) {
        setAuthorized(false);
        return;
      }

      const user = await checkUserRole(address);

      if (!user || user.role !== 'admin') {
        setAuthorized(false);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        await adminLogin();
      }

      setAuthorized(true);
      fetchUsers();

    } catch (err) {
      console.error(err);
      setAuthorized(false);
    }
  }

  async function fetchUsers() {
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUsers(data);
  }

  // 🔍 FILTER + SEARCH
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

  // 📄 PAGINATION
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // 🎯 OPEN MODAL
  function openModal(address, role) {
    setModal({ open: true, address, role });
  }

  function closeModal() {
    setModal({ open: false, address: '', role: '' });
  }

  // 🚀 CHANGE ROLE
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

      closeModal();
      fetchUsers();

    } catch (err) {
      console.error(err);
      alert("❌ Failed to update role");
    }
  }

  function getRoleColor(role) {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'doctor') return 'bg-blue-100 text-blue-700';
    if (role === 'patient') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  }

  // 📊 ANALYTICS
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;

  // ❌ BLOCK UI
  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unauthorized Access
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (authorized === null) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">

        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* 📊 ANALYTICS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-100 p-3 rounded">Admins: {totalAdmins}</div>
          <div className="bg-blue-100 p-3 rounded">Doctors: {totalDoctors}</div>
          <div className="bg-green-100 p-3 rounded">Patients: {totalPatients}</div>
        </div>

        {/* 🔍 SEARCH + FILTER */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by address..."
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
        </div>

        {/* 👥 USER LIST */}
        <div className="space-y-4">
          {currentUsers.map((u) => (
            <div
              key={u._id}
              className="border p-4 rounded flex justify-between items-center bg-gray-50"
            >
              <div>
                <p className="font-mono text-sm">{u.address}</p>
                <span className={`px-2 py-1 text-xs rounded ${getRoleColor(u.role)}`}>
                  {u.role.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openModal(u.address, 'admin')} className="bg-purple-500 text-white px-3 py-1 rounded text-sm">Admin</button>
                <button onClick={() => openModal(u.address, 'doctor')} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Doctor</button>
                <button onClick={() => openModal(u.address, 'patient')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Patient</button>
              </div>
            </div>
          ))}
        </div>

        {/* 📄 PAGINATION */}
        <div className="flex justify-center mt-6 gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-black text-white' : 'bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

      </div>

      {/* 🧠 MODAL */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-80 text-center">
            <h3 className="text-lg font-semibold mb-3">Confirm Role Change</h3>
            <p className="text-sm mb-4">
              Change role to <b>{modal.role}</b>?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={confirmRoleChange}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Confirm
              </button>

              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}