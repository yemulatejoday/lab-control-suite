import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { API_URL } from "@/config";

interface User {
  email: string;
  name: string;
}

type StoredAccount = User & { token: string };

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

const ACCOUNTS_KEY = "agri_accounts";

const loadStoredAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse accounts from localStorage", e);
    return [];
  }
};

const saveStoredAccounts = (accounts: StoredAccount[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const upsertAccount = (accounts: StoredAccount[], next: StoredAccount) => {
  const filtered = accounts.filter((acc) => acc.email !== next.email);
  return [next, ...filtered];
};

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

  const [accounts, setAccounts] = useState<StoredAccount[]>(() => loadStoredAccounts());
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("agri_token"));

  useEffect(() => {
    if (!user || !token) return;
    setAccounts((prev) => {
      const existing = prev.find((acc) => acc.email === user.email);
      const next: StoredAccount = { email: user.email, name: user.name, token };
      if (existing && existing.name === next.name && existing.token === next.token) {
        return prev;
      }
      const updated = upsertAccount(prev, next);
      saveStoredAccounts(updated);
      return updated;
    });
  }, [user, token]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Account does not exist");
        }
        const invalidCreds = res.status === 401;
        throw new Error(invalidCreds ? "Invalid email or password" : (data.error || "Login failed"));
      }
      if (data.error) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("agri_token", data.token);
      localStorage.setItem("agri_user", JSON.stringify(data.user));
      setAccounts((prev) => {
        const updated = upsertAccount(prev, { ...data.user, token: data.token });
        saveStoredAccounts(updated);
        return updated;
      });
    } catch (e: any) {
      const msg = e?.message || "Login failed";
      const isNetwork = /Failed to fetch|NetworkError/i.test(msg);
      toast.error(isNetwork ? "Unable to reach server. Is the API running?" : msg);
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
      setAccounts((prev) => {
        const updated = upsertAccount(prev, { ...data.user, token: data.token });
        saveStoredAccounts(updated);
        return updated;
      });
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
    const account = accounts.find((acc) => acc.email === email);
    if (!account) {
      toast.error("Account not found");
      return;
    }
    setUser({ email: account.email, name: account.name });
    setToken(account.token);
    localStorage.setItem("agri_user", JSON.stringify({ email: account.email, name: account.name }));
    localStorage.setItem("agri_token", account.token);
    setActiveBotId(null);
    toast.success(`Switched to ${account.name}`);
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
      accounts: accounts.map(({ email, name }) => ({ email, name })), 
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
