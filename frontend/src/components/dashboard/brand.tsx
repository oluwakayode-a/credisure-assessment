import { ShieldCheck } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return <div className="flex items-center gap-2.5"><span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-white text-[#12623f]" : "bg-[#12623f] text-white"}`}><ShieldCheck size={21} strokeWidth={2.2} /></span><span className={`text-[19px] font-bold tracking-[-.7px] ${light ? "text-white" : "text-[#183d2c]"}`}>credi<span className="primary-accent">sure</span></span></div>;
}
