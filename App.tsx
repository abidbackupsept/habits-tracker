
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Plus, 
  Check, 
  X, 
  Clock, 
  LogOut, 
  Trash2, 
  Edit2,
  Calendar,
  AlertCircle,
  Activity,
  Heart,
  BookOpen,
  Coffee,
  Dumbbell,
  Droplets,
  Moon,
  Sun,
  Briefcase,
  Smile,
  Star,
  Zap,
  Apple,
  Brain,
  Timer,
  CheckCircle2,
  ArrowRight,
  Bell,
  Flame,
  Cloud,
  CloudOff,
  Database,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  Trophy,
  AlertTriangle,
  Layers,
  Sparkles,
  Shield,
  Lock,
  Wifi,
  Key
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useLanguage, useAuthSession, useDataManager, useNotifications, useTheme, APP_PASSWORD } from './hooks';
import { Modal, Toast, NavItem } from './components';
import { Habit, Log, SyncStatus } from './types';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const ICON_MAP: Record<string, any> = {
  Activity, Heart, BookOpen, Coffee, Dumbbell, Droplets, Moon, Sun, 
  Briefcase, Smile, Star, Zap, Apple, Brain, Timer, CheckCircle2
};

const ICON_LIST = Object.keys(ICON_MAP);

const SyncIndicator = ({ status, t }: { status: SyncStatus, t: any }) => {
  const config = {
    syncing: { color: 'text-amber-500', bg: 'bg-amber-500', icon: Cloud, label: 'sync_syncing' },
    synced: { color: 'text-green-500', bg: 'bg-green-500', icon: Cloud, label: 'sync_synced' },
    local: { color: 'text-blue-500', bg: 'bg-blue-500', icon: Database, label: 'sync_local' },
    error: { color: 'text-red-500', bg: 'bg-red-500', icon: CloudOff, label: 'sync_error' },
    conflict: { color: 'text-orange-500', bg: 'bg-orange-500', icon: AlertCircle, label: 'sync_conflict' },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-all duration-300`}>
      <div className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bg} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.bg}`}></span>
      </div>
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 dark:text-zinc-400">
        {t(config.label)}
      </span>
    </div>
  );
};

