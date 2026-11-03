"use client";

import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router";
import { signIn, signOut, useSession } from "next-auth/react";
import { Activity, ArrowRight, Check, ChevronLeft, ChevronRight, CircleHelp, Eye, EyeOff, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, SlidersHorizontal, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type UserRow = { id: number; full_name: string; email: string; company: string; status: "active" | "pending" | "inactive"; joined_at: string };
type Overview = { total_users: number; active_users: number; pending_users: number; inactive_users: number; users_change: number; activity: number[] };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function DashboardApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#f7f9f7]" />;
  return <BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} /><Route path="/dashboard/*" element={<RequireAuth><Shell /></RequireAuth>} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></BrowserRouter>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const location = useLocation();
  if (status === "loading") return <div className="grid min-h-screen place-items-center text-sm text-[#7b867f]">Loading your workspace…</div>;
  if (status === "unauthenticated") return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function LoginPage() {
  const { status } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  useEffect(() => { if (status === "authenticated") navigate(from, { replace: true }); }, [status, navigate, from]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Email or password didn’t match. Try again.");
      else navigate(from, { replace: true });
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="flex min-h-screen flex-col items-center justify-center bg-[#f1f4f1] px-5 py-10">
    <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#e5ebe6] bg-white shadow-[0_18px_55px_rgba(18,60,44,.1)]">
      <header className="bg-[#123c2c] px-8 py-6">
        <Brand light />
      </header>
      <section className="px-7 py-8 sm:px-9 sm:py-10">
        <div className="mb-7"><h1 className="text-[27px] font-semibold tracking-[-.8px]">Welcome back</h1><p className="mt-1.5 text-[13px] text-[#7b867f]">Sign in to CrediSure.</p></div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-[13px] font-semibold">Email address<input className="mt-2 h-12 w-full rounded-lg border border-[#dce3de] px-3.5 text-sm font-normal outline-none transition focus:border-[#168750] focus:ring-4 focus:ring-[#168750]/10" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label className="block text-[13px] font-semibold">Password<div className="relative mt-2"><input className="h-12 w-full rounded-lg border border-[#dce3de] px-3.5 pr-12 text-sm font-normal outline-none transition focus:border-[#168750] focus:ring-4 focus:ring-[#168750]/10" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#7b867f] hover:bg-[#f1f5f1] hover:text-[#183d2c]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#12623f] text-sm font-semibold text-white transition hover:bg-[#104e35] disabled:opacity-65">{busy ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}</button>
        </form>
      </section>
    </div>
    <p className="mt-6 text-center text-[11px] text-[#89948d]">© {new Date().getFullYear()} CrediSure</p>
  </main>;
}

function Brand({ light = false }: { light?: boolean }) {
  return <div className="flex items-center gap-2.5"><span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-white text-[#12623f]" : "bg-[#12623f] text-white"}`}><ShieldCheck size={21} strokeWidth={2.2} /></span><span className={`text-[19px] font-bold tracking-[-.7px] ${light ? "text-white" : "text-[#183d2c]"}`}>credi<span className="primary-accent">sure</span></span></div>;
}

function Shell() {
  const { data } = useSession();
  const [mobileNav, setMobileNav] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const token = data?.accessToken;
  const onUsers = location.pathname.includes("users");
  useEffect(() => {
    let alive = true;
    const ping = () => fetch(`${API}/health`, { cache: "no-store" }).then(r => { if (alive) setApiOnline(r.ok); }).catch(() => { if (alive) setApiOnline(false); });
    ping(); const id = window.setInterval(ping, 30000); return () => { alive = false; window.clearInterval(id); };
  }, []);

  async function exit() { await signOut({ redirect: false }); navigate("/login", { replace: true }); }
  return <div className="min-h-screen bg-[#f7f9f7]">
    <aside className={`sidebar fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col px-5 py-6 text-white transition-transform duration-200 lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-1"><Brand light /><button className="rounded p-1 text-white/70 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Workspace</div>
      <nav className="mt-3 space-y-1">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={17} />} label="Overview" end onClick={() => setMobileNav(false)} />
        <NavItem to="/dashboard/users" icon={<Users size={17} />} label="Customers" onClick={() => setMobileNav(false)} />
      </nav>
      <button onClick={exit} className="nav-link mt-auto flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px]"><LogOut size={16} />Sign out</button>
      <div className="mt-2 flex items-center gap-2.5 border-t border-white/10 px-2 pt-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9eadc] text-[10px] font-bold text-[#245d3d]">{data?.user?.name?.split(" ").map(x => x[0]).join("").slice(0,2) ?? "—"}</span><span className="min-w-0"><span className="block truncate text-[11px] font-semibold">{data?.user?.name ?? "Signed in"}</span></span></div>
    </aside>
    {mobileNav && <button className="fixed inset-0 z-30 bg-black/35 lg:hidden" aria-label="Close navigation overlay" onClick={() => setMobileNav(false)} />}
    <div className="min-h-screen lg:pl-[250px]">
      <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#e9eeea] bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
        <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="-ml-2 rounded-lg p-2 text-[#536259] hover:bg-[#f1f5f1] lg:hidden" aria-label="Open navigation"><Menu size={19} /></button><div><p className="text-[11px] text-[#89948d]">Workspace / <span className="text-[#46554b]">{onUsers ? "Customers" : "Overview"}</span></p><h1 className="mt-0.5 text-[15px] font-semibold">{onUsers ? "Customers" : "Overview"}</h1></div></div>
        <div className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:flex ${apiOnline === false ? "bg-red-50 text-red-700" : "bg-[#eff8f1] text-[#39774e]"}`}><span className={`h-1.5 w-1.5 rounded-full ${apiOnline === false ? "bg-red-500" : "bg-[#20a05c]"}`} />{apiOnline === null ? "Connecting" : apiOnline ? "API connected" : "API offline"}</div>
      </header>
      <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:px-10 lg:py-9"><Routes><Route index element={<OverviewPage token={token} />} /><Route path="users" element={<UsersPage token={token} />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></main>
    </div>
  </div>;
}

function NavItem({ to, icon, label, end, onClick }: { to: string; icon: React.ReactNode; label: string; end?: boolean; onClick?: () => void }) {
  return <NavLink end={end} to={to} onClick={onClick} className={({ isActive }) => `nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${isActive ? "active" : ""}`}>{icon}<span>{label}</span></NavLink>;
}

function OverviewPage({ token }: { token?: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!token) return;
    setError("");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([fetch(`${API}/overview`, { headers }), fetch(`${API}/users?limit=5`, { headers })])
      .then(async ([summary, people]) => { if (!summary.ok || !people.ok) throw new Error("Unable to load workspace data."); setOverview(await summary.json()); setRecent((await people.json()).items); })
      .catch(() => setError("Couldn’t load live data. Check that the API is running, then refresh."));
  }, [token, refreshKey]);
  const stats = overview ? [
    { label: "Total customers", value: overview.total_users.toLocaleString(), detail: `${overview.users_change >= 0 ? "+" : ""}${overview.users_change}% vs. last month`, icon: <Users size={17} />, color: "#168750" },
    { label: "Active accounts", value: overview.active_users.toLocaleString(), detail: `${overview.total_users ? Math.round(overview.active_users / overview.total_users * 100) : 0}% of total customers`, icon: <Check size={17} />, color: "#2478ad" },
    { label: "Pending review", value: overview.pending_users.toLocaleString(), detail: overview.pending_users ? "Needs attention" : "All clear", icon: <Activity size={17} />, color: "#d28a35" },
    { label: "Inactive accounts", value: overview.inactive_users.toLocaleString(), detail: "Currently inactive", icon: <Users size={17} />, color: "#9072bb" },
  ] : [];
  return <>
    <div className="mb-7"><p className="text-[12px] text-[#89948d]">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p><h2 className="mt-1 text-[25px] font-semibold tracking-[-.8px]">Customer overview</h2><p className="mt-1 text-[13px] text-[#7b867f]">Here’s what’s happening with your customers today.</p></div>
    {error && <div role="alert" className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800"><CircleHelp size={16} />{error}<button onClick={() => setRefreshKey(x => x + 1)} className="ml-auto font-semibold underline">Retry</button></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overview ? stats.map(stat => <div className="card p-5" key={stat.label}><div className="flex items-center justify-between"><span className="text-[12px] font-medium text-[#78847c]">{stat.label}</span><span className="grid h-8 w-8 place-items-center rounded-lg" style={{ color: stat.color, background: `${stat.color}12` }}>{stat.icon}</span></div><p className="mt-4 text-[27px] font-semibold tracking-[-1px]">{stat.value}</p><p className="mt-1 text-[10px] text-[#87928a]">{stat.detail}</p></div>) : error ? <div className="card col-span-full p-8 text-center text-sm text-[#7b867f]">Dashboard data is unavailable.</div> : [0,1,2,3].map(i => <div key={i} className="card h-[135px] animate-pulse bg-white p-5"><div className="h-3 w-28 rounded bg-[#eef2ee]" /><div className="mt-6 h-7 w-20 rounded bg-[#eef2ee]" /></div>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <div className="card p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[14px] font-semibold">Customer growth</h3><p className="mt-1 text-[11px] text-[#89948d]">New customers over the last {overview?.activity?.length ?? 7} months</p></div>{overview && <div className="text-right"><p className="text-[18px] font-semibold tracking-[-.4px]">{overview.users_change >= 0 ? "+" : ""}{overview.users_change}%</p><p className="text-[10px] text-[#89948d]">vs. last month</p></div>}</div>{overview?.activity?.length ? <GrowthChart values={overview.activity} /> : <p className="mt-8 grid h-[220px] place-items-center text-[12px] text-[#89948d]">No growth data available.</p>}</div>
      <div className="card p-5 sm:p-6"><div><h3 className="text-[14px] font-semibold">Account health</h3><p className="mt-1 text-[11px] text-[#89948d]">Current customer status</p></div><div className="mt-7 flex items-center gap-7"><AccountHealthChart overview={overview} /><div className="min-w-0 flex-1 space-y-4">{[["Active", overview?.active_users ?? "—", "#168750"], ["Pending", overview?.pending_users ?? "—", "#e8b55d"], ["Inactive", overview?.inactive_users ?? "—", "#cbd5ce"]].map(([label, value, color]) => <div key={String(label)} className="flex items-center justify-between gap-2 text-[11px]"><span className="flex items-center gap-2 text-[#69766e]"><i className="h-2 w-2 rounded-full" style={{ background: String(color) }} />{label}</span><b className="font-semibold">{value}</b></div>)}</div></div></div>
    </div>
    <div className="card mt-5 overflow-hidden"><div className="flex items-center justify-between px-5 py-4 sm:px-6"><div><h3 className="text-[14px] font-semibold">Recently added</h3><p className="mt-1 text-[11px] text-[#89948d]">Your latest customer accounts</p></div><Link to="/dashboard/users" className="flex items-center gap-1 text-[11px] font-semibold text-[#168750]">View all <ArrowRight size={13} /></Link></div><UserTable rows={recent} /></div>
  </>;
}

const growthChartConfig = {
  customers: { label: "New customers", color: "#168750" },
} satisfies ChartConfig;

const accountHealthChartConfig = {
  active: { label: "Active", color: "#168750" },
  pending: { label: "Pending", color: "#e8b55d" },
  inactive: { label: "Inactive", color: "#cbd5ce" },
} satisfies ChartConfig;

function AccountHealthChart({ overview }: { overview: Overview | null }) {
  const data = [
    { status: "active", customers: overview?.active_users ?? 0 },
    { status: "pending", customers: overview?.pending_users ?? 0 },
    { status: "inactive", customers: overview?.inactive_users ?? 0 },
  ];

  return (
    <div className="relative h-[142px] w-[142px] shrink-0 before:absolute before:inset-[14px] before:rounded-full before:border-[21px] before:border-[#eff2ef]">
      <ChartContainer config={accountHealthChartConfig} className="h-full">
        <PieChart accessibilityLayer>
          <Tooltip content={<ChartTooltipContent />} />
          <Pie data={data} dataKey="customers" nameKey="status" innerRadius={43} outerRadius={64} paddingAngle={2} strokeWidth={0}>
            {data.map(item => <Cell key={item.status} fill={`var(--color-${item.status})`} />)}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <b className="block text-[23px]">{overview?.total_users ?? "—"}</b>
          <span className="text-[10px] text-[#89948d]">customers</span>
        </div>
      </div>
    </div>
  );
}

function GrowthChart({ values }: { values: number[] }) {
  const now = new Date();
  const max = Math.max(...values, 1);
  const data = values.map((customers, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (values.length - index - 1), 1);
    return { month: date.toLocaleDateString("en", { month: "short" }), customers };
  });

  return (
    <ChartContainer config={growthChartConfig} className="mt-5 h-[220px]">
      <AreaChart accessibilityLayer data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="customerGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-customers)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--color-customers)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} fontSize={11} />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} width={32} allowDecimals={false} domain={[0, max]} tickCount={4} fontSize={11} />
        <Tooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "4 4" }} />
        <Area dataKey="customers" type="monotone" stroke="var(--color-customers)" strokeWidth={2.5} fill="url(#customerGrowthFill)" activeDot={{ r: 4, fill: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ChartContainer>
  );
}

function UsersPage({ token }: { token?: string }) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All status");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusCounts, setStatusCounts] = useState<{ active: number; pending: number } | null>(null);
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => setStatusCounts({ active: data.active_users, pending: data.pending_users }))
      .catch(() => setStatusCounts(null));
  }, [token, refreshKey]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); setLoading(true); setError("");
    const query = new URLSearchParams({ page: String(page), limit: "8" });
    if (appliedSearch) query.set("search", appliedSearch);
    if (status !== "All status") query.set("status", status.toLowerCase());
    fetch(`${API}/users?${query}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); const data = await response.json(); setRows(data.items); setTotal(data.total); })
      .catch(e => { if (e.name !== "AbortError") setError("Couldn’t load customers. Check your API connection and try again."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, page, status, appliedSearch, refreshKey]);
  function searchNow(event: React.FormEvent) { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }
  return <>
    <div className="mb-7"><p className="text-[12px] text-[#89948d]">Keep every relationship moving forward.</p><h2 className="mt-1 text-[25px] font-semibold tracking-[-.8px]">Customer directory</h2></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-2"><SmallStat label="Active customers" value={statusCounts?.active ?? "—"} icon={<Check size={16} />} color="#168750" /><SmallStat label="Pending review" value={statusCounts?.pending ?? "—"} icon={<Activity size={16} />} color="#d28a35" /></div>
    <div className="card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] p-4 sm:px-5"><div><h3 className="text-[13px] font-semibold">All customers <span className="ml-1 rounded-full bg-[#f0f4f0] px-2 py-0.5 text-[10px] font-medium text-[#6b786f]">{total}</span></h3><p className="mt-1 text-[10px] text-[#939d96]">View and manage your customer accounts.</p></div><div className="flex w-full gap-2 sm:w-auto"><form onSubmit={searchNow} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e4e9e5] px-2.5 sm:w-[220px] sm:flex-none"><Search size={15} className="shrink-0 text-[#8e9991]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#a2aaa4]" />{search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setAppliedSearch(""); setPage(1); }}><X size={13} className="text-[#8e9991]" /></button>}</form><div className="relative"><button onClick={() => setFilterOpen(!filterOpen)} className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[11px] ${status !== "All status" ? "border-[#9bcaaa] bg-[#f2f8f3] text-[#23633d]" : "border-[#e4e9e5] text-[#5c6a60]"}`}><SlidersHorizontal size={14} />Filter{status !== "All status" && <span className="h-1.5 w-1.5 rounded-full bg-[#168750]" />}</button>{filterOpen && <div className="absolute right-0 top-11 z-10 w-40 rounded-lg border border-[#e6ece7] bg-white p-1.5 shadow-lg">{["All status", "Active", "Pending", "Inactive"].map(s => <button key={s} onClick={() => { setStatus(s); setPage(1); setFilterOpen(false); }} className={`block w-full rounded-md px-3 py-2 text-left text-[11px] hover:bg-[#f5f8f5] ${status === s ? "font-semibold text-[#168750]" : "text-[#516057]"}`}>{s}</button>)}</div>}</div></div></div>
      {error && <div role="alert" className="m-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[11px] text-red-700">{error}<button onClick={() => setRefreshKey(x => x + 1)} className="ml-auto font-semibold underline">Retry</button></div>}
      {loading ? <div className="space-y-3 p-6">{[1,2,3,4].map(x => <div key={x} className="h-10 animate-pulse rounded bg-[#f3f6f3]" />)}</div> : <UserTable rows={rows} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ed] px-4 py-3.5 sm:px-5"><span className="text-[10px] text-[#8a958d]">Showing <b className="text-[#55645a]">{total ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, total)}</b> of <b className="text-[#55645a]">{total}</b> customers</span><div className="flex items-center gap-1"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="grid h-7 w-7 place-items-center rounded border border-[#e6ebe7] text-[#647168] disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={14} /></button><span className="grid h-7 min-w-7 place-items-center rounded bg-[#eff7f0] px-2 text-[10px] font-semibold text-[#286a42]">{page}</span><button disabled={page * 8 >= total} onClick={() => setPage(page + 1)} className="grid h-7 w-7 place-items-center rounded border border-[#e6ebe7] text-[#647168] disabled:opacity-40" aria-label="Next page"><ChevronRight size={14} /></button></div></div>
    </div>
  </>;
}

