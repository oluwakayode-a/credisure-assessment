export type UserRow = {
  id: number;
  full_name: string;
  email: string;
  company: string;
  status: "active" | "pending" | "inactive";
  joined_at: string;
};

export type Overview = {
  total_users: number;
  active_users: number;
  pending_users: number;
  inactive_users: number;
  users_change: number;
  activity: number[];
};

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
