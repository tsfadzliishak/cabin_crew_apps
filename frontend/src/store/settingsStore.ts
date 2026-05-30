import { create } from 'zustand';
import { storage } from '../utils/storage';

const PREP_KEY = 'settings_prep_minutes';
const COMMUTE_KEY = 'settings_commute_minutes';

interface SettingsStore {
  prepMinutes: number; // minutes before flight for preparation
  commuteMinutes: number; // minutes before duty start to leave for airport
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setPrepMinutes: (minutes: number) => Promise<void>;
  setCommuteMinutes: (minutes: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  prepMinutes: 120, // default: 2 hours
  commuteMinutes: 60, // default: 1 hour
  loaded: false,

  loadSettings: async () => {
    const prep = await storage.getItem(PREP_KEY, 120);
    const commute = await storage.getItem(COMMUTE_KEY, 60);
    set({
      prepMinutes: prep ?? 120,
      commuteMinutes: commute ?? 60,
      loaded: true,
    });
  },

  setPrepMinutes: async (minutes: number) => {
    await storage.setItem(PREP_KEY, minutes);
    set({ prepMinutes: minutes });
  },

  setCommuteMinutes: async (minutes: number) => {
    await storage.setItem(COMMUTE_KEY, minutes);
    set({ commuteMinutes: minutes });
  },
}));
