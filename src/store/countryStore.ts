'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CountryCode = 'ALL' | 'US' | 'UK';

interface CountryState {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set) => ({
      country: 'ALL',
      setCountry: (country) => set({ country }),
    }),
    {
      name: 'moon-mart-country',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
