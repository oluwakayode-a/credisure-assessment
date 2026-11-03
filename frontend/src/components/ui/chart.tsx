"use client";

import { createContext, useContext } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

export type ChartConfig = Record<string, { label: string; color: string }>;

const ChartConfigContext = createContext<ChartConfig>({});

export function ChartContainer({
  config,
  className = "",
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: ReactElement;
}) {
  const colors = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as CSSProperties;

  return (
    <ChartConfigContext.Provider value={config}>
      <div
        data-slot="chart"
        className={`w-full ${className}`}
        style={colors}
      >
        <div className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:fill-[#89948d] [&_.recharts-cartesian-grid_line]:stroke-[#e9eeea] [&_.recharts-tooltip-cursor]:stroke-[#cbd5ce]">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </ChartConfigContext.Provider>
  );
}

type TooltipItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
};

export function ChartTooltipContent({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: ReactNode;
  payload?: TooltipItem[];
}) {
  const config = useContext(ChartConfigContext);
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-32 rounded-lg border border-[#e7ece8] bg-white px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-[11px] font-medium text-[#89948d]">{label}</p>
      {payload.map((item, index) => {
        const nameKey = String(item.name ?? "");
        const dataKey = String(item.dataKey ?? "");
        const key = config[nameKey] ? nameKey : config[dataKey] ? dataKey : nameKey || dataKey || String(index);
        const series = config[key];
        return (
          <div key={`${key}-${index}`} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: item.color ?? series?.color ?? "#168750" }}
            />
            <span className="text-[#536259]">{series?.label ?? item.name ?? "Value"}</span>
            <span className="ml-auto font-semibold tabular-nums text-[#18231d]">
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
