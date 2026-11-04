"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/dashboard/brand";


const DEMO_EMAIL = "admin@credisure.com";
const DEMO_PASSWORD = "password123";

export function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const callbackUrl = useSearchParams().get("callbackUrl");

  const from =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";
  useEffect(() => {
    if (status === "authenticated") router.replace(from);
  }, [status, router, from]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) setError("Email or password didn’t match. Try again.");
      else router.replace(from);
    } catch {
      setError(
        "Unable to sign in right now. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f1f4f1] px-5 py-10">
      <div className="w-full max-w-110 overflow-hidden rounded-2xl border border-[#e5ebe6] bg-white shadow-[0_18px_55px_rgba(18,60,44,.1)]">
        <header className="bg-[#123c2c] px-8 py-6">
          <Brand light />
        </header>
        <section className="px-7 py-8 sm:px-9 sm:py-10">
          <div className="mb-7">
            <h1 className="text-[27px] font-semibold tracking-[-.8px]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[13px] text-[#7b867f]">
              Sign in to CrediSure.
            </p>
          </div>
          <p className="mb-5 rounded-lg bg-[#e9f5ed] px-3 py-2 text-xs text-[#245d3d]">
            Demo account filled in — just press <b>Sign in</b>.
          </p>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-[13px] font-semibold">
              Email address
              <input
                className="mt-2 h-12 w-full rounded-lg border border-[#dce3de] px-3.5 text-sm font-normal outline-none transition focus:border-[#168750] focus:ring-4 focus:ring-[#168750]/10"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-[13px] font-semibold">
              Password
              <div className="relative mt-2">
                <input
                  className="h-12 w-full rounded-lg border border-[#dce3de] px-3.5 pr-12 text-sm font-normal outline-none transition focus:border-[#168750] focus:ring-4 focus:ring-[#168750]/10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#7b867f] hover:bg-[#f1f5f1] hover:text-[#183d2c]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#12623f] text-sm font-semibold text-white transition hover:bg-[#104e35] disabled:opacity-65"
            >
              {busy ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
      <p className="mt-6 text-center text-[11px] text-[#89948d]">
        © {new Date().getFullYear()} CrediSure
      </p>
    </main>
  );
}