function SmallStat({ label, value, icon, color = "#168750" }: { label: string; value: number | string; icon: React.ReactNode; color?: string }) {
  return <div className="card flex items-center gap-3 p-4"><span className="grid h-9 w-9 place-items-center rounded-lg" style={{ color, background: `${color}12` }}>{icon}</span><div><p className="text-[10px] text-[#89948d]">{label}</p><p className="mt-0.5 text-[17px] font-semibold">{value}</p></div></div>;
}

function UserTable({ rows }: { rows: UserRow[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left"><thead><tr className="border-y border-[#edf0ed] bg-[#fbfcfb] text-[9px] font-semibold uppercase tracking-[.08em] text-[#929c95]">{["Customer", "Company", "Status", "Joined"].map(x => <th key={x} className="px-4 py-3 font-semibold sm:px-5">{x}</th>)}</tr></thead><tbody>{rows.length ? rows.map(row => <tr key={row.id} className="table-row border-b border-[#f0f2f0] last:border-0"><td className="px-4 py-3 sm:px-5"><div className="flex items-center gap-2.5"><Avatar name={row.full_name} /><div><p className="text-[11px] font-semibold text-[#344239]">{row.full_name}</p><p className="mt-0.5 text-[10px] text-[#929b95]">{row.email}</p></div></div></td><td className="px-4 py-3 text-[10px] text-[#647168] sm:px-5">{row.company}</td><td className="px-4 py-3 sm:px-5"><StatusPill status={row.status} /></td><td className="px-4 py-3 text-[10px] text-[#77837b] sm:px-5">{new Date(`${row.joined_at}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td></tr>) : <tr><td colSpan={4} className="px-5 py-12 text-center text-[12px] text-[#8a958d]">No customers found. Try a different search or filter.</td></tr>}</tbody></table></div>;
}

function Avatar({ name }: { name: string }) {
  const colors = ["#e7d8c9", "#d4e4d6", "#d9d9eb", "#f1e0c6", "#d8e6ec"];
  const index = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[9px] font-bold text-[#365641]" style={{ background: colors[index] }}>{name.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase()}</span>;
}

function StatusPill({ status }: { status: UserRow["status"] }) {
  const styles = status === "active" ? "bg-[#edf7ef] text-[#29824b]" : status === "pending" ? "bg-[#fff5e6] text-[#b67a22]" : "bg-[#f0f2f1] text-[#758078]";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-semibold ${styles}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{status[0].toUpperCase() + status.slice(1)}</span>;
}
