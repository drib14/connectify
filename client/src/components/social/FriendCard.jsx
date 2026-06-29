import Avatar from "../ui/Avatar";
import { UserMinus, UserCheck, UserPlus, Clock } from "lucide-react";

export default function FriendCard({ friend, relationshipId, status, isRequest, isSent, onAccept, onDecline, onRemove, onSendRequest }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 flex items-center justify-between hover:border-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar src={friend.avatar} name={friend.username} size="md" online={friend.isOnline || false} />
        <div>
          <div className="text-xs font-bold text-zinc-200">{friend.username}</div>
          <div className="text-[10px] text-zinc-500">{friend.school || "No School Added"}</div>
          {friend.studyStreak > 0 && (
            <div className="text-[9px] text-orange-400 font-semibold mt-0.5">🔥 {friend.studyStreak} Day Streak</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === "accepted" && (
          <button
            onClick={() => onRemove?.(relationshipId)}
            className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            title="Remove Friend"
          >
            <UserMinus className="h-4 w-4" />
          </button>
        )}

        {isRequest && (
          <>
            <button
              onClick={() => onAccept?.(relationshipId)}
              className="cursor-pointer inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
            >
              <UserCheck className="h-3.5 w-3.5" /> Accept
            </button>
            <button
              onClick={() => onDecline?.(relationshipId)}
              className="cursor-pointer inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-zinc-850 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
            >
              Decline
            </button>
          </>
        )}

        {isSent && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 border border-zinc-900 bg-zinc-950/40 px-2.5 py-1 rounded-lg">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )}

        {onSendRequest && (
          <button
            onClick={() => onSendRequest(friend._id)}
            className="cursor-pointer inline-flex h-8 px-3 items-center gap-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/25 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Friend
          </button>
        )}
      </div>
    </div>
  );
}
