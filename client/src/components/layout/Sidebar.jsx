import { NavLink } from "react-router-dom";
import {
  BarChart2, MessageSquare, BookOpen, HelpCircle, Layers,
  Calendar, Compass, User, Rss, Users, UsersRound, Bell, Brain
} from "lucide-react";

const studyLinks = [
  { to: "/dashboard", icon: BarChart2, label: "Overview", end: true },
  { to: "/dashboard/coach", icon: MessageSquare, label: "AI Study Coach" },
  { to: "/dashboard/notes", icon: BookOpen, label: "AI Notes" },
  { to: "/dashboard/quizzes", icon: HelpCircle, label: "AI Quizzes" },
  { to: "/dashboard/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/dashboard/planner", icon: Calendar, label: "Study Planner" },
  { to: "/dashboard/smart", icon: Compass, label: "Smart Tutor" },
];

const socialLinks = [
  { to: "/dashboard/feed", icon: Rss, label: "Student Feed" },
  { to: "/dashboard/friends", icon: Users, label: "Friends" },
  { to: "/dashboard/groups", icon: UsersRound, label: "Study Groups" },
  { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
];

const bottomLinks = [
  { to: "/dashboard/profile", icon: User, label: "Profile & Settings" },
];

export default function Sidebar({ unreadCount = 0 }) {
  const linkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
    }`;

  return (
    <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-2.5">
        <Brain className="h-6 w-6 text-indigo-500" />
        <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
          Connectify
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Study Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600">Study</div>
          <nav className="space-y-1">
            {studyLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <link.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Social Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600">Community</div>
          <nav className="space-y-1">
            {socialLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <link.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
                {link.label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-600 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-zinc-900 space-y-1">
        {bottomLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            <link.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
