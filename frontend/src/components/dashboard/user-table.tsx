import type { UserRow } from "@/components/dashboard/types";

export function UserTable({ rows }: { rows: UserRow[] }) {
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
