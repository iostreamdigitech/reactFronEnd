import { useState } from "react";
import { api } from "../hooks/api.js"

export function UserAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("ra_token"));

  const login = async (username, password) => {
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem("ra_token", token);
      setToken(token);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Invalid credentials" };
    }
  };

  const logout = () => {
    localStorage.removeItem("ra_token");
    setToken(null);
  };

  return { token, login, logout };
}
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
export const logout = () => {
  localStorage.removeItem('token');
};

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}