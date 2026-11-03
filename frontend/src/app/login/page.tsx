import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/components/dashboard/login-page";

export const metadata: Metadata = { title: "Sign in | CrediSure" };

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
