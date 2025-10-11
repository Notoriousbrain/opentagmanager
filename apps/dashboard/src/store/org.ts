"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "owner" | "admin" | "editor" | "viewer";

export interface Org {
  id: string;
  name: string;
  role: Role;
}

interface OrgState {
  activeOrgId: string | null;
  orgs: Org[];
  setActiveOrg: (id: string | null) => void;
  setOrgs: (list: Org[]) => void;
  reset: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      orgs: [],
      setActiveOrg: (id) => set({ activeOrgId: id }),
      setOrgs: (list) => set({ orgs: list }),
      reset: () => set({ activeOrgId: null, orgs: [] }),
    }),
    { name: "otm.org" }
  )
);
