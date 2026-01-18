
import { DailyEntry } from '../types';

const STORAGE_KEY = "obsidian_system_v3";

export const getLocalISODate = (offset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const storage = {
  get: (): DailyEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  set: (data: DailyEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const sanitizeEntries = (raw: any[]): DailyEntry[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(item => item && item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
