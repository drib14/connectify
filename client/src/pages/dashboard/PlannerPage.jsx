import { useEffect, useState } from "react";
import useStudyStore from "../../stores/study-store";
import { Calendar, RefreshCw, CheckSquare, Square } from "lucide-react";

export default function PlannerPage() {
  const { planner, plannerLoading, fetchPlanner, generatePlan, togglePlannerTask } = useStudyStore();
  const [subjects, setSubjects] = useState("");
  const [examDates, setExamDates] = useState("");
  const [hours, setHours] = useState(2);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchPlanner(); }, [fetchPlanner]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await generatePlan(subjects.split(",").map((s) => s.trim()), examDates, hours);
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Study Planner</h1>
        <p className="text-xs text-zinc-500">AI generates a personalized daily study schedule. Check off tasks as you complete them.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-zinc-200">Generate New Plan</h3>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Subjects (comma-separated)</label>
              <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Math, Biology, Chemistry"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Important Dates</label>
              <input type="text" value={examDates} onChange={(e) => setExamDates(e.target.value)} placeholder="Math exam July 15, Bio test July 20"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Daily study hours</label>
              <input type="number" min={1} max={12} value={hours} onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={generating || !subjects}
              className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {generating ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Study Plan"}
            </button>
          </form>
        </div>

        {/* Plan display */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-5">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-400" /> Your Study Plan</h3>

          {plannerLoading ? <p className="text-zinc-500 text-sm py-8 text-center">Loading...</p> : !planner?.schedule ? (
            <div className="py-12 text-center text-sm text-zinc-500">No plan yet. Generate one to see your personalized schedule.</div>
          ) : (
            <div className="space-y-4">
              {planner.schedule.map((day, dayIdx) => (
                <div key={dayIdx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                  <div className="text-sm font-bold text-zinc-200">{day.date}</div>
                  <div className="space-y-2">
                    {(day.tasks || []).map((task, tIdx) => {
                      const done = task.completed || false;
                      return (
                        <button key={tIdx}
                          onClick={() => togglePlannerTask(day.date, task.id || tIdx, !done)}
                          className={`cursor-pointer w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${done ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-900 hover:border-zinc-800"}`}>
                          {done ? <CheckSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <Square className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />}
                          <div className="flex-1">
                            <span className={`text-xs font-semibold ${done ? "text-zinc-400 line-through" : "text-zinc-200"}`}>{task.title}</span>
                            {task.description && <p className="text-[10px] text-zinc-500 mt-0.5">{task.description}</p>}
                          </div>
                          {task.duration && <span className="text-[10px] text-zinc-600 font-semibold shrink-0">{task.duration}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
