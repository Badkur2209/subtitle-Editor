//AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_BASE_URL } from "../utils/config.ts";
//// Change back to:
//'https://api.ayushcms.info/api/auth/login'
//'https://api.ayushcms.info/api/auth/verify'

export interface User {
  id: number;
  name: string;
  username: string;
  role:
    | "admin"
    | "editor"
    | "translator"
    | "reviewer"
    | "assigner"
    | "uploader";
  lang_pairs: string[];
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string): Promise<void> => {
    try {
      const response = await fetch(
        // "https://api.ayushcms.info/api/auth/verify",
        // "http://localhost:5000/api/auth/verify",
        `${API_BASE_URL}/auth/verify`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔐 Logging in with", username, password);
      // const response = await fetch("https://api.ayushcms.info/api/auth/login", {
      // const response = await fetch("http://localhost:5000/api/auth/login", {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("🌐 Response status:", response.status);

      const data = await response.json();
      console.log("✅ Received data:", data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
