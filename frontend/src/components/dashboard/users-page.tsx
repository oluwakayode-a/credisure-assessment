"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { UserTable } from "@/components/dashboard/user-table";
import { API, type UserRow } from "@/components/dashboard/types";

export function UsersPage({ token }: { token?: string }) {
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
  const [statusCounts, setStatusCounts] = useState<{
    active: number;
    pending: number;
  } | null>(null);
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) =>
        setStatusCounts({
          active: data.active_users,
          pending: data.pending_users,
        }),
      )
      .catch(() => setStatusCounts(null));
  }, [token, refreshKey]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), limit: "8" });
    if (appliedSearch) query.set("search", appliedSearch);
    if (status !== "All status") query.set("status", status.toLowerCase());
    fetch(`${API}/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        setRows(data.items);
        setTotal(data.total);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "Couldn’t load customers. Check your API connection and try again.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, page, status, appliedSearch, refreshKey]);
  function searchNow(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPage(1);
    setAppliedSearch(search.trim());
  }
  return (
    <>
      <div className="mb-7">
        <p className="text-[12px] text-[#89948d]">
          Keep every relationship moving forward.
        </p>
        <h2 className="mt-1 text-[25px] font-semibold tracking-[-.8px]">
          Customer directory
        </h2>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <SmallStat
          label="Active customers"
          value={statusCounts?.active ?? "—"}
          icon={<Check size={16} />}
          color="#168750"
        />
        <SmallStat
          label="Pending review"
          value={statusCounts?.pending ?? "—"}
          icon={<Activity size={16} />}
          color="#d28a35"
        />
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] p-4 sm:px-5">
          <div>
            <h3 className="text-[13px] font-semibold">
              All customers{" "}
              <span className="ml-1 rounded-full bg-[#f0f4f0] px-2 py-0.5 text-[10px] font-medium text-[#6b786f]">
                {total}
              </span>
            </h3>
            <p className="mt-1 text-[10px] text-[#939d96]">
              View and manage your customer accounts.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <form
              onSubmit={searchNow}
              className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e4e9e5] px-2.5 sm:w-[220px] sm:flex-none"
            >
              <Search size={15} className="shrink-0 text-[#8e9991]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#a2aaa4]"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    setLoading(true);
                    setError("");
                    setAppliedSearch("");
                    setPage(1);
                  }}
                >
                  <X size={13} className="text-[#8e9991]" />
                </button>
              )}
            </form>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[11px] ${status !== "All status" ? "border-[#9bcaaa] bg-[#f2f8f3] text-[#23633d]" : "border-[#e4e9e5] text-[#5c6a60]"}`}
              >
                <SlidersHorizontal size={14} />
                Filter
                {status !== "All status" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#168750]" />
                )}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-10 w-40 rounded-lg border border-[#e6ece7] bg-white p-1.5 shadow-lg">
                  {["All status", "Active", "Pending", "Inactive"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setLoading(true);
                        setError("");
                        setStatus(s);
                        setPage(1);
                        setFilterOpen(false);
                      }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-[11px] hover:bg-[#f5f8f5] ${status === s ? "font-semibold text-[#168750]" : "text-[#516057]"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="m-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[11px] text-red-700"
          >
            {error}
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                setRefreshKey((x) => x + 1);
              }}
              className="ml-auto font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((x) => (
              <div
                key={x}
                className="h-10 animate-pulse rounded bg-[#f3f6f3]"
              />
            ))}
          </div>
        ) : (
          <UserTable rows={rows} />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ed] px-4 py-3.5 sm:px-5">
          <span className="text-[10px] text-[#8a958d]">
            Showing{" "}
            <b className="text-[#55645a]">
              {total ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, total)}
            </b>{" "}
            of <b className="text-[#55645a]">{total}</b> customers
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => {
                setLoading(true);
                setError("");
                setPage(page - 1);
              }}
              className="grid h-7 w-7 place-items-center rounded border border-[#e6ebe7] text-[#647168] disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="grid h-7 min-w-7 place-items-center rounded bg-[#eff7f0] px-2 text-[10px] font-semibold text-[#286a42]">
              {page}
            </span>
            <button
              disabled={page * 8 >= total}
              onClick={() => {
                setLoading(true);
                setError("");
                setPage(page + 1);
              }}
              className="grid h-7 w-7 place-items-center rounded border border-[#e6ebe7] text-[#647168] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SmallStat({
  label,
  value,
  icon,
  color = "#168750",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span
        className="grid h-9 w-9 place-items-center rounded-lg"
        style={{ color, background: `${color}12` }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[10px] text-[#89948d]">{label}</p>
        <p className="mt-0.5 text-[17px] font-semibold">{value}</p>
      </div>
    </div>
  );
}
