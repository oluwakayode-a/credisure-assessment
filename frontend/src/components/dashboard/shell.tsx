"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { Brand } from "@/components/dashboard/brand";
import { API } from "@/components/dashboard/types";

function NavItem({
  to,
  icon,
  label,
  end,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname.startsWith(to);
  return (
    <Link
      href={to}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${isActive ? "active" : ""}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { data } = useSession({ required: true });
  const [mobileNav, setMobileNav] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const onUsers = usePathname().startsWith("/dashboard/users");

  useEffect(() => {
    let alive = true;
    const ping = () =>
      fetch(`${API}/health`, { cache: "no-store" })
        .then((r) => {
          if (alive) setApiOnline(r.ok);
        })
        .catch(() => {
          if (alive) setApiOnline(false);
        });
    ping();
    const id = window.setInterval(ping, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col px-5 py-6 text-white transition-transform duration-200 lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-1">
          <Brand light />
          <button
            className="rounded p-1 text-white/70 lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">
          Workspace
        </div>
        <nav className="mt-3 space-y-1">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={17} />}
            label="Overview"
            end
            onClick={() => setMobileNav(false)}
          />
          <NavItem
            to="/dashboard/users"
            icon={<Users size={17} />}
            label="Customers"
            onClick={() => setMobileNav(false)}
          />
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-link mt-auto flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px]"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <div className="mt-2 flex items-center gap-2.5 border-t border-white/10 px-2 pt-4">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9eadc] text-[10px] font-bold text-[#245d3d]">
            {data?.user?.name
              ?.split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2) ?? "—"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold">
              {data?.user?.name ?? "Signed in"}
            </span>
          </span>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="min-h-screen lg:pl-62.5">
        <header className="sticky top-0 z-20 flex h-17.5 items-center justify-between border-b border-[#e9eeea] bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="-ml-2 rounded-lg p-2 text-[#536259] hover:bg-[#f1f5f1] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-[11px] text-[#89948d]">
                Workspace /{" "}
                <span className="text-[#46554b]">
                  {onUsers ? "Customers" : "Overview"}
                </span>
              </p>
              <h1 className="mt-0.5 text-[15px] font-semibold">
                {onUsers ? "Customers" : "Overview"}
              </h1>
            </div>
          </div>
          <div
            className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:flex ${apiOnline === false ? "bg-red-50 text-red-700" : "bg-[#eff8f1] text-[#39774e]"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${apiOnline === false ? "bg-red-500" : "bg-[#20a05c]"}`}
            />
            {apiOnline === null
              ? "Connecting"
              : apiOnline
                ? "API connected"
                : "API offline"}
          </div>
        </header>
        <main className="mx-auto max-w-375 p-5 sm:p-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
