import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'shareserver_auth_username';

export function useAuth() {
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_KEY);
  });

  const isAuthenticated = !!username;

  const login = useCallback((user: string) => {
    localStorage.setItem(AUTH_KEY, user);
    setUsername(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUsername(null);
  }, []);

  return { username, isAuthenticated, login, logout };
}
