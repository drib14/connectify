import { useEffect, useState } from "react";
import useStudyStore from "../../stores/study-store";
import useAuthStore from "../../stores/auth-store";
import StatCard from "../../components/ui/StatCard";
import Avatar from "../../components/ui/Avatar";
import { apiFetch } from "../../lib/api";
import { Flame, Clock, CheckCircle2, Award, TrendingUp, Users, BookOpen } from "lucide-react";

export default function OverviewPage() {
  const { progress, progressLoading, fetchProgress } = useStudyStore();
  const user = useAuthStore((s) => s.user);
  const [classmates, setClassmates] = useState([]);
  const [classmatesLoading, setClassmatesLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchProgress();
    fetchClassmates();
  }, [fetchProgress]);

  const fetchClassmates = async () => {
    setClassmatesLoading(true);
    try {
      const res = await apiFetch("/api/study/users");
      if (res.ok) {
        const data = await res.json();
        setClassmates(data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
    setClassmatesLoading(false);
  };

  const handleViewStudent = async (studentId) => {
    setStatsLoading(true);
    setSelectedStudent(null);
    setStudentStats(null);
    try {
      const res = await apiFetch(`/api/study/users/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudent(data.user);
        setStudentStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
    setStatsLoading(false);
  };

  const u = progress?.user || user || {};

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Welcome back, {u.username || "Student"} 👋</h1>
          <p className="text-sm text-zinc-500 mt-1">Here's how your learning journey is progressing.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[11px] font-bold">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Active Learning Desk</span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Flame} label="Study Streak" value={`${u.studyStreak || 0} Days`} color="orange" />
        <StatCard icon={Clock} label="Total Study Time" value={`${u.totalStudyTime || 0} mins`} color="indigo" />
        <StatCard icon={CheckCircle2} label="Quizzes Completed" value={progress?.totalQuizzes || 0} color="violet" />
        <StatCard icon={Award} label="Avg Quiz Accuracy" value={`${progress?.avgQuizScore || 0}%`} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly activity chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" /> Weekly Learning Tracker
          </h3>
          <div className="h-48 flex items-end justify-between px-2 pt-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
              // Calculate realistic height based on study stats or fallback to design curves
              const heights = [
                Math.min(120, (u.totalStudyTime || 0) * 0.4 + 10),
                Math.min(120, (progress?.totalQuizzes || 0) * 20 + 20),
                Math.min(120, (u.studyStreak || 0) * 15 + 15),
                45, 60, 30, 90
              ];
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8 bg-zinc-900/40 rounded-t-md relative h-36 overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t transition-all duration-700"
                      style={{ height: `${(heights[idx] / 120) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Goals Checklists */}
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Daily Study Goals</h3>
          <div className="space-y-2.5">
            {[
              { text: "Study with AI Coach", done: (u.totalStudyTime || 0) > 0 },
              { text: "Add 1 lesson note summary", done: (progress?.totalFlashcardsReviewed || 0) > 0 },
              { text: "Complete 1 practice quiz", done: (progress?.totalQuizzes || 0) > 0 },
              { text: "Review flashcards", done: (progress?.totalFlashcardsReviewed || 0) > 0 },
            ].map((goal, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-900 bg-zinc-950/50">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${goal.done ? "text-emerald-500" : "text-zinc-700"}`} />
                <span className={`text-xs ${goal.done ? "text-zinc-300" : "text-zinc-500"}`}>{goal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakness insights */}
      {progress?.gaps?.weakTopics?.length > 0 && (
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10">
          <h3 className="text-sm font-bold text-zinc-200 mb-4">AI-Detected Weak Areas</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.gaps.weakTopics.map((g, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
                <div className="text-xs font-bold text-rose-400 mb-1">{g.topic}</div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">{g.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER MANAGEMENT SYSTEM: Classmates stand-in stand directory */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Classmates standings board */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" /> Classmates Standing Directory
          </h3>

          {classmatesLoading ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Loading standings...</p>
          ) : classmates.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center italic">No other registered students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500">
                    <th className="py-2.5">Student</th>
                    <th className="py-2.5">School</th>
                    <th className="py-2.5">Streak</th>
                    <th className="py-2.5">Study Time</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {classmates.map((student) => (
                    <tr key={student._id} className="hover:bg-zinc-900/20">
                      <td className="py-3 flex items-center gap-2">
                        <Avatar src={student.avatar} name={student.username} size="sm" />
                        <span className="font-semibold text-zinc-200">{student.username}</span>
                      </td>
                      <td className="py-3">{student.school || "Connectify User"}</td>
                      <td className="py-3 font-semibold text-orange-400">🔥 {student.studyStreak || 0} days</td>
                      <td className="py-3 font-semibold text-indigo-400">{student.totalStudyTime || 0}m</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleViewStudent(student._id)}
                          className="cursor-pointer text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md"
                        >
                          View Stats
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Student Details Panel */}
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Student Profile Analyzer</h3>
          
          {statsLoading ? (
            <p className="text-xs text-zinc-500 py-12 text-center">Loading profile details...</p>
          ) : !selectedStudent ? (
            <div className="text-center py-12 text-zinc-650 text-xs italic">
              Select a student from the directory on the left to analyze their public study statistics.
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <Avatar src={selectedStudent.avatar} name={selectedStudent.username} size="md" />
                <div>
                  <div className="text-xs font-bold text-zinc-200">{selectedStudent.username}</div>
                  <div className="text-[10px] text-zinc-500">{selectedStudent.school || "Student Network"}</div>
                </div>
              </div>

              {selectedStudent.bio && (
                <p className="text-[11px] text-zinc-400 italic bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900/60 leading-relaxed">
                  "{selectedStudent.bio}"
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                  <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Lesson Notes</div>
                  <div className="text-zinc-200 font-bold mt-0.5">{studentStats?.notesCount || 0} Summarized</div>
                </div>
                <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                  <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Practice Quizzes</div>
                  <div className="text-zinc-200 font-bold mt-0.5">{studentStats?.quizzesCount || 0} Finished</div>
                </div>
              </div>

              {selectedStudent.subjects?.length > 0 && (
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1.5">Favorite Topics</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedStudent.subjects.map((sub, i) => (
                      <span key={i} className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
