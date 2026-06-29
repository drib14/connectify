import { useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import useAuthStore from "../../stores/auth-store";
import useStudyStore from "../../stores/study-store";
import Avatar from "../ui/Avatar";
import Logo from "../Logo";
import {
  Flame, LogOut, BarChart2, BookOpen, HelpCircle,
  Layers, Calendar, Compass, MessageSquare, User
} from "lucide-react";

export default function DashboardLayout() {
  const { user, loading, logout } = useAuthStore();
  const { fetchProgress } = useStudyStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const navItems = [
    { to: "/dashboard", icon: BarChart2, label: "Overview", end: true },
    { to: "/dashboard/coach", icon: MessageSquare, label: "AI Coach" },
    { to: "/dashboard/notes", icon: BookOpen, label: "Notes" },
    { to: "/dashboard/quizzes", icon: HelpCircle, label: "Quizzes" },
    { to: "/dashboard/flashcards", icon: Layers, label: "Flashcards" },
    { to: "/dashboard/planner", icon: Calendar, label: "Planner" },
    { to: "/dashboard/smart", icon: Compass, label: "Tutor" },
    { to: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans antialiased">
      
      {/* 1. SOCIAL-MEDIA STYLE STICKY TOP HEADER */}
      <header className="h-16 px-4 md:px-6 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
        
        {/* Left Side: Logo & Branding */}
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-indigo-500 shrink-0" />
          <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent hidden sm:inline">
            Connectify
          </span>
        </div>

        {/* Center: Main Navigation Tabs (Hidden on mobile, visible on tablet & desktop) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5 h-full">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-2.5 lg:px-3.5 h-full text-xs font-semibold tracking-wide transition-all border-b-2 hover:text-zinc-200 ${
                  isActive
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/[0.02]"
                    : "border-transparent text-zinc-450 hover:border-zinc-800"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Side: Stats & User Identity */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {user.studyStreak > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] sm:text-[11px] font-extrabold shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-amber-500" />
              <span>{user.studyStreak}d</span>
            </div>
          )}

          <div className="flex items-center gap-2 border-l border-zinc-900 pl-2 sm:pl-3.5">
            <Avatar src={user.avatar} name={user.username} size="sm" />
            <span className="text-xs font-extrabold text-zinc-300 hidden xl:inline">{user.username}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="cursor-pointer h-8 w-8 rounded-lg border border-zinc-900 bg-zinc-950 hover:bg-zinc-900/60 hover:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT (Bottom padding on mobile to account for bottom navigation) */}
      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION TAB BAR (Visible on mobile viewports strictly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.55)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-11 h-11 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-400 bg-indigo-500/5 font-extrabold scale-110"
                  : "text-zinc-500 hover:text-zinc-300"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            <span className="text-[8px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
