import { create } from 'zustand';
import Constants from 'expo-constants';

interface FlightSegment {
  flight_number: string;
  dep_airport: string;
  dep_time: string;
  arr_airport: string;
  arr_time: string;
  work_type: string;
  block_hours?: string;
  aircraft_type?: string;
}

interface RosterEntry {
  id?: string;
  date: string;
  day: string;
  duty_start_time?: string;
  flights: FlightSegment[];
  duty_end_time?: string;
  duty_hours?: string;
  duty_code?: string;
  off_type?: string;
  is_day_off: boolean;
  prep_time?: string;
  commute_time?: string;
  rest_time_to_next?: string;
}

interface RosterStore {
  roster: RosterEntry[];
  loading: boolean;
  error: string | null;
  fetchRoster: () => Promise<void>;
  uploadRosterData: (entries: RosterEntry[]) => Promise<void>;
  getTodayEntry: () => RosterEntry | null;
  getUpcomingFlights: (limit?: number) => RosterEntry[];
}

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export const useRosterStore = create<RosterStore>((set, get) => ({
  roster: [],
  loading: false,
  error: null,

  fetchRoster: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/roster`);
      if (!response.ok) {
        throw new Error('Failed to fetch roster');
      }
      const data = await response.json();
      set({ roster: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  uploadRosterData: async (entries: RosterEntry[]) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/roster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload roster');
      }
      
      // Refresh roster after upload
      await get().fetchRoster();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getTodayEntry: () => {
    const today = new Date();
    const roster = get().roster;
    // For demo, return first non-day-off entry
    return roster.find(entry => !entry.is_day_off) || null;
  },

  getUpcomingFlights: (limit = 5) => {
    const roster = get().roster;
    return roster.filter(entry => !entry.is_day_off).slice(0, limit);
  },
}));
