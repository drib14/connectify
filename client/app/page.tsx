import Image from "next/image";
import Link from "next/link";
import { 
  SignedIn, 
  SignedOut, 
  UserButton, 
  SignInButton 
} from "@clerk/nextjs";
import { 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  Brain, 
  Calendar, 
  BarChart2, 
  ArrowRight,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GraduationCap className="h-7 w-7 text-indigo-500" />
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Connectify
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#tutors" className="hover:text-zinc-100 transition-colors">AI Learning</a>
            <a href="#about" className="hover:text-zinc-100 transition-colors">Our Goal</a>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal"><button className="cursor-pointer text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2">Sign In</button></SignInButton>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-95"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 border border-zinc-850",
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
          {/* Neon background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide mb-6 animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>Introducing AI-Powered Study Companions</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight leading-[1.15] mb-6">
              Study{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Smarter
              </span>
              , Not Harder
            </h1>

            <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Meet Connectify, your intelligent learning companion. Generate study materials, analyze code, receive customized tutoring, and track your progress in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
              >
                Sign Up for Free <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 px-8 text-base font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="px-6 py-20 bg-zinc-950/50 border-t border-zinc-900 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Designed to Accelerate Your Learning
              </h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto">
                No filler. Connectify packs the exact tools you need to master any subject efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-indigo-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-300 transition-colors">Tutor AI Gateway</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Stuck on a problem? Ask Tutor AI. Gets to the core of difficult concepts in real time.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-violet-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-violet-300 transition-colors">Quiz AI Generator</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Turn study notes or text files into customized interactive quiz sessions immediately.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-indigo-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-300 transition-colors">Study Planner AI</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Optimize your calendar dynamically based on your learning speed and upcoming exams.
                </p>
              </div>

              {/* Card 4 */}
              <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-violet-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-violet-300 transition-colors">Weakness Analyzer</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Pinpoint exact topics where you run into errors and suggests specialized exercises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Focus Section */}
        <section id="tutors" className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-semibold mb-4">
                <Zap className="h-3.5 w-3.5" />
                <span>Next-Gen Study Workflow</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Active Learning Powered by Specialized Agents
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold text-zinc-100">Upload your study material</h4>
                    <p className="text-zinc-400 text-sm mt-1">Feed lecture notes, slides, books, or code. Our Note AI digests and organizes it.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-semibold text-xs shrink-0 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold text-zinc-100">Challenge yourself via Quiz AI</h4>
                    <p className="text-zinc-400 text-sm mt-1">Get tested on key concepts. The simulator adaptively focuses on your mistakes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold text-zinc-100">Engage with dedicated Tutor Agents</h4>
                    <p className="text-zinc-400 text-sm mt-1">Receive focused instruction mapping to your weak areas without getting overwhelmed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl border border-zinc-900 bg-zinc-900/10 p-2 overflow-hidden aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-xl" />
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">AI</div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Connectify Assistant</div>
                    <div className="text-[10px] text-zinc-400">Tutor Specialist</div>
                  </div>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed mb-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-900">
                  "Based on your last quiz, you are struggles with **Asynchronous JavaScript loops**. Let's review how the event loop manages promises inside `for...of` statements."
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Progress score: 84%</span>
                  <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">Start review →</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
            <span className="font-bold text-lg text-zinc-200">Connectify</span>
          </div>
          <p className="text-zinc-500 text-xs text-center md:text-left">
            &copy; 2026 Connectify AI. Building the future of intelligent learning companions.
          </p>
          <div className="flex gap-6 text-xs text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
