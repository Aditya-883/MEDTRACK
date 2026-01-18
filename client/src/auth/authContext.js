"use client";

import { createContext, useContext, useState } from "react";
import { ROLES } from "./roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: null,
  });

  const loginAsPatient = () =>
    setUser({ isAuthenticated: true, role: ROLES.PATIENT });

  const loginAsDoctor = () =>
    setUser({ isAuthenticated: true, role: ROLES.DOCTOR });

  const loginAsAdmin = () =>
    setUser({ isAuthenticated: true, role: ROLES.ADMIN });

  const logout = () =>
    setUser({ isAuthenticated: false, role: null });

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsPatient,
        loginAsDoctor,
        loginAsAdmin,
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