// --- SECURITY GATE COMPONENT ---
const SecurityGate = ({ t, onVerify, ip, logout }: { t: any, onVerify: () => void, ip: string, logout: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = () => {
    if (password === APP_PASSWORD) {
      onVerify();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-24 h-24 bg-zinc-900 dark:bg-zinc-100 rounded-[32px] flex items-center justify-center shadow-xl">
              <Shield className="w-12 h-12 text-white dark:text-zinc-900" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter mb-4">{t('securityTitle')}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-10 px-4">
            {t('securityDesc')}
          </p>

          <div className="w-full space-y-6">
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500 ${error ? 'from-red-500 to-orange-500 opacity-75' : ''}`}></div>
              <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-1 border border-zinc-100 dark:border-zinc-700">
                <div className="pl-4 pr-2 text-zinc-400">
                  <Key className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  autoFocus
                  maxLength={6}
                  placeholder={t('passwordPlaceholder')}
                  className="flex-1 bg-transparent py-4 font-black tracking-[0.5em] text-xl outline-none placeholder:text-zinc-300 placeholder:tracking-normal placeholder:font-bold"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest animate-bounce">{t('wrongPassword')}</p>}

            <button 
              onClick={handleVerify}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-[28px] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Lock className="w-5 h-5" />
              {t('verify')}
            </button>
            
            <button 
              onClick={logout}
              className="text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {t('signOut')}
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('trustedDevice')}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-green-500">{t('secureSession')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700">
            <Wifi className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter leading-none mb-1">{t('ipLabel')}</p>
              <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 tracking-tight">{ip}</p>
            </div>
            <div className="flex items-center gap-1.5 text-blue-500">
               <span className="text-[9px] font-black uppercase">{t('identityVerified')}</span>
               <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { lang, t, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, loginGoogle, logout, authError, isAuthorized, setAuthorized, ipAddress } = useAuthSession();
  const { habits, logs, addHabit, deleteHabit, toggleLog, addCustomLog, syncStatus, loading: dataLoading } = useDataManager(user?.uid);
  const { permission, requestPermission, toasts } = useNotifications(habits, logs, t);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'settings'>('dashboard');
  const [dashboardView, setDashboardView] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarFilter, setCalendarFilter] = useState<string | 'all'>('all');
  
  // Stats Date Control
  const [statsDate, setStatsDate] = useState(new Date());

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [isRetroModalOpen, setIsRetroModalOpen] = useState(false);
  
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6');
  const [newHabitTime, setNewHabitTime] = useState('08:00');
  const [newHabitIcon, setNewHabitIcon] = useState('Activity');

  const [selectedHabitForRetro, setSelectedHabitForRetro] = useState<Habit | null>(null);
  const [retroDate, setRetroDate] = useState(getTodayDate());
  const [retroTime, setRetroTime] = useState(getCurrentTime());

  const calculateStreak = (habitId: string) => {
    const today = getTodayDate();
    const sortedLogs = logs
      .filter(l => l.habitId === habitId)
      .map(l => l.date)
      .sort((a, b) => b.localeCompare(a));

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();
    
    const isTodayDone = sortedLogs.includes(today);
    if (!isTodayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterday = checkDate.toISOString().split('T')[0];
      if (!sortedLogs.includes(yesterday)) return 0;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedLogs.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const handleOpenHabitModal = (habit?: Habit) => {
    if (habit) {
      setEditingHabitId(habit.id);
      setNewHabitName(habit.name);
      setNewHabitColor(habit.color);
      setNewHabitTime(habit.reminderTime || '08:00');
      setNewHabitIcon(habit.icon || 'Activity');
    } else {
      setEditingHabitId(null);
      setNewHabitName('');
      setNewHabitColor('#3b82f6');
      setNewHabitTime('08:00');
      setNewHabitIcon('Activity');
    }
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = () => {
    if (!newHabitName.trim()) return;
    if (editingHabitId) deleteHabit(editingHabitId);
    addHabit({ name: newHabitName, color: newHabitColor, reminderTime: newHabitTime || null, icon: newHabitIcon });
    setIsHabitModalOpen(false);
  };

  const handleConfirmDelete = (habit: Habit) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  const handleFinalDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
    }
  };

  const handleOpenRetro = (habit: Habit, specificDate?: string) => {
    const targetDate = specificDate || getTodayDate();
    const existingLog = logs.find(l => l.habitId === habit.id && l.date === targetDate);
    setSelectedHabitForRetro(habit);
    setRetroDate(targetDate);
    const formattedTime = existingLog 
      ? new Date(existingLog.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
      : getCurrentTime();
    setRetroTime(formattedTime);
    setIsRetroModalOpen(true);
  };

  const handleRetroSave = () => {
    if (!selectedHabitForRetro) return;
    addCustomLog(selectedHabitForRetro.id, retroDate, retroTime);
    setIsRetroModalOpen(false);
    setSelectedHabitForRetro(null);
  };

  const handleToggleHabit = (habitId: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], disableForReducedMotion: true });
    }
    toggleLog(habitId, getTodayDate());
  };

  const statsSummary = useMemo(() => {
    const todayStr = getTodayDate();
    let maxCurrentStreak = 0;
    habits.forEach(habit => {
      const streak = calculateStreak(habit.id);
      if (streak > maxCurrentStreak) maxCurrentStreak = streak;
    });
    const todayCompleted = logs.filter(l => l.date === todayStr).length;
    return {
      totalMonth: logs.filter(l => l.date.startsWith(todayStr.slice(0, 7))).length,
      rate: habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0,
      todayCompleted,
      count: habits.length,
      maxStreak: maxCurrentStreak
    };
  }, [logs, habits]);

  const weeklyChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        name: d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }),
        count: logs.filter(l => l.date === dateStr).length,
        fullDate: dateStr
      });
    }
    return data;
  }, [logs, lang]);

  const monthlyChartData = useMemo(() => {
    const year = statsDate.getFullYear();
    const month = statsDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      data.push({
        day: i,
        count: logs.filter(l => l.date === dateStr).length,
        fullDate: dateStr
      });
    }
    return data;
  }, [logs, statsDate]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [calendarDate]);

  const changeMonth = (offset: number) => {
    const next = new Date(calendarDate);
    next.setMonth(next.getMonth() + offset);
    setCalendarDate(next);
  };

  const changeStatsMonth = (offset: number) => {
    const next = new Date(statsDate);
    next.setMonth(next.getMonth() + offset);
    setStatsDate(next);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8">
        <Activity className="w-16 h-16 text-zinc-900 dark:text-zinc-100 animate-pulse" />
        <p className="mt-8 text-zinc-500 dark:text-zinc-400 font-bold tracking-tight animate-bounce">{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <Activity className="w-20 h-20 text-zinc-900 dark:text-zinc-100 mb-6" />
        <h1 className="text-4xl font-black tracking-tighter mb-4">HabitFlow</h1>
        <button onClick={loginGoogle} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 px-8 rounded-3xl font-black shadow-xl">{t('signInGoogle')}</button>
      </div>
    );
  }

  // --- SHOW SECURITY GATE IF NOT AUTHORIZED ---
  if (!isAuthorized) {
    return (
      <SecurityGate 
        t={t} 
        ip={ipAddress} 
        onVerify={() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setAuthorized();
        }} 
        logout={logout}
      />
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-xl border border-zinc-700 shadow-xl text-xs font-black uppercase tracking-tighter">
          <p className="mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-blue-400">{payload[0].value} {t('completions')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-300">
      <Toast messages={toasts} />
      
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-8 px-2">
          <Activity className="w-10 h-10 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl" />
          <h1 className="text-2xl font-black tracking-tighter">HabitFlow</h1>
        </div>
        <div className="mb-8 px-2"><SyncIndicator status={syncStatus} t={t} /></div>
        <nav className="flex-1 space-y-3">
          <NavItem id="dashboard" icon={LayoutDashboard} label={t('dashboard')} activeTab={activeTab} onClick={setActiveTab} />
          <NavItem id="stats" icon={BarChart3} label={t('stats')} activeTab={activeTab} onClick={setActiveTab} />
          <NavItem id="settings" icon={Settings} label={t('settings')} activeTab={activeTab} onClick={setActiveTab} />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-3 rounded-2xl text-sm font-bold transition-colors">
          <LogOut className="w-4 h-4" />{t('signOut')}
        </button>
      </aside>

      <main className="flex-1 pb-32 md:pb-12 max-w-6xl mx-auto w-full px-6 md:px-12 pt-10">
        <header className="md:hidden flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl" />
            <h1 className="text-2xl font-black tracking-tighter">HabitFlow</h1>
          </div>
          <div className="scale-75"><SyncIndicator status={syncStatus} t={t} /></div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1">{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <h2 className="text-4xl font-black tracking-tight">{t('today')}</h2>
              </div>
              <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm self-end">
                <button onClick={() => setDashboardView('list')} className={`p-2 rounded-xl transition-all ${dashboardView === 'list' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}><ListIcon className="w-5 h-5" /></button>
                <button onClick={() => setDashboardView('calendar')} className={`p-2 rounded-xl transition-all ${dashboardView === 'calendar' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}><Calendar className="w-5 h-5" /></button>
              </div>
            </div>
            
            {dashboardView === 'list' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {habits.length === 0 && !dataLoading && (
                  <div className="flex flex-col items-center justify-center py-24 px-8 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-100 dark:border-zinc-800 shadow-sm text-center col-span-full animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                      <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black mb-3 tracking-tight">{t('noHabitsTitle')}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-10 font-medium leading-relaxed">
                      {t('noHabitsDesc')}
                    </p>
                    <button 
                      onClick={() => handleOpenHabitModal()}
                      className="group bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-10 py-5 rounded-[28px] font-black text-lg flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                      {t('addHabit')}
                    </button>
                  </div>
                )}
                {habits.map(h => {
                  const dayLog = logs.find(l => l.habitId === h.id && l.date === getTodayDate());
                  const done = !!dayLog;
                  const HabitIcon = ICON_MAP[h.icon || 'Activity'] || Activity;
                  const actualTime = dayLog ? new Date(dayLog.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null;
                  const currentStreak = calculateStreak(h.id);
                  return (
                    <div key={h.id} className={`p-6 rounded-[32px] border transition-all duration-300 flex items-center gap-6 group ${done ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg scale-[1.02]' : 'bg-zinc-100/50 dark:bg-zinc-900/30 border-transparent opacity-60'}`}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm" style={{ backgroundColor: done ? `${h.color}15` : '#e4e4e7', color: done ? h.color : '#a1a1aa' }}><HabitIcon className="w-8 h-8" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-black text-xl truncate ${done ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}>{h.name}</h3>
                          {currentStreak > 0 && <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${done ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}><Flame className={`w-3 h-3 ${done ? 'fill-orange-500' : ''}`} />{currentStreak}</div>}
                        </div>
                        <div className="flex items-center gap-2">{done ? <button onClick={() => handleOpenRetro(h)} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl text-xs font-black text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 transition-colors shadow-sm"><Check className="w-3 h-3 text-green-500" />{actualTime}<Edit2 className="w-2.5 h-2.5 ml-1 opacity-40" /></button> : <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-600 px-1"><Clock className="w-3.5 h-3.5 opacity-60" />{h.reminderTime || '--:--'}</div>}</div>
                      </div>
                      <button onClick={() => handleToggleHabit(h.id, done)} className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all active:scale-90 ${done ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl' : 'bg-white dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-700'}`}>{done ? <X className="w-6 h-6" /> : <Check className="w-7 h-7" />}</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-6 sm:p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100"><ChevronLeft className="w-5 h-5" /></button>
                    <h3 className="text-2xl font-black min-w-[180px] text-center">{t(`month_${calendarDate.getMonth()}`)} {calendarDate.getFullYear()}</h3>
                    <button onClick={() => changeMonth(1)} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <button onClick={() => setCalendarFilter('all')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${calendarFilter === 'all' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}><Layers className="w-3 h-3" /> All</button>
                    {habits.map(h => (
                      <button key={h.id} onClick={() => setCalendarFilter(h.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${calendarFilter === h.id ? 'text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`} style={{ backgroundColor: calendarFilter === h.id ? h.color : '' }}>{React.createElement(ICON_MAP[h.icon || 'Activity'] || Activity, { className: 'w-3 h-3' })}{h.name}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2">{[0,1,2,3,4,5,6].map(d => (<div key={d} className="text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest py-2">{t(`day_short_${d}`)}</div>))}</div>
                  <div className="grid grid-cols-7 gap-2">{calendarDays.map((date, i) => {
                      if (!date) return <div key={i} />;
                      const dateStr = date.toISOString().split('T')[0];
                      const dayLogs = logs.filter(l => l.date === dateStr);
                      const isToday = dateStr === getTodayDate();
                      const specificHabit = habits.find(h => h.id === calendarFilter);
                      const isHabitDone = dayLogs.some(l => l.habitId === calendarFilter);
                      return (
                        <button key={i} onClick={() => {
                          if (specificHabit) handleOpenRetro(specificHabit, dateStr);
                          else if (habits.length > 0) handleOpenRetro(habits[0], dateStr);
                        }} className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all hover:scale-105 active:scale-95 ${isToday && calendarFilter === 'all' ? 'bg-zinc-900 text-white border-transparent shadow-lg' : calendarFilter !== 'all' && isHabitDone ? 'text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800'}`} style={{ backgroundColor: calendarFilter !== 'all' && isHabitDone ? specificHabit?.color : '' }}>
                          <span className={`text-xs font-black ${calendarFilter !== 'all' && !isHabitDone ? 'text-zinc-400 dark:text-zinc-500' : ''}`}>{date.getDate()}</span>
                          {calendarFilter === 'all' ? <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">{dayLogs.map(l => (<div key={l.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: habits.find(hb => hb.id === l.habitId)?.color || '#ccc' }} />))}</div> : <div className="mt-1">{isHabitDone ? <Check className="w-3 h-3 text-white" strokeWidth={4} /> : <div className="h-3" />}</div>}
                        </button>
                      );
                    })}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black tracking-tight">{t('stats')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-3">{t('dailyAchievement')}</p>
                <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-amber-500" /><span className="text-4xl font-black">{statsSummary.rate}%</span></div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-3">{t('totalThisMonth')}</p>
                <span className="text-4xl font-black">{statsSummary.totalMonth}</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-3">{t('streak')}</p>
                <div className="flex items-center gap-2"><Flame className="w-6 h-6 text-orange-500" /><span className="text-4xl font-black">{statsSummary.maxStreak}</span></div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-3">Active Habits</p>
                <span className="text-4xl font-black">{statsSummary.count}</span>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-2xl font-black">{t('weeklyActivity')}</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', radius: 12 }} />
                    <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={40}>
                      {weeklyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : '#e4e4e7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Activity Chart */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-2xl font-black">{t('monthlyActivity')}</h3>
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <button onClick={() => changeStatsMonth(-1)} className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs font-black uppercase tracking-widest min-w-[140px] text-center">{t(`month_${statsDate.getMonth()}`)} {statsDate.getFullYear()}</span>
                  <button onClick={() => changeStatsMonth(1)} className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', radius: 6 }} />
                    <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={10}>
                      {monthlyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#10b981' : '#f1f1f4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black tracking-tight">{t('settings')}</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800/50">
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4"><Calendar className="w-6 h-6 text-zinc-400" /><div><h4 className="font-black">{t('language')}</h4><p className="text-xs text-zinc-400 uppercase font-black">{lang}</p></div></div>
                <button onClick={() => toggleLang(lang === 'id' ? 'en' : 'id')} className="bg-zinc-100 dark:bg-zinc-800 px-6 py-2 rounded-xl font-black text-sm hover:bg-zinc-200 transition-colors">Switch</button>
              </div>
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4"><Moon className="w-6 h-6 text-zinc-400" /><div><h4 className="font-black">{t('theme')}</h4><p className="text-xs text-zinc-400 uppercase font-black">{theme}</p></div></div>
                <button onClick={() => toggleTheme()} className="bg-zinc-100 dark:bg-zinc-800 px-6 py-2 rounded-xl font-black text-sm hover:bg-zinc-200 transition-colors">Toggle</button>
              </div>
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-zinc-400" />
                  <div>
                    <h4 className="font-black">{t('notifications')}</h4>
                    <p className={`text-[10px] uppercase font-black tracking-widest ${permission === 'granted' ? 'text-green-500' : 'text-zinc-400'}`}>
                      {permission === 'granted' ? t('notificationsActive') : t('permissionRequired')}
                    </p>
                  </div>
                </div>
                {permission !== 'granted' && (
                  <button 
                    onClick={requestPermission} 
                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-md active:scale-95"
                  >
                    {t('enableNotifications')}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black">Manage Habits</h3>
                <button onClick={() => handleOpenHabitModal()} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" />{t('addHabit')}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map(h => {
                  const HabitIcon = ICON_MAP[h.icon || 'Activity'] || Activity;
                  return (
                    <div key={h.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 flex justify-between items-center group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${h.color}15`, color: h.color }}><HabitIcon className="w-6 h-6" /></div>
                        <div><span className="font-black text-lg block leading-none">{h.name}</span><span className="text-[10px] text-zinc-400 uppercase font-black mt-1 inline-block tracking-widest">{h.reminderTime || '--:--'}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenHabitModal(h)} className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleConfirmDelete(h)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-400 hover:text-red-600 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-10"><button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 py-4 rounded-3xl text-sm font-black hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-all"><LogOut className="w-4 h-4" />{t('signOut')}</button></div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center z-40 pb-10">
        <NavItem id="dashboard" icon={LayoutDashboard} label={t('dashboard')} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="stats" icon={BarChart3} label={t('stats')} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="settings" icon={Settings} label={t('settings')} activeTab={activeTab} onClick={setActiveTab} />
      </nav>

      <Modal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)}>
        <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black">{editingHabitId ? t('editHabit') : t('addHabit')}</h3>
            <button onClick={() => setIsHabitModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-6 h-6" /></button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">{t('habitName')}</label>
              <input type="text" placeholder="Drink water" className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-zinc-200 outline-none" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">{t('selectIcon')}</label>
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{t(newHabitIcon)}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ICON_LIST.map(ic => {
                  const Icon = ICON_MAP[ic];
                  return (
                    <button key={ic} title={t(ic)} onClick={() => setNewHabitIcon(ic)} className={`p-4 rounded-2xl flex items-center justify-center transition-all ${newHabitIcon === ic ? 'bg-zinc-900 text-white shadow-lg scale-95' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600'}`}><Icon className="w-6 h-6" /></button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">{t('reminderTime')}</label><input type="time" className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold outline-none" value={newHabitTime} onChange={e => setNewHabitTime(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">{t('color')}</label><input type="color" className="w-full h-[56px] rounded-2xl cursor-pointer p-1 bg-zinc-50 dark:bg-zinc-800" value={newHabitColor} onChange={e => setNewHabitColor(e.target.value)} /></div>
            </div>
          </div>
          <button onClick={handleSaveHabit} className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-[28px] font-black text-lg active:scale-95 transition-transform">{t('save')}</button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{t('confirmDelete')}</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">{t('deleteWarning')}</p>
            </div>
          </div>
          {habitToDelete && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl flex items-center gap-4 border border-zinc-100 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${habitToDelete.color}15`, color: habitToDelete.color }}>{React.createElement(ICON_MAP[habitToDelete.icon || 'Activity'] || Activity, { className: 'w-6 h-6' })}</div>
              <div className="text-left"><span className="font-black text-lg block leading-none">{habitToDelete.name}</span><span className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-widest">Selected Habit</span></div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={handleFinalDelete} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-[24px] font-black text-lg active:scale-95 transition-all shadow-lg shadow-red-500/20">{t('delete')}</button>
            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-4 rounded-[24px] font-black text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">{t('cancel')}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRetroModalOpen} onClose={() => setIsRetroModalOpen(false)}>
        <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center"><h3 className="text-2xl font-black">{t('logPast')}</h3><button onClick={() => setIsRetroModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-6 h-6" /></button></div>
          <div className="space-y-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block">{t('selectDate')}</label><input type="date" max={getTodayDate()} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-6 py-4 font-bold outline-none" value={retroDate} onChange={e => setRetroDate(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block">{t('selectTime')}</label><input type="time" className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-6 py-4 font-bold outline-none" value={retroTime} onChange={e => setRetroTime(e.target.value)} /></div>
          </div>
          <button onClick={handleRetroSave} className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-[28px] font-black text-lg active:scale-95 transition-transform">{t('save')}</button>
        </div>
      </Modal>
    </div>
  );
}
