"use client"
import { createContext, useState, useEffect, ReactNode } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import https from "https";

interface AuthContextType {
  token: string | null;
  writeAccess: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [writeAccess, setWriteAccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        checkWriteAccess(savedToken);
      }
    }
  }, []);

  const checkWriteAccess = (token: string) => {
    try {
      console.log(token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.realm_access?.roles || [];
      if (roles.includes("buch-admin")) {
        setWriteAccess(true);
      } else {
        setWriteAccess(false);
      }
    } catch (error) {
      console.error("Error decoding token or setting write access:", error);
      setWriteAccess(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser({ username, password });
      const { access_token } = response.data;
      setToken(access_token);
      console.log(response);


      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        console.log(access_token);
      }

      checkWriteAccess(access_token);
      return true;
    } catch (error) {
      console.error("Error beim setzen des Write Access oder beim decodieren des Tokens", error);
      return false;
    }
  };
  const loginUser = async ({ username, password }: { username: string, password: string }) => {
    const url = "https://localhost:3000/auth/token";
      const requestData = `username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(password)}`;
  
      const agent = new https.Agent({
        rejectUnauthorized: false,  // Deaktiviert die Zertifikatsprüfung (unsicher!)
      });
    

      try {
        // Konfiguration an axios übergeben
        const response = await axios.post(url, requestData, {
          httpsAgent: agent,  // Wichtig: httpsAgent hier übergeben
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",  // Falls notwendig
          },
        });
        if (response.status === 200) {
          return response;
        } else {
          throw new Error("Login failed");
        }
      } catch (error) {
      console.error("Login Request failed", error);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    setToken(null);
    setWriteAccess(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  };

  const isLoggedIn = () => {
    return token !== null && token !== "";
  };

  return (
    <AuthContext.Provider value={{ token, writeAccess, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
