export default function StatCard({ icon: Icon, label, value, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    orange: "bg-orange-500/10 text-orange-400",
    rose: "bg-rose-500/10 text-rose-400",
    sky: "bg-sky-500/10 text-sky-400",
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-4 hover:border-zinc-800 transition-colors">
      <div className={`h-12 w-12 rounded-xl ${colors[color] || colors.indigo} flex items-center justify-center`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div>
        <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{label}</div>
        <div className="text-2xl font-bold text-zinc-100">{value}</div>
      </div>
    </div>
  );
}
