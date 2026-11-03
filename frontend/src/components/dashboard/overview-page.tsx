"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Activity, ArrowRight, Check, CircleHelp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { UserTable } from "@/components/dashboard/user-table";
import { API, type Overview, type UserRow } from "@/components/dashboard/types";

export function OverviewPage() {
  const token = useSession().data?.accessToken;
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/overview`, { headers }),
      fetch(`${API}/users?limit=5`, { headers }),
    ])
      .then(async ([summary, people]) => {
        if (!summary.ok || !people.ok)
          throw new Error("Unable to load workspace data.");
        setOverview(await summary.json());
        setRecent((await people.json()).items);
        setError("");
      })
      .catch(() =>
        setError(
          "Couldn’t load live data. Check that the API is running, then refresh.",
        ),
      );
  }, [token, refreshKey]);
  const stats = overview
    ? [
        {
          label: "Total customers",
          value: overview.total_users.toLocaleString(),
          detail: `${overview.users_change >= 0 ? "+" : ""}${overview.users_change}% vs. last month`,
          icon: <Users size={17} />,
          color: "#168750",
        },
        {
          label: "Active accounts",
          value: overview.active_users.toLocaleString(),
          detail: `${overview.total_users ? Math.round((overview.active_users / overview.total_users) * 100) : 0}% of total customers`,
          icon: <Check size={17} />,
          color: "#2478ad",
        },
        {
          label: "Pending review",
          value: overview.pending_users.toLocaleString(),
          detail: overview.pending_users ? "Needs attention" : "All clear",
          icon: <Activity size={17} />,
          color: "#d28a35",
        },
        {
          label: "Inactive accounts",
          value: overview.inactive_users.toLocaleString(),
          detail: "Currently inactive",
          icon: <Users size={17} />,
          color: "#9072bb",
        },
      ]
    : [];
  return (
    <>
      <div className="mb-7">
        <p className="text-[12px] text-[#89948d]" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h2 className="mt-1 text-[25px] font-semibold tracking-[-.8px]">
          Customer overview
        </h2>
        <p className="mt-1 text-[13px] text-[#7b867f]">
          Here’s what’s happening with your customers today.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800"
        >
          <CircleHelp size={16} />
          {error}
          <button
            onClick={() => {
              setError("");
              setRefreshKey((x) => x + 1);
            }}
            className="ml-auto font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview ? (
          stats.map((stat) => (
            <div className="card p-5" key={stat.label}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#78847c]">
                  {stat.label}
                </span>
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ color: stat.color, background: `${stat.color}12` }}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="mt-4 text-[27px] font-semibold tracking-[-1px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] text-[#87928a]">{stat.detail}</p>
            </div>
          ))
        ) : error ? (
          <div className="card col-span-full p-8 text-center text-sm text-[#7b867f]">
            Dashboard data is unavailable.
          </div>
        ) : (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-[135px] animate-pulse bg-white p-5">
              <div className="h-3 w-28 rounded bg-[#eef2ee]" />
              <div className="mt-6 h-7 w-20 rounded bg-[#eef2ee]" />
            </div>
          ))
        )}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold">Customer growth</h3>
              <p className="mt-1 text-[11px] text-[#89948d]">
                New customers over the last {overview?.activity?.length ?? 7}{" "}
                months
              </p>
            </div>
            {overview && (
              <div className="text-right">
                <p className="text-[18px] font-semibold tracking-[-.4px]">
                  {overview.users_change >= 0 ? "+" : ""}
                  {overview.users_change}%
                </p>
                <p className="text-[10px] text-[#89948d]">vs. last month</p>
              </div>
            )}
          </div>
          {overview?.activity?.length ? (
            <GrowthChart values={overview.activity} />
          ) : (
            <p className="mt-8 grid h-55 place-items-center text-[12px] text-[#89948d]">
              No growth data available.
            </p>
          )}
        </div>
        <div className="card p-5 sm:p-6">
          <div>
            <h3 className="text-[14px] font-semibold">Account health</h3>
            <p className="mt-1 text-[11px] text-[#89948d]">
              Current customer status
            </p>
          </div>
          <div className="mt-7 flex items-center gap-7">
            <AccountHealthChart overview={overview} />
            <div className="min-w-0 flex-1 space-y-4">
              {[
                ["Active", overview?.active_users ?? "—", "#168750"],
                ["Pending", overview?.pending_users ?? "—", "#e8b55d"],
                ["Inactive", overview?.inactive_users ?? "—", "#cbd5ce"],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <span className="flex items-center gap-2 text-[#69766e]">
                    <i
                      className="h-2 w-2 rounded-full"
                      style={{ background: String(color) }}
                    />
                    {label}
                  </span>
                  <b className="font-semibold">{value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-[14px] font-semibold">Recently added</h3>
            <p className="mt-1 text-[11px] text-[#89948d]">
              Your latest customer accounts
            </p>
          </div>
          <Link
            href="/dashboard/users"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#168750]"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <UserTable rows={recent} />
      </div>
    </>
  );
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
    <div className="relative h-35.5 w-35.5 shrink-0 before:absolute before:inset-3.5 before:rounded-full before:border-21 before:border-[#eff2ef]">
      <ChartContainer config={accountHealthChartConfig} className="h-full">
        <PieChart accessibilityLayer>
          <Tooltip content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="customers"
            nameKey="status"
            innerRadius={43}
            outerRadius={64}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((item) => (
              <Cell key={item.status} fill={`var(--color-${item.status})`} />
            ))}
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
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (values.length - index - 1),
      1,
    );
    return {
      month: date.toLocaleDateString("en", { month: "short" }),
      customers,
    };
  });

  return (
    <ChartContainer config={growthChartConfig} className="mt-5 h-55">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="customerGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-customers)"
              stopOpacity={0.22}
            />
            <stop
              offset="95%"
              stopColor="var(--color-customers)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          fontSize={11}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          width={32}
          allowDecimals={false}
          domain={[0, max]}
          tickCount={4}
          fontSize={11}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ strokeDasharray: "4 4" }}
        />
        <Area
          dataKey="customers"
          type="monotone"
          stroke="var(--color-customers)"
          strokeWidth={2.5}
          fill="url(#customerGrowthFill)"
          activeDot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
