import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accounts: User[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchAccount: (email: string) => void;
  updateProfile: (name: string) => void;
  isAuthenticated: boolean;
  activeBotId: string | null;
  connectBot: (id: string) => void;
  disconnectBot: () => void;
  isLoading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("agri_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  const [accounts, setAccounts] = useState<User[]>([]);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("agri_token"));

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("agri_token", data.token);
      localStorage.setItem("agri_user", JSON.stringify(data.user));
    } catch (e: any) {
      toast.error(e.message || "Login failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("agri_token", data.token);
      localStorage.setItem("agri_user", JSON.stringify(data.user));
    } catch (e: any) {
      toast.error(e.message || "Signup failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("agri_user");
    localStorage.removeItem("agri_token");
    setActiveBotId(null);
  };

  const updateProfile = (name: string) => {
    // For now keep local, could add API later
    if (!user) return;
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem("agri_user", JSON.stringify(updated));
  };

  const switchAccount = (email: string) => {
    // Backend would need more logic for multi-account
  };

  const connectBot = (id: string) => {
    setActiveBotId(id);
  };

  const disconnectBot = () => {
    setActiveBotId(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accounts, 
      login, 
      logout, 
      switchAccount, 
      updateProfile, 
      isAuthenticated: !!user,
      activeBotId,
      connectBot,
      disconnectBot,
      isLoading,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
