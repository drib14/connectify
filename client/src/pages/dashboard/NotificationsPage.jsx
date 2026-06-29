import { useEffect } from "react";
import useSocialStore from "../../stores/social-store";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Bell, Check, Clock, UserPlus, Heart, MessageSquare, Award } from "lucide-react";

const icons = {
  friend_request: { icon: UserPlus, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
  like: { icon: Heart, color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
  comment: { icon: MessageSquare, color: "text-sky-400 border-sky-500/20 bg-sky-500/10" },
  achievement: { icon: Award, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
};

export default function NotificationsPage() {
  const { notifications, notifLoading, fetchNotifications, markNotifRead, markAllRead } = useSocialStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Notifications</h1>
          <p className="text-xs text-zinc-500">Track likes, comments, friend requests, and study milestones.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="cursor-pointer inline-flex h-8 px-3 items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifLoading && notifications.length === 0 ? (
        <LoadingSpinner message="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="We will notify you here when you get updates." />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const config = icons[notif.type] || { icon: Bell, color: "text-zinc-400 bg-zinc-900/10 border-zinc-850" };
            const Icon = config.icon;
            return (
              <div
                key={notif._id}
                onClick={() => !notif.read && markNotifRead(notif._id)}
                className={`p-4 rounded-xl border flex gap-3.5 items-start justify-between transition-all ${
                  notif.read
                    ? "border-zinc-900 bg-zinc-900/5 opacity-70"
                    : "border-indigo-500/20 bg-indigo-500/5 cursor-pointer hover:border-indigo-500/30"
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`h-8 w-8 rounded-lg border shrink-0 flex items-center justify-center ${config.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={`text-xs ${notif.read ? "text-zinc-400" : "text-zinc-200 font-medium"}`}>
                      {notif.message}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] text-zinc-500 mt-1">
                      <Clock className="h-2.5 w-2.5" /> {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
