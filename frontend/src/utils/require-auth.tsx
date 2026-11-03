"use client";

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "next-auth/react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const location = useLocation();
  if (status === "loading") return <div className="grid min-h-screen place-items-center text-sm text-[#7b867f]">Loading your workspace…</div>;
  if (status === "unauthenticated") return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
