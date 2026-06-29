import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth-store";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const store = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    store.fetchMe();
  }, []);

  const login = async (email, password) => {
    await store.login(email, password);
    navigate("/dashboard");
  };

  const register = async (username, email, password) => {
    await store.register(username, email, password);
    navigate("/dashboard");
  };

  const logout = async () => {
    await store.logout();
    navigate("/sign-in");
  };

  const loginWithGoogle = async (code) => {
    await store.loginWithGoogle(code);
    navigate("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user: store.user, loading: store.loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
