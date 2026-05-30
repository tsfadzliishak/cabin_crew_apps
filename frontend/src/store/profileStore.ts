import { create } from 'zustand';

interface ProfileStore {
  name: string;
  staffNumber: string;
  rank: string;
  base: string;
  fleet: string;
  setProfile: (profile: Partial<ProfileStore>) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  name: 'RABIATUL ADAWIAH BINTI NOOR FAIZ',
  staffNumber: '2107959',
  rank: 'Stewardess',
  base: 'KUL',
  fleet: 'NBA',
  setProfile: (profile) => set((state) => ({ ...state, ...profile })),
}));
