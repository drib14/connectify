import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import {
  Brain,
  BookOpen,
  HelpCircle,
  Layers,
  Calendar as CalendarIcon,
  BarChart2,
  User as UserIcon,
  MessageSquare,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Compass,
  ChevronsRight,
  TrendingUp,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  Flame,
  Star,
  CheckSquare,
  Square,
  Bookmark
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Profile data & state
  const [profileForm, setProfileForm] = useState({
    school: user?.school || "",
    grade: user?.grade || "",
    subjects: user?.subjects?.join(", ") || "",
    studyGoals: user?.studyGoals || "",
    preferredStudyTime: user?.preferredStudyTime || ""
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Progress metrics
  const [progressData, setProgressData] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTab, setNoteTab] = useState("summary");

  // Quiz state
  const [quizzes, setQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [selectedQuizNote, setSelectedQuizNote] = useState("");
  const [quizLength, setQuizLength] = useState(5);
  const [quizType, setQuizType] = useState("mixed");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Flashcards state
  const [flashSets, setFlashSets] = useState([]);
  const [isLoadingFlash, setIsLoadingFlash] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingFlash, setIsGeneratingFlash] = useState(false);

  // Planner state
  const [plannerData, setPlannerData] = useState(null);
  const [isLoadingPlanner, setIsLoadingPlanner] = useState(false);
  const [plannerForm, setPlannerForm] = useState({
    subjects: user?.subjects?.join(", ") || "Mathematics, Science, History",
    examDates: "Math Quiz on Friday, Science Final next Tuesday",
    studyHours: 2
  });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Coach state
  const [coachHistory, setCoachHistory] = useState([
    { sender: "tutor", text: "Hello! I am your AI Tutor Coach. What concept can I help you learn today? Let's go through the details together, and I'll test your knowledge at the end!" }
  ]);
  const [coachInput, setCoachInput] = useState("");
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [coachSuspensionMessage, setCoachSuspensionMessage] = useState("");

  // Smart Homework Helper state
  const [hwProblem, setHwProblem] = useState("");
  const [hwSolution, setHwSolution] = useState("");
  const [hwFeedback, setHwFeedback] = useState(null);
  const [isHwLoading, setIsHwLoading] = useState(false);

  // Concept Map state
  const [mapTopic, setMapTopic] = useState("");
  const [generatedMap, setGeneratedMap] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Initial load
  useEffect(() => {
    fetchProgress();
    fetchNotes();
    fetchQuizzes();
    fetchFlashcardSets();
    fetchPlanner();
  }, []);

  const fetchProgress = async () => {
    setIsLoadingProgress(true);
    try {
      const res = await apiFetch("/api/study/progress");
      if (res.ok) {
        const data = await res.json();
        setProgressData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const fetchNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const res = await apiFetch("/api/study/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const fetchQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const res = await apiFetch("/api/study/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const fetchFlashcardSets = async () => {
    setIsLoadingFlash(true);
    try {
      const res = await apiFetch("/api/study/flashcards");
      if (res.ok) {
        const data = await res.json();
        setFlashSets(data.sets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFlash(false);
    }
  };

  const fetchPlanner = async () => {
    setIsLoadingPlanner(true);
    try {
      const res = await apiFetch("/api/study/planner");
      if (res.ok) {
        const data = await res.json();
        setPlannerData(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPlanner(false);
    }
  };

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg("");
    try {
      const res = await apiFetch("/api/study/profile", {
        method: "POST",
        body: JSON.stringify({
          school: profileForm.school,
          grade: profileForm.grade,
          subjects: profileForm.subjects.split(",").map(s => s.trim()).filter(Boolean),
          studyGoals: profileForm.studyGoals,
          preferredStudyTime: profileForm.preferredStudyTime
        })
      });
      if (res.ok) {
        setProfileMsg("Student profile saved successfully.");
        fetchProgress();
      } else {
        setProfileMsg("Failed to update profile.");
      }
    } catch (err) {
      setProfileMsg("Error updating profile details.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Pledge reset AI access
  const handlePledgeReset = async () => {
    try {
      const res = await apiFetch("/api/study/profile/reset-ai", { method: "POST" });
      if (res.ok) {
        setCoachSuspensionMessage("");
        setProfileMsg("Connectify Study Pledge accepted! Your AI Tutor has been unlocked.");
        fetchProgress();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notes Generate
  const handleGenerateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    setIsGeneratingNote(true);
    try {
      const res = await apiFetch("/api/study/notes", {
        method: "POST",
        body: JSON.stringify({ title: noteTitle, content: noteContent })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setNoteTitle("");
        setNoteContent("");
        setSelectedNote(data.note);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  // Quiz Generate
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedQuizNote) return;
    setIsGeneratingQuiz(true);
    try {
      const res = await apiFetch("/api/study/quizzes", {
        method: "POST",
        body: JSON.stringify({
          noteId: selectedQuizNote,
          numQuestions: quizLength,
          questionType: quizType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes([data.quiz, ...quizzes]);
        setActiveQuiz(data.quiz);
        setQuizAnswers({});
        setQuizFeedback(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Quiz Submit
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    const answersArr = activeQuiz.questions.map((q, idx) => quizAnswers[idx] || "");
    try {
      const res = await apiFetch(`/api/study/quizzes/${activeQuiz._id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: answersArr })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizFeedback(data.quiz);
        fetchProgress();
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Flashcards Generate
  const handleGenerateFlash = async (noteId) => {
    setIsGeneratingFlash(true);
    try {
      const res = await apiFetch("/api/study/flashcards", {
        method: "POST",
        body: JSON.stringify({ noteId })
      });
      if (res.ok) {
        const data = await res.json();
        setFlashSets([data.flashcardSet, ...flashSets]);
        setSelectedSet(data.flashcardSet);
        setCurrentCardIdx(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFlash(false);
    }
  };

  // Rate Flashcard
  const handleRateCard = async (difficulty) => {
    if (!selectedSet) return;
    const card = selectedSet.cards[currentCardIdx];
    try {
      const res = await apiFetch(`/api/study/flashcards/${selectedSet._id}`, {
        method: "PUT",
        body: JSON.stringify({
          cardId: card._id,
          difficulty
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedSet(data.flashcardSet);
        if (currentCardIdx < selectedSet.cards.length - 1) {
          setCurrentCardIdx(currentCardIdx + 1);
          setIsFlipped(false);
        } else {
          // Finished set
          alert("Flashcard set review completed!");
          setSelectedSet(null);
          fetchFlashcardSets();
          fetchProgress();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Plan
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setIsGeneratingPlan(true);
    try {
      const res = await apiFetch("/api/study/planner", {
        method: "POST",
        body: JSON.stringify({
          subjects: plannerForm.subjects.split(",").map(s => s.trim()),
          examDates: plannerForm.examDates,
          studyHours: Number(plannerForm.studyHours)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPlannerData(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Complete task
  const handleToggleTask = async (date, taskId, completed) => {
    try {
      const res = await apiFetch("/api/study/planner/toggle-task", {
        method: "POST",
        body: JSON.stringify({ date, taskId, completed })
      });
      if (res.ok) {
        const data = await res.json();
        setPlannerData(data.plan);
        fetchProgress();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coach Send Message
  const handleCoachSend = async (e) => {
    e.preventDefault();
    if (!coachInput.trim()) return;

    const userMessage = { sender: "user", text: coachInput };
    setCoachHistory(prev => [...prev, userMessage]);
    setCoachInput("");
    setIsCoachLoading(true);
    setCoachSuspensionMessage("");

    try {
      const res = await apiFetch("/api/study/coach", {
        method: "POST",
        body: JSON.stringify({
          prompt: userMessage.text,
          chatHistory: coachHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCoachHistory(prev => [
          ...prev,
          { sender: "tutor", text: data.response },
          { sender: "tutor", text: data.followUp, isFollowUp: true }
        ]);
        fetchProgress();
      } else {
        // Handle cheating suspension trigger
        if (res.status === 403) {
          setCoachSuspensionMessage(data.error);
          fetchProgress(); // Reload user state
        } else {
          setCoachHistory(prev => [
            ...prev,
            { sender: "tutor", text: data.error || "I ran into a connection glitch. Let's try again!" }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // Homework Helper Send
  const handleHwSend = async (e) => {
    e.preventDefault();
    if (!hwProblem.trim()) return;
    setIsHwLoading(true);
    setHwFeedback(null);

    try {
      const res = await apiFetch("/api/study/homework-helper", {
        method: "POST",
        body: JSON.stringify({ problem: hwProblem, studentSolution: hwSolution })
      });
      const data = await res.json();
      if (res.ok) {
        setHwFeedback(data);
        fetchProgress();
      } else {
        if (res.status === 403) {
          setCoachSuspensionMessage(data.error);
          setActiveTab("profile"); // Redirect to pledge to unlock
        } else {
          alert(data.error || "Failed to process solution.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHwLoading(false);
    }
  };

  // Concept Map Send
  const handleMapSend = async (e) => {
    e.preventDefault();
    if (!mapTopic.trim()) return;
    setIsMapLoading(true);
    setGeneratedMap(null);

    try {
      const res = await apiFetch("/api/study/concept-map", {
        method: "POST",
        body: JSON.stringify({ topic: mapTopic })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedMap(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMapLoading(false);
    }
  };

  // Render suspension cover
  const isUserSuspended = progressData?.user?.aiTokenSuspended || user?.aiTokenSuspended;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Connectify</span>
          </div>

          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "overview" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <BarChart2 className="h-4 w-4" /> Progress Overview
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "coach" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <MessageSquare className="h-4 w-4" /> AI Study Coach
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "notes" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <BookOpen className="h-4 w-4" /> AI Notes summary
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "quizzes" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <HelpCircle className="h-4 w-4" /> AI Quiz Generator
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "flashcards" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Layers className="h-4 w-4" /> AI Flashcards
            </button>
            <button
              onClick={() => setActiveTab("planner")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "planner" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <CalendarIcon className="h-4 w-4" /> Study Planner
            </button>
            <button
              onClick={() => setActiveTab("smart")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "smart" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Compass className="h-4 w-4" /> Smart Tutor Suite
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "profile" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <UserIcon className="h-4 w-4" /> Profile & Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-900 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full border border-zinc-800 object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user?.username}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-rose-500 hover:text-rose-400 font-semibold cursor-pointer shrink-0">
            Exit
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 bg-zinc-950 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 px-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          {progressData?.user?.studyStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold">
              <Flame className="h-3.5 w-3.5 fill-orange-500 animate-pulse" />
              <span>{progressData.user.studyStreak} Day Streak!</span>
            </div>
          )}
        </header>

        <div className="flex-1 p-8">
          {/* Active Tab Panel Renderer */}

          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500">Study Streak</div>
                    <div className="text-2xl font-bold text-zinc-100">{progressData?.user?.studyStreak || 0} Days</div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500">Total Minutes</div>
                    <div className="text-2xl font-bold text-zinc-100">{progressData?.user?.totalStudyTime || 0} mins</div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500">Quizzes Solved</div>
                    <div className="text-2xl font-bold text-zinc-100">{progressData?.totalQuizzes || 0}</div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500">Avg Quiz Accuracy</div>
                    <div className="text-2xl font-bold text-zinc-100">{progressData?.avgQuizScore || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Weekly Tracker & Daily Goals */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                  <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-400" /> Weekly Learning Progress
                  </h3>
                  <div className="h-48 flex items-end justify-between px-2 pt-6">
                    {/* Simulated visual bar charts */}
                    {[
                      { day: "Mon", hr: 45 },
                      { day: "Tue", hr: 60 },
                      { day: "Wed", hr: 30 },
                      { day: "Thu", hr: 90 },
                      { day: "Fri", hr: 120 },
                      { day: "Sat", hr: 0 },
                      { day: "Sun", hr: 15 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-8 bg-zinc-900 rounded-t-md relative h-36 overflow-hidden flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-1000"
                            style={{ height: `${(item.hr / 120) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                  <h3 className="text-md font-bold text-zinc-200">Daily Study Objectives</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/50">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs text-zinc-300">Interact with Study Coach AI</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/50">
                      <CheckCircle2 className="h-4 w-4 text-zinc-600" />
                      <span className="text-xs text-zinc-400">Add 1 lesson note & generate summary</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/50">
                      <CheckCircle2 className="h-4 w-4 text-zinc-600" />
                      <span className="text-xs text-zinc-400">Complete 1 practice quiz</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STUDY COACH */}
          {activeTab === "coach" && (
            <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
              {coachSuspensionMessage ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-rose-500/20 bg-rose-500/5 rounded-2xl max-w-2xl mx-auto text-center">
                  <AlertTriangle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">Connectify AI Token Blocked</h3>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    {coachSuspensionMessage}
                  </p>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="cursor-pointer inline-flex h-10 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
                  >
                    Go to Profile to Unlock AI
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
                    {coachHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : msg.isFollowUp
                              ? "bg-violet-950/30 border border-violet-500/20 text-violet-300 rounded-bl-none font-medium italic"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isCoachLoading && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none p-4 text-sm text-zinc-400 flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> Connecting to Study Coach...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleCoachSend} className="flex gap-2">
                    <input
                      type="text"
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                      placeholder="Ask the AI Tutor Coach to explain concepts or provide analogies..."
                      disabled={isCoachLoading}
                      className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isCoachLoading || !coachInput.trim()}
                      className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                    >
                      Ask Tutor
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* 3. AI NOTES SUMMARY */}
          {activeTab === "notes" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Creator Box */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
                <h3 className="text-md font-bold text-zinc-200">Digested Study Material</h3>
                <form onSubmit={handleGenerateNote} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Lesson/Note Title
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Asynchronous JavaScript & Promises"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Lesson Content / Raw Text
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Paste your study materials, lecture transcripts, or textbook chapters here..."
                      rows={10}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGeneratingNote || !noteTitle || !noteContent}
                    className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isGeneratingNote ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Digesting Notes...
                      </span>
                    ) : (
                      "Summarize & Digest Material"
                    )}
                  </button>
                </form>
              </div>

              {/* Notes List & Viewer */}
              <div className="lg:col-span-2 space-y-6">
                {selectedNote ? (
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                      <div>
                        <button
                          onClick={() => setSelectedNote(null)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-1 block"
                        >
                          &larr; Back to Notes List
                        </button>
                        <h3 className="text-lg font-bold text-zinc-100">{selectedNote.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateFlash(selectedNote._id)}
                          disabled={isGeneratingFlash}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
                        >
                          {isGeneratingFlash ? "Generating cards..." : "Build Flashcards"}
                        </button>
                      </div>
                    </div>

                    {/* Note Navigation Tabs */}
                    <div className="flex border-b border-zinc-900 text-xs">
                      {[
                        { id: "summary", label: "AI Summary" },
                        { id: "points", label: "Key points" },
                        { id: "terms", label: "Vocabulary Terms" },
                        { id: "objectives", label: "Learning Objectives" },
                        { id: "formulas", label: "Formulas" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setNoteTab(tab.id)}
                          className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
                            noteTab === tab.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab contents */}
                    <div className="pt-2 text-sm leading-relaxed text-zinc-300">
                      {noteTab === "summary" && (
                        <p>{selectedNote.summary || "No summary generated for this note."}</p>
                      )}
                      {noteTab === "points" && (
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedNote.keyPoints?.map((p, idx) => <li key={idx}>{p}</li>) || "No key points available."}
                        </ul>
                      )}
                      {noteTab === "terms" && (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {selectedNote.terms?.map((t, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/45">
                              <div className="font-semibold text-indigo-300 mb-1">{t.term}</div>
                              <div className="text-xs text-zinc-400">{t.definition}</div>
                            </div>
                          )) || "No terms generated."}
                        </div>
                      )}
                      {noteTab === "objectives" && (
                        <ul className="list-decimal pl-5 space-y-2">
                          {selectedNote.objectives?.map((o, idx) => <li key={idx}>{o}</li>) || "No goals available."}
                        </ul>
                      )}
                      {noteTab === "formulas" && (
                        <div className="space-y-2">
                          {selectedNote.formulas?.length > 0 ? (
                            selectedNote.formulas.map((f, idx) => (
                              <div key={idx} className="p-3 bg-zinc-950/45 rounded-lg border border-zinc-900 font-mono text-center text-zinc-200">
                                {f}
                              </div>
                            ))
                          ) : (
                            <p className="text-zinc-500 italic">No formulas parsed in this lesson.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                    <h3 className="text-md font-bold text-zinc-200">Digest Database</h3>
                    {isLoadingNotes ? (
                      <div className="text-zinc-500 text-sm">Loading notes...</div>
                    ) : notes.length === 0 ? (
                      <div className="text-zinc-500 text-sm italic">No digested materials found. Paste one to get started!</div>
                    ) : (
                      <div className="divide-y divide-zinc-900">
                        {notes.map(note => (
                          <div
                            key={note._id}
                            onClick={() => { setSelectedNote(note); setNoteTab("summary"); }}
                            className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 px-2 rounded-lg transition-colors group"
                          >
                            <div>
                              <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{note.title}</div>
                              <div className="text-[10px] text-zinc-500">{new Date(note.createdAt).toLocaleDateString()}</div>
                            </div>
                            <ChevronsRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. AI QUIZ GENERATOR */}
          {activeTab === "quizzes" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quiz Creator */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
                <h3 className="text-md font-bold text-zinc-200">Create Study Quiz</h3>
                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Source digested note
                    </label>
                    <select
                      value={selectedQuizNote}
                      onChange={(e) => setSelectedQuizNote(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                      required
                    >
                      <option value="">-- Choose a Note --</option>
                      {notes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={quizLength}
                      onChange={(e) => setQuizLength(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Question Type
                    </label>
                    <select
                      value={quizType}
                      onChange={(e) => setQuizType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="mixed">Mixed Types</option>
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="tf">True / False</option>
                      <option value="fill">Fill in the Blank</option>
                      <option value="short">Short Answer</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingQuiz || !selectedQuizNote}
                    className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isGeneratingQuiz ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Building Quiz...
                      </span>
                    ) : (
                      "Generate Custom Quiz"
                    )}
                  </button>
                </form>
              </div>

              {/* Active Quiz or Quiz History */}
              <div className="lg:col-span-2 space-y-6">
                {activeQuiz ? (
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                      <h3 className="text-lg font-bold text-zinc-100">{activeQuiz.title}</h3>
                      <button
                        onClick={() => { setActiveQuiz(null); setQuizFeedback(null); }}
                        className="text-xs text-rose-500 hover:text-rose-400 font-semibold"
                      >
                        Exit Quiz
                      </button>
                    </div>

                    {quizFeedback ? (
                      // Quiz review
                      <div className="space-y-6">
                        <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-center">
                          <div className="text-3xl font-bold text-indigo-400">{quizFeedback.score} / {quizFeedback.maxScore}</div>
                          <p className="text-xs text-zinc-400 mt-1">Great attempt! Review explanations below to address weaknesses.</p>
                        </div>

                        <div className="space-y-4">
                          {quizFeedback.questions.map((q, idx) => {
                            const studentAns = quizFeedback.answers[idx] || "";
                            const isCorrect = studentAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
                            return (
                              <div key={idx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 space-y-2">
                                <div className="text-sm font-semibold text-zinc-200">Q{idx + 1}: {q.question}</div>
                                <div className="text-xs space-y-1">
                                  <div className="text-zinc-400">Your Answer: <span className={isCorrect ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{studentAns || "(No Answer)"}</span></div>
                                  {!isCorrect && <div className="text-zinc-400">Correct Answer: <span className="text-emerald-400 font-semibold">{q.answer}</span></div>}
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-900 pt-2 mt-2">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Taking Quiz
                      <form onSubmit={handleQuizSubmit} className="space-y-6">
                        {activeQuiz.questions.map((q, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 space-y-3">
                            <div className="text-sm font-semibold text-zinc-200">Q{idx + 1}: {q.question}</div>

                            {q.questionType === "mcq" || q.questionType === "tf" ? (
                              <div className="grid sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => (
                                  <label
                                    key={oIdx}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                      quizAnswers[idx] === opt
                                        ? "border-indigo-500 bg-indigo-500/5 text-indigo-400"
                                        : "border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${idx}`}
                                      value={opt}
                                      checked={quizAnswers[idx] === opt}
                                      onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: opt })}
                                      className="hidden"
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              // Text answers
                              <input
                                type="text"
                                placeholder="Type your answer here..."
                                value={quizAnswers[idx] || ""}
                                onChange={(e) => setQuizAnswers({ ...quizAnswers, [idx]: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
                              />
                            )}
                          </div>
                        ))}

                        <button
                          type="submit"
                          disabled={isSubmittingQuiz}
                          className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
                        >
                          {isSubmittingQuiz ? "Submitting answers..." : "Submit Quiz"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                    <h3 className="text-md font-bold text-zinc-200">Completed Sessions</h3>
                    {isLoadingQuizzes ? (
                      <div className="text-zinc-500 text-sm">Loading quizzes...</div>
                    ) : quizzes.length === 0 ? (
                      <div className="text-zinc-500 text-sm italic">No completed quizzes. Create one above!</div>
                    ) : (
                      <div className="divide-y divide-zinc-900">
                        {quizzes.map(qz => (
                          <div
                            key={qz._id}
                            onClick={() => { setActiveQuiz(qz); setQuizFeedback(qz.completed ? qz : null); }}
                            className="py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 px-2 rounded-lg transition-colors group"
                          >
                            <div>
                              <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{qz.title}</div>
                              <div className="text-[10px] text-zinc-500">{qz.completed ? `Score: ${qz.score}/${qz.maxScore}` : "Incomplete"} &bull; {new Date(qz.createdAt).toLocaleDateString()}</div>
                            </div>
                            <ChevronsRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. AI FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Flashcard Sets List */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
                <h3 className="text-md font-bold text-zinc-200">Flashcard Sets</h3>
                {isLoadingFlash ? (
                  <div className="text-zinc-500 text-sm">Loading sets...</div>
                ) : flashSets.length === 0 ? (
                  <div className="text-zinc-500 text-sm italic">No flashcards found. Create a digested note first, then click "Build Flashcards".</div>
                ) : (
                  <div className="space-y-2">
                    {flashSets.map(set => (
                      <button
                        key={set._id}
                        onClick={() => { setSelectedSet(set); setCurrentCardIdx(0); setIsFlipped(false); }}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between group ${
                          selectedSet?._id === set._id ? "border-indigo-500 bg-indigo-500/5 text-indigo-400" : "border-zinc-900 bg-zinc-950 hover:bg-zinc-900/40 text-zinc-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold group-hover:text-indigo-400 transition-colors">{set.title}</div>
                          <div className="text-[10px] text-zinc-500">{set.cards.length} cards &bull; Reviewed {set.reviewedCount || 0} times</div>
                        </div>
                        <ChevronsRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected card viewer */}
              <div className="lg:col-span-2">
                {selectedSet ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-bold text-zinc-200">{selectedSet.title}</h3>
                      <span className="text-xs text-zinc-500">Card {currentCardIdx + 1} of {selectedSet.cards.length}</span>
                    </div>

                    {/* Flippable card */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="h-64 border border-zinc-900 rounded-3xl bg-zinc-900/10 backdrop-blur-md flex items-center justify-center p-8 cursor-pointer relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5" />
                      <div className="text-center relative z-10 space-y-4">
                        <div className="text-xs uppercase font-bold text-zinc-600 tracking-widest">{isFlipped ? "Answer" : "Question"}</div>
                        <p className="text-base sm:text-lg font-semibold text-zinc-100 max-w-md leading-relaxed">
                          {isFlipped ? selectedSet.cards[currentCardIdx].answer : selectedSet.cards[currentCardIdx].question}
                        </p>
                        <div className="text-[10px] text-zinc-500 mt-4 italic">Click card to flip</div>
                      </div>
                    </div>

                    {/* Card Actions & Navigation */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-900 pt-4">
                      {/* Performance metrics rating */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleRateCard("easy")}
                          className="cursor-pointer flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                        >
                          Easy
                        </button>
                        <button
                          onClick={() => handleRateCard("medium")}
                          className="cursor-pointer flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                        >
                          Medium
                        </button>
                        <button
                          onClick={() => handleRateCard("hard")}
                          className="cursor-pointer flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                        >
                          Hard
                        </button>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            if (currentCardIdx > 0) {
                              setCurrentCardIdx(currentCardIdx - 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === 0}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-xs text-zinc-400 disabled:opacity-30"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            if (currentCardIdx < selectedSet.cards.length - 1) {
                              setCurrentCardIdx(currentCardIdx + 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === selectedSet.cards.length - 1}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-xs text-zinc-400 disabled:opacity-30"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    <Layers className="h-10 w-10 text-zinc-700 mb-2" />
                    <h4 className="text-sm font-semibold text-zinc-300">No active set review</h4>
                    <p className="text-xs text-zinc-500 mt-1">Select a flashcard set from the list to begin study.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. STUDY PLANNER */}
          {activeTab === "planner" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Parameters input */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
                <h3 className="text-md font-bold text-zinc-200">Planner Settings</h3>
                <form onSubmit={handleGeneratePlan} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Subjects (comma separated)
                    </label>
                    <input
                      type="text"
                      value={plannerForm.subjects}
                      onChange={(e) => setPlannerForm({ ...plannerForm, subjects: e.target.value })}
                      placeholder="e.g. Mathematics, Biology, Chemistry"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Exam dates or notes
                    </label>
                    <input
                      type="text"
                      value={plannerForm.examDates}
                      onChange={(e) => setPlannerForm({ ...plannerForm, examDates: e.target.value })}
                      placeholder="e.g. Math midterm next Monday"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Available hours / day
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={plannerForm.studyHours}
                      onChange={(e) => setPlannerForm({ ...plannerForm, studyHours: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2 text-zinc-100 text-sm focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingPlan || !plannerForm.subjects}
                    className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isGeneratingPlan ? "Scheduling calendar..." : "Generate AI Study Schedule"}
                  </button>
                </form>
              </div>

              {/* Schedule layout */}
              <div className="lg:col-span-2 space-y-6">
                {isLoadingPlanner ? (
                  <div className="text-zinc-500 text-sm">Loading study plan...</div>
                ) : plannerData?.schedules?.length > 0 ? (
                  <div className="space-y-6">
                    {plannerData.schedules.map((day, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-3">
                        <div className="text-sm font-bold text-indigo-400 pb-2 border-b border-zinc-900">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </div>

                        <div className="space-y-2">
                          {day.tasks.map((task) => (
                            <div
                              key={task._id}
                              onClick={() => handleToggleTask(day.date, task._id, !task.completed)}
                              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/30 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                {task.completed ? (
                                  <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
                                ) : (
                                  <Square className="h-4.5 w-4.5 text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                                )}
                                <div>
                                  <div className={`text-xs font-semibold ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                    {task.taskName}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">{task.subject}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold text-zinc-500">{task.duration} mins</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    <CalendarIcon className="h-10 w-10 text-zinc-700 mb-2" />
                    <h4 className="text-sm font-semibold text-zinc-300">No active calendar</h4>
                    <p className="text-xs text-zinc-500 mt-1">Configure subjects and study hours on the left to map your learning sessions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. SMART TUTOR SUITE */}
          {activeTab === "smart" && (
            <div className="space-y-8">
              {/* Weakness Detector */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                  <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> AI Weakness Detector
                  </h3>
                  {progressData?.gaps?.weakTopics?.length > 0 ? (
                    <div className="space-y-3">
                      {progressData.gaps.weakTopics.map((g, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/45 space-y-1">
                          <div className="text-xs font-bold text-rose-400">{g.topic}</div>
                          <p className="text-xs text-zinc-400">{g.reason}</p>
                          <div className="text-[10px] text-indigo-400 mt-2"><strong>Recommended:</strong> {g.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs italic">Complete quizzes and fail attempts to allow the AI to pinpoint learning weaknesses.</p>
                  )}
                </div>

                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                  <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI Strengths & Goals
                  </h3>
                  <div>
                    <div className="text-xs font-bold text-zinc-300 mb-2">Mastered Concept Areas:</div>
                    {progressData?.gaps?.strongTopics?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {progressData.gaps.strongTopics.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-xs italic">Take high accuracy quizzes to verify concept mastery.</p>
                    )}
                  </div>

                  <div className="border-t border-zinc-900 pt-4">
                    <div className="text-xs font-bold text-zinc-300 mb-2">Suggested Next Steps:</div>
                    <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
                      {progressData?.gaps?.nextActionSteps?.map((a, idx) => <li key={idx}>{a}</li>) || (
                        <li>Read a notes package and request a quiz.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Concept Map Generator */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-400" /> AI Concept Maps
                </h3>
                <form onSubmit={handleMapSend} className="flex gap-2">
                  <input
                    type="text"
                    value={mapTopic}
                    onChange={(e) => setMapTopic(e.target.value)}
                    placeholder="Enter a subject or concept to map (e.g. Relational Databases)..."
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-4 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isMapLoading || !mapTopic.trim()}
                    className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-5 text-xs font-semibold text-white transition-all hover:bg-indigo-500"
                  >
                    {isMapLoading ? "Building Map..." : "Map Topic"}
                  </button>
                </form>

                {generatedMap ? (
                  <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 flex flex-col md:flex-row gap-8 items-center justify-center">
                    {/* Simplified UI layout for concept hierarchies */}
                    <div className="flex flex-col gap-6 items-center">
                      {generatedMap.nodes?.map((node) => (
                        <div key={node.id} className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-bold shadow-lg shadow-indigo-500/5 min-w-[150px] text-center relative">
                          {node.label}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-zinc-500 max-w-sm space-y-2 leading-relaxed">
                      <div className="font-bold text-zinc-300">Generated Links:</div>
                      {generatedMap.links?.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-indigo-400 font-semibold">{link.source}</span>
                          <span>&rarr;</span>
                          <span className="italic">({link.label})</span>
                          <span>&rarr;</span>
                          <span className="text-violet-400 font-semibold">{link.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No concepts mapped yet.</p>
                )}
              </div>

              {/* Homework Helper */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" /> AI Homework Helper (Tutor Mode)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stuck on a question? Paste it below. The Homework helper provides concept breakdown steps and checks your answers, but will **NOT** give direct solutions.
                </p>

                <form onSubmit={handleHwSend} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Homework Problem Description
                      </label>
                      <textarea
                        value={hwProblem}
                        onChange={(e) => setHwProblem(e.target.value)}
                        placeholder="Write the equation, programming task, or essay question..."
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 resize-none focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Your Proposed Answer or Work (Optional)
                      </label>
                      <textarea
                        value={hwSolution}
                        onChange={(e) => setHwSolution(e.target.value)}
                        placeholder="Paste your attempt here. The AI will evaluate your work and identify flaws."
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 resize-none focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isHwLoading || !hwProblem.trim()}
                    className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isHwLoading ? "Analyzing Problem..." : "Request Hints & Review"}
                  </button>
                </form>

                {hwFeedback && (
                  <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950 space-y-4 text-xs leading-relaxed">
                    <div>
                      <div className="font-bold text-indigo-400 mb-1">Method Breakdown Steps:</div>
                      <ol className="list-decimal pl-5 space-y-1 text-zinc-300">
                        {hwFeedback.steps?.map((st, idx) => <li key={idx}>{st}</li>)}
                      </ol>
                    </div>

                    <div>
                      <div className="font-bold text-violet-400 mb-1">Clues & Hints:</div>
                      <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                        {hwFeedback.hints?.map((hn, idx) => <li key={idx}>{hn}</li>)}
                      </ul>
                    </div>

                    {hwFeedback.feedbackOnSolution && (
                      <div>
                        <div className="font-bold text-zinc-200 mb-1">Review of your attempt:</div>
                        <p className="text-zinc-400">{hwFeedback.feedbackOnSolution}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. PROFILE & SETTINGS */}
          {activeTab === "profile" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile setup */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <h3 className="text-md font-bold text-zinc-200">Student Profile Settings</h3>

                {profileMsg && (
                  <div className="p-3 text-xs rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-semibold">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        School / Institution
                      </label>
                      <input
                        type="text"
                        value={profileForm.school}
                        onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                        placeholder="e.g. University of Science"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Grade / Year
                      </label>
                      <input
                        type="text"
                        value={profileForm.grade}
                        onChange={(e) => setProfileForm({ ...profileForm, grade: e.target.value })}
                        placeholder="e.g. Sophomore"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Subjects (comma separated)
                    </label>
                    <input
                      type="text"
                      value={profileForm.subjects}
                      onChange={(e) => setProfileForm({ ...profileForm, subjects: e.target.value })}
                      placeholder="e.g. Mathematics, Computer Science, Literature"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Study Goals description
                      </label>
                      <input
                        type="text"
                        value={profileForm.studyGoals}
                        onChange={(e) => setProfileForm({ ...profileForm, studyGoals: e.target.value })}
                        placeholder="e.g. Ace final exams and learn coding concepts"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Preferred Study Hours / Time
                      </label>
                      <input
                        type="text"
                        value={profileForm.preferredStudyTime}
                        onChange={(e) => setProfileForm({ ...profileForm, preferredStudyTime: e.target.value })}
                        placeholder="e.g. 18:00 - 20:00"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-6 text-xs font-semibold text-white transition-all hover:bg-indigo-500"
                  >
                    {isUpdatingProfile ? "Saving Settings..." : "Save Settings"}
                  </button>
                </form>
              </div>

              {/* Study Pledge Check */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <h3 className="text-md font-bold text-zinc-200">Connectify Pledge</h3>
                {isUserSuspended ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl text-center">
                      <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-rose-400">AI Tutor Access Suspended</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Suspended: {progressData?.user?.aiSuspensionReason || "Shortcuts detected."}</p>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Connectify is designed to act as your conceptual study companion. Direct requests for answers or completed code restrict active learning and are blocked.
                    </p>

                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-indigo-400">The Connectify Study Pledge:</div>
                      <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                        "I promise to use Connectify AI to learn, analyze, and understand. I will seek explanations, guides, and hints instead of asking the coach to write code or solve problems directly for me."
                      </p>
                    </div>

                    <button
                      onClick={handlePledgeReset}
                      className="cursor-pointer w-full inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white transition-all hover:bg-indigo-500"
                    >
                      Acknowledge Pledge & Unlock AI
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-zinc-200">AI Tutor Fully Active</h4>
                    <p className="text-xs text-zinc-500 mt-1">Excellent job! You are using the tutor correctly to learn step-by-step.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
