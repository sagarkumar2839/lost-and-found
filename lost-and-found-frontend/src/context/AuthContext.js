import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../api/mockService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const login = useCallback(async (credentials) => {
    const { user } = await authService.login(credentials);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (details) => {
    const { user } = await authService.register(details);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
