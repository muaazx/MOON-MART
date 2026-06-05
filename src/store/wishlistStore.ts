'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IProduct } from '@/types';

interface WishlistState {
  items: IProduct[];
  addItem: (product: IProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: IProduct) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: IProduct) => {
        set((state) => {
          if (state.items.find((item) => item._id === product._id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        }));
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item._id === productId);
      },

      toggleItem: (product: IProduct) => {
        const isInList = get().isInWishlist(product._id);
        if (isInList) {
          get().removeItem(product._id);
        } else {
          get().addItem(product);
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'moon-mart-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
