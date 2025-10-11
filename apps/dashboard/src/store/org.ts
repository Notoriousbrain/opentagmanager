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
          orgs: typeof list === "function" ? list(s.orgs) : list,
        })),
      reset: () => set({ activeOrgId: null, orgs: [] }),
    }),
    {
      name: "otm.org",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);
