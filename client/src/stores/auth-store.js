import { create } from "zustand";
import { apiFetch } from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed.");
    set({ user: data.user, loading: false });
    return data.user;
  },

  register: async (username, email, password) => {
    set({ loading: true });
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed.");
    set({ user: data.user, loading: false });
    return data.user;
  },

  loginWithGoogle: async (code) => {
    set({ loading: true });
    const res = await apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({
        code,
        redirectUri: `${window.location.origin}/auth/google/callback`,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      set({ loading: false });
      throw new Error(data.error || "Google authentication failed.");
    }
    set({ user: data.user, loading: false });
    return data.user;
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    set({ user: null, loading: false });
  },
}));

export default useAuthStore;
