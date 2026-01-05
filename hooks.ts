
import { useState, useEffect, useRef } from 'react';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { Habit, Log, LangCode, SyncStatus } from './types';
import { TRANSLATIONS } from './translations';

// --- CONFIG SEPARATED FOR EASY EDITING ---
export const APP_PASSWORD = "081234";
// -----------------------------------------

const IS_DEV = false; 
const DEFAULT_LANG = 'id';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCMaWAKPvsEa9jCyACv0OX9dpmawDKn70M",
  authDomain: "habitsflow.web.app",
  projectId: "aqwamproject",
  storageBucket: "aqwamproject.firebasestorage.app",
  messagingSenderId: "565860011978",
  appId: "1:565860011978:web:348d65e515e3903b6d4933",
  measurementId: "G-5M67BM66CL"
};

const getFirebaseConfig = () => {
  const cfg = (window as any).__firebase_config;
  if (typeof cfg === 'string') {
    try { return JSON.parse(cfg); } catch (e) { return FIREBASE_CONFIG; }
  }
  return cfg || FIREBASE_CONFIG;
};

const getAppId = () => {
  const id = (window as any).__app_id;
  if (typeof id === 'string' && id.trim().length > 0) return id;
  return "habitflow-default";
};

const app = !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const getTodayDate = () => new Date().toISOString().split('T')[0];
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('habitflow_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('habitflow_theme', theme);
  }, [theme]);

  const toggleTheme = (mode?: 'light' | 'dark') => {
    if (mode) setTheme(mode);
    else setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

export const useLanguage = () => {
  const [lang, setLang] = useState<LangCode>(() => {
    const saved = localStorage.getItem('habitflow_lang');
    return (saved as LangCode) || DEFAULT_LANG;
  });
  const t = (key: string) => TRANSLATIONS[lang][key] || key;
  const toggleLang = (newLang: LangCode) => {
    setLang(newLang);
    localStorage.setItem('habitflow_lang', newLang);
  };
  return { lang, t, toggleLang };
};

export const useAuthSession = () => {
  const [user, setUser] = useState<User | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [ipAddress, setIpAddress] = useState<string>('Detecting...');
  const appId = getAppId();

  useEffect(() => {
    // Fetch IP Address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('127.0.0.1'));

    if (IS_DEV) {
      setUser({ 
        uid: 'dev-user-123', 
        displayName: 'Dev User', 
        photoURL: null, 
        email: 'dev@local.storage' 
      });
      const savedAuth = localStorage.getItem('habitflow_authorized_dev');
      setIsAuthorized(savedAuth === 'true');
      setLoading(false);
      return;
    }

    // Handle Redirect Result for Redirect Login
    getRedirectResult(auth).catch((error) => {
      console.error("Auth redirect error:", error);
      setAuthError(error.message);
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Check authorization in Firestore
        const docRef = doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'security');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().authorized === true) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      }
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appId]);

  const loginGoogle = async () => {
    if (IS_DEV) return;
    try {
      const provider = new GoogleAuthProvider();
      // Menggunakan Redirect agar lebih stabil di iOS/Browser Seluler
      await signInWithRedirect(auth, provider);
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const setAuthorized = async () => {
    if (IS_DEV) {
      setIsAuthorized(true);
      localStorage.setItem('habitflow_authorized_dev', 'true');
      return;
    }
    if (user) {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'security');
      await setDoc(docRef, { authorized: true, updated_at: new Date().toISOString(), last_ip: ipAddress });
      setIsAuthorized(true);
    }
  };

  const logout = () => {
    if (IS_DEV) {
      setUser(null);
      setIsAuthorized(false);
      localStorage.removeItem('habitflow_authorized_dev');
      return;
    }
    signOut(auth);
  };

  return { user, loading, loginGoogle, logout, authError, isAuthorized, setAuthorized, ipAddress };
};

export const useDataManager = (userId: string | undefined) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const appId = getAppId();
  
  const unsubHabits = useRef<(() => void) | null>(null);
  const unsubLogs = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    if (IS_DEV) {
      const h = localStorage.getItem(`habits_${userId}`);
      const l = localStorage.getItem(`logs_${userId}`);
      setHabits(h ? JSON.parse(h) : []);
      setLogs(l ? JSON.parse(l) : []);
      setSyncStatus('local');
      setLoading(false);
      return;
    }

    setLoading(true);
    setSyncStatus('syncing');

    const habitsPath = `artifacts/${appId}/users/${userId}/habits`;
    const logsPath = `artifacts/${appId}/users/${userId}/logs`;

    if (unsubHabits.current) unsubHabits.current();
    if (unsubLogs.current) unsubLogs.current();

    unsubHabits.current = onSnapshot(collection(db, habitsPath), (s) => {
      setHabits(s.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
      setSyncStatus('synced');
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Habits):", err.message);
      setSyncStatus('error');
      setLoading(false);
    });

    unsubLogs.current = onSnapshot(collection(db, logsPath), (s) => {
      setLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as Log)));
    }, (err) => {
      console.error("Firestore Error (Logs):", err.message);
      setSyncStatus('error');
    });

    return () => {
      if (unsubHabits.current) unsubHabits.current();
      if (unsubLogs.current) unsubLogs.current();
    };
  }, [userId, appId]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const nh: Habit = { ...habit, id: generateId(), createdAt: new Date().toISOString() };
    if (IS_DEV) {
      const updated = [...habits, nh];
      setHabits(updated);
      localStorage.setItem(`habits_${userId}`, JSON.stringify(updated));
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'habits', nh.id), nh);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!userId) return;
    if (IS_DEV) {
      const filtered = habits.filter(h => h.id !== id);
      setHabits(filtered);
      localStorage.setItem(`habits_${userId}`, JSON.stringify(filtered));
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'habits', id));
    }
  };

  const toggleLog = async (habitId: string, date: string) => {
    if (!userId) return;
    const existing = logs.find(l => l.habitId === habitId && l.date === date);
    if (existing) {
      if (IS_DEV) {
        const updated = logs.filter(l => l.id !== existing.id);
        setLogs(updated);
        localStorage.setItem(`logs_${userId}`, JSON.stringify(updated));
      } else {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'logs', existing.id));
      }
    } else {
      const nl: Log = { id: generateId(), habitId, date, timestamp: new Date().toISOString() };
      if (IS_DEV) {
        const updated = [...logs, nl];
        setLogs(updated);
        localStorage.setItem(`logs_${userId}`, JSON.stringify(updated));
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'logs', nl.id), nl);
      }
    }
  };

  const addCustomLog = async (habitId: string, date: string, time: string) => {
    if (!userId) return;
    const existing = logs.find(l => l.habitId === habitId && l.date === date);
    const timestamp = new Date(`${date}T${time}`).toISOString();
    
    if (existing) {
      const updatedLog = { ...existing, timestamp };
      if (IS_DEV) {
        const updated = logs.map(l => l.id === existing.id ? updatedLog : l);
        setLogs(updated);
        localStorage.setItem(`logs_${userId}`, JSON.stringify(updated));
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'logs', existing.id), updatedLog);
      }
    } else {
      const nl: Log = { id: generateId(), habitId, date, timestamp };
      if (IS_DEV) {
        const updated = [...logs, nl];
        setLogs(updated);
        localStorage.setItem(`logs_${userId}`, JSON.stringify(updated));
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'logs', nl.id), nl);
      }
    }
  };

  return { habits, logs, loading, syncStatus, addHabit, deleteHabit, toggleLog, addCustomLog };
};

