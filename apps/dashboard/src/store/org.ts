"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "admin" | "editor" | "viewer";
export interface Org {
  id: string;
  name: string;
  role: Role;
}

interface OrgState {
  hydrated: boolean;
  activeOrgId: string | null;
  orgs: Org[];
  setHydrated: () => void;
  setActiveOrg: (id: string | null) => void;
  setOrgs: (list: Org[] | ((prev: Org[]) => Org[])) => void;
  reset: () => void;
}

const PERSIST_KEY = "otm.org";
const LEGACY_KEYS = ["org-store"];

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      hydrated: false,
      activeOrgId: null,
      orgs: [],
      setHydrated: () => set({ hydrated: true }),
      setActiveOrg: (id) => set({ activeOrgId: id }),
      setOrgs: (list) =>
        set((s) => ({
          orgs:
            typeof list === "function"
              ? (list as (prev: Org[]) => Org[])(s.orgs)
              : list,
        })),
      reset: () =>
        set(() => {
          if (typeof window !== "undefined") {
            try {
              window.localStorage.removeItem(PERSIST_KEY);
              for (const k of LEGACY_KEYS) window.localStorage.removeItem(k);
            } catch {
            }
          }
          return { activeOrgId: null, orgs: [] };
        }),
    }),
    {
      name: PERSIST_KEY,
      partialize: (state) => ({
        activeOrgId: state.activeOrgId,
        orgs: state.orgs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
      version: 1,
      migrate: (persisted) => {
        return persisted;
      },
    }
  )
);
