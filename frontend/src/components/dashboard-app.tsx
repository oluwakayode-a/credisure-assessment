"use client";

import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { LoginPage } from "@/components/dashboard/login-page";
import { Shell } from "@/components/dashboard/shell";
import { RequireAuth } from "@/utils/require-auth";

export function DashboardApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Keep router out of server and first client render to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <div className="min-h-screen bg-[#f7f9f7]" />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Navigate to="/dashboard" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