export const useNotifications = (habits: Habit[], logs: Log[], t: any) => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [toasts, setToasts] = useState<{ id: string, msg: string }[]>([]);

  const requestPermission = async () => {
    const res = await Notification.requestPermission();
    setPermission(res);
    return res;
  };

  const playSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playCycle = (startTime: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, startTime);
        osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.5);
        osc.frequency.exponentialRampToValueAtTime(440, startTime + 1.0);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, startTime + 1.0);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 1.0);
      };

      const now = audioCtx.currentTime;
      playCycle(now);
      playCycle(now + 1.1); // Play twice
    } catch (e) {
      console.warn("Audio Context failed to start (interaction required):", e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const current = now.toTimeString().slice(0, 5);
      const today = getTodayDate();
      habits.forEach(h => {
        if (h.reminderTime === current && !logs.some(l => l.habitId === h.id && l.date === today)) {
          const msg = `${t('itIsTime')} ${h.name}`;
          const id = generateId();
          playSiren();
          setToasts(p => [...p, { id, msg }]);
          setTimeout(() => setToasts(p => p.filter(toast => toast.id !== id)), 5000);
          if (permission === 'granted') {
            new Notification(t('reminder'), { 
              body: msg,
              icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='22 12 18 12 15 21 9 3 6 12 2 12'%3E%3C/polyline%3E%3C/svg%3E"
            });
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [habits, logs, permission, t]);

  return { permission, requestPermission, toasts };
};
