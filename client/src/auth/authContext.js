"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ROLES } from "./roles";

const AuthContext = createContext(null);

const STORAGE_KEY = "medtrack_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: null,
  });

  // Load session (UI-only persistence)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Persist session
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const loginAsPatient = () =>
    setUser({ isAuthenticated: true, role: ROLES.PATIENT });

  const loginAsDoctor = () =>
    setUser({ isAuthenticated: true, role: ROLES.DOCTOR });

  const logout = () =>
    setUser({ isAuthenticated: false, role: null });

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsPatient,
        loginAsDoctor,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
