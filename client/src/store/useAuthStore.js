import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      set({ token });
    } catch (e) {
      console.error('Error saving token', e);
    }
  },

  loginUser: async (user, token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      set({ user, token, error: null });
    } catch (e) {
      console.error('Error in login', e);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      set({ user: null, token: null });
    } catch (e) {
      console.error('Error in logout', e);
    }
  },

  loadStorageData: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        set({ user: JSON.parse(userData), token });
      }
    } catch (e) {
      console.error('Error loading storage', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

export default useAuthStore;