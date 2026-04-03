'use client';

import { useEffect, useState, useRef } from 'react';
import { adminLogin, checkUserRole } from '../../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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

      if (!address) return setAuthorized(false);

      const user = await checkUserRole(address);

      if (!user || user.role !== 'admin') return setAuthorized(false);

      const token = localStorage.getItem('token');
      if (!token) await adminLogin();

      setAuthorized(true);
      fetchUsers();

    } catch {
      setAuthorized(false);
    }
  }

  async function fetchUsers() {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data);

    } catch {
      console.log("Error fetching users");
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

      // 🔥 instant update → charts auto update
      setUsers(prev =>
        prev.map(u =>
          u.address === modal.address ? { ...u, role: modal.role } : u
        )
      );

      setModal({ open: false, address: '', role: '' });

    } catch {
      alert("Failed");
    }
  }

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;

  // 📊 CHART DATA (AUTO UPDATES)
  const chartData = [
    { name: 'Admins', value: totalAdmins },
    { name: 'Doctors', value: totalDoctors },
    { name: 'Patients', value: totalPatients },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

  const indexOfLast = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfLast - usersPerPage, indexOfLast);

  if (authorized === false) {
    return <div className="text-center p-10">Unauthorized</div>;
  }

  if (authorized === null) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-black p-6">

      <div className="flex-grow max-w-6xl mx-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Admin Dashboard
        </h1>

        {/* 📊 ANALYTICS CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-500 text-white p-4 rounded-xl">Admins: {totalAdmins}</div>
          <div className="bg-blue-500 text-white p-4 rounded-xl">Doctors: {totalDoctors}</div>
          <div className="bg-green-500 text-white p-4 rounded-xl">Patients: {totalPatients}</div>
        </div>

        {/* 📈 CHARTS */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* BAR CHART */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="mb-3 font-semibold dark:text-white">User Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="mb-3 font-semibold dark:text-white">Role Ratio</h2>
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
          {currentUsers.map((u) => (
            <div key={u._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between">
              <p className="font-mono text-sm dark:text-white">{u.address}</p>

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
      <footer className="bg-gray-900 text-white text-center py-3 mt-6">
        © 2026 MedTrack • Blockchain Healthcare
      </footer>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="mb-4">Change role to {modal.role}?</p>
            <button onClick={confirmRoleChange} className="bg-green-500 text-white px-3 py-1 mr-2">Confirm</button>
            <button onClick={() => setModal({ open: false })} className="bg-gray-300 px-3 py-1">Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}