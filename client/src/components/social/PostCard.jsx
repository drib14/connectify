import { useState } from "react";
import Avatar from "../ui/Avatar";
import { Heart, MessageCircle, Trash2, Clock, BookOpen, Award, HelpCircle, Lightbulb } from "lucide-react";

const typeLabels = {
  note_share: { label: "Shared Notes", icon: BookOpen, color: "text-sky-400 bg-sky-500/10" },
  achievement: { label: "Achievement", icon: Award, color: "text-amber-400 bg-amber-500/10" },
  question: { label: "Question", icon: HelpCircle, color: "text-violet-400 bg-violet-500/10" },
  study_tip: { label: "Study Tip", icon: Lightbulb, color: "text-emerald-400 bg-emerald-500/10" },
  milestone: { label: "Milestone", icon: Award, color: "text-rose-400 bg-rose-500/10" },
};

export default function PostCard({ post, currentUserId, onLike, onDelete, onToggleComments }) {
  const info = typeLabels[post.type] || typeLabels.study_tip;
  const Icon = info.icon;
  const isLiked = (post.likes || []).includes(currentUserId);
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={post.userId?.avatar} name={post.userId?.username} size="md" />
          <div>
            <div className="text-sm font-bold text-zinc-200">{post.userId?.username || "Student"}</div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${info.color} text-[9px] font-bold`}>
                <Icon className="h-2.5 w-2.5" /> {info.label}
              </span>
              <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {timeAgo}</span>
            </div>
          </div>
        </div>
        {post.userId?._id === currentUserId && (
          <button onClick={() => onDelete?.(post._id)} title="Delete"
            className="cursor-pointer h-7 w-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Attachments */}
      {post.attachments?.length > 0 && post.attachments[0].noteId && (
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-zinc-200 truncate">{post.attachments[0].title}</div>
              <div className="text-[9px] text-zinc-500">Shared Study Note</div>
            </div>
          </div>
          <button
            onClick={() => onImportNote?.(post._id)}
            className="cursor-pointer inline-flex h-7 px-3 items-center justify-center gap-1 rounded-lg bg-indigo-650/20 hover:bg-indigo-650/40 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 transition-all shrink-0"
          >
            Save to Notebook
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-900/60">
        <button onClick={() => onLike?.(post._id)}
          className={`cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all ${isLiked ? "text-rose-400" : "text-zinc-500 hover:text-rose-400"}`}>
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          {(post.likes || []).length || ""}
        </button>
        <button onClick={() => onToggleComments?.(post._id)}
          className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-indigo-400 transition-all">
          <MessageCircle className="h-4 w-4" /> {post.commentsCount || ""}
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
