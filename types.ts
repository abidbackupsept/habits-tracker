
export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  reminderTime: string | null;
  icon?: string;
}

export interface Log {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
}

export type LangCode = 'en' | 'id';

export type SyncStatus = 'syncing' | 'synced' | 'local' | 'error' | 'conflict';
