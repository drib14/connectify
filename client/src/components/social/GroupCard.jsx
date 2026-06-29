import { Users, Lock, Globe, ArrowRight } from "lucide-react";

export default function GroupCard({ group, currentUserId, onJoin, onLeave, onOpen }) {
  const isMember = (group.members || []).some((m) => (m._id || m) === currentUserId);
  const isCreator = (group.creatorId || group.creatorId?._id) === currentUserId;

  return (
    <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors flex flex-col justify-between h-48 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-850 px-2 py-0.5 rounded bg-zinc-950/40">
            {group.subject || "General"}
          </span>
          <span className="text-zinc-600">
            {group.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </span>
        </div>
        <h4 className="text-sm font-bold text-zinc-200 line-clamp-1">{group.name}</h4>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{group.description || "No description provided."}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-semibold">
          <Users className="h-3.5 w-3.5 text-zinc-600" />
          {group.members?.length || 0} members
        </span>

        {isMember ? (
          <div className="flex items-center gap-2">
            {!isCreator && (
              <button
                onClick={() => onLeave?.(group._id)}
                className="cursor-pointer text-[10px] text-rose-500 hover:text-rose-400 font-bold px-2 py-1 rounded"
              >
                Leave
              </button>
            )}
            <button
              onClick={() => onOpen?.(group)}
              className="cursor-pointer inline-flex h-7 px-3 items-center gap-1 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
            >
              Enter <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onJoin?.(group._id)}
            className="cursor-pointer inline-flex h-7 px-4 items-center justify-center rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/25 transition-all"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
}
