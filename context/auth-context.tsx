"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const AUTH_KEY = "reborn_auth";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isChecked: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: AuthUser, remember?: boolean) => void;
  logout: () => void;
  setAuth: (token: string, user: AuthUser, remember?: boolean) => void;
  getHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    isChecked: false,
  });

  const setAuth = useCallback((token: string, user: AuthUser, remember = true) => {
    const data = { token, user };
    if (typeof window !== "undefined") {
      if (remember) localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      else sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
    }
    setState({ token, user, isLoading: false, isChecked: true });
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    }
    setState({ token: null, user: null, isLoading: false, isChecked: true });
  }, []);

  const login = useCallback((token: string, user: AuthUser, remember = true) => {
    setAuth(token, user, remember);
  }, [setAuth]);

  const getHeaders = useCallback(() => {
    const token = state.token;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [state.token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    if (!raw) {
      setState((s) => ({ ...s, isLoading: false, isChecked: true }));
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (data?.token) {
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` },
          credentials: "same-origin",
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.user) {
              setState({
                token: data.token,
                user: res.user,
                isLoading: false,
                isChecked: true,
              });
            } else {
              localStorage.removeItem(AUTH_KEY);
              sessionStorage.removeItem(AUTH_KEY);
              setState({ token: null, user: null, isLoading: false, isChecked: true });
            }
          })
          .catch(() => {
            localStorage.removeItem(AUTH_KEY);
            sessionStorage.removeItem(AUTH_KEY);
            setState({ token: null, user: null, isLoading: false, isChecked: true });
          });
      } else {
        setState((s) => ({ ...s, isLoading: false, isChecked: true }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false, isChecked: true }));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setAuth,
        getHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
