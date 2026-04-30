import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accounts: User[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  switchAccount: (email: string) => void;
  updateProfile: (name: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("agri_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [accounts, setAccounts] = useState<User[]>(() => {
    const saved = localStorage.getItem("agri_accounts");
    return saved ? JSON.parse(saved) : [];
  });

  const login = (email: string, name?: string) => {
    const newUser = { email, name: name || email.split("@")[0] };
    setUser(newUser);
    
    setAccounts(prev => {
      const exists = prev.find(a => a.email === email);
      if (exists) {
        // Update name if provided during signup/login again
        return prev.map(a => a.email === email ? { ...a, name: name || a.name } : a);
      }
      const next = [...prev, newUser];
      localStorage.setItem("agri_accounts", JSON.stringify(next));
      return next;
    });
    
    localStorage.setItem("agri_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem("agri_user");
    localStorage.removeItem("agri_accounts");
  };

  const updateProfile = (name: string) => {
    if (!user) return;
    const updated = { ...user, name };
    setUser(updated);
    setAccounts(prev => {
      const next = prev.map(a => a.email === user.email ? updated : a);
      localStorage.setItem("agri_accounts", JSON.stringify(next));
      return next;
    });
    localStorage.setItem("agri_user", JSON.stringify(updated));
  };

  const switchAccount = (email: string) => {
    const target = accounts.find(a => a.email === email);
    if (target) {
      setUser(target);
      localStorage.setItem("agri_user", JSON.stringify(target));
    }
  };

  return (
    <AuthContext.Provider value={{ user, accounts, login, logout, switchAccount, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
