import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState('profile');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Restore session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedSound = localStorage.getItem('soundEnabled');
    if (storedSound !== null) {
      setSoundEffectsEnabled(storedSound === 'true');
    }
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Web Audio chime synthesizer
  const playAlertChime = (toneType) => {
    if (!soundEffectsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (toneType === 'message') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        
        setTimeout(() => {
          try {
            const ctx2 = new AudioCtx();
            const osc2 = ctx2.createOscillator();
            const gain2 = ctx2.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx2.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1046.5, ctx2.currentTime);
            gain2.gain.setValueAtTime(0.15, ctx2.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.3);
            osc2.start(ctx2.currentTime);
            osc2.stop(ctx2.currentTime + 0.3);
          } catch (e) {}
        }, 120);
      } else if (toneType === 'notification') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (toneType === 'victory') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        
        setTimeout(() => {
          try {
            const ctxE = new AudioCtx();
            const oscE = ctxE.createOscillator();
            const gainE = ctxE.createGain();
            oscE.connect(gainE);
            gainE.connect(ctxE.destination);
            oscE.type = 'sawtooth';
            oscE.frequency.setValueAtTime(659.25, ctxE.currentTime);
            gainE.gain.setValueAtTime(0.1, ctxE.currentTime);
            gainE.gain.exponentialRampToValueAtTime(0.001, ctxE.currentTime + 0.5);
            oscE.start(ctxE.currentTime);
            oscE.stop(ctxE.currentTime + 0.5);
          } catch (e) {}
        }, 100);

        setTimeout(() => {
          try {
            const ctxG = new AudioCtx();
            const oscG = ctxG.createOscillator();
            const gainG = ctxG.createGain();
            oscG.connect(gainG);
            gainG.connect(ctxG.destination);
            oscG.type = 'sawtooth';
            oscG.frequency.setValueAtTime(783.99, ctxG.currentTime);
            gainG.gain.setValueAtTime(0.1, ctxG.currentTime);
            gainG.gain.exponentialRampToValueAtTime(0.001, ctxG.currentTime + 0.5);
            oscG.start(ctxG.currentTime);
            oscG.stop(ctxG.currentTime + 0.5);
          } catch (e) {}
        }, 200);
      }
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleToggleSound = (enabled) => {
    setSoundEffectsEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  // Socket Connections initialization
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('setup', user.id);

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('notification_received', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      showToast(notif.content, 'info');
      playAlertChime('notification');
    });

    newSocket.on('message_received', ({ roomId, message }) => {
      showToast(`New message from ${message.sender.username}`, 'info');
      playAlertChime('message');
    });

    newSocket.on('challenge_completed', ({ goalName, pointsEarned, totalPoints }) => {
      showToast(`🏆 Challenge Achieved: "${goalName}"! Earned +${pointsEarned} Spark points!`, 'success');
      playAlertChime('victory');
      
      setUser(prev => {
        const next = { ...prev, sparkPoints: totalPoints };
        localStorage.setItem('user', JSON.stringify(next));
        return next;
      });
    });

    newSocket.on('premium_status_updated', ({ isPremium }) => {
      showToast('🌟 Connectify Premium status has been activated successfully!', 'success');
      playAlertChime('victory');
      
      setUser(prev => {
        const next = { ...prev, isPremium };
        localStorage.setItem('user', JSON.stringify(next));
        return next;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const login = async (emailOrUsername, password) => {
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsAuthenticated(true);
        showToast(`Welcome back, ${res.data.user.username}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const signup = async (signupData) => {
    try {
      const res = await api.post('/auth/signup', signupData);
      if (res.data.success) {
        showToast('Registration successful! You may now sign in.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('feed');
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        activeTab,
        setActiveTab,
        activeSettingsSubTab,
        setActiveSettingsSubTab,
        soundEffectsEnabled,
        handleToggleSound,
        toasts,
        setToasts,
        showToast,
        playAlertChime,
        socket,
        onlineUsers,
        notifications,
        setNotifications,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
