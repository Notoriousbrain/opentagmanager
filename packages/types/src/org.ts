export type Role = "owner" | "admin" | "editor" | "viewer";

export interface Org {
  id: string;
  name: string;
  role: Role;
}
