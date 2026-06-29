import { useEffect, useState } from "react";
import useStudyStore from "../../stores/study-store";
import EmptyState from "../../components/ui/EmptyState";
import { HelpCircle, ChevronsRight, RefreshCw, Trash2 } from "lucide-react";

export default function QuizzesPage() {
  const { notes, fetchNotes, quizzes, quizzesLoading, fetchQuizzes, generateQuiz, activeQuiz, setActiveQuiz, clearActiveQuiz, submitQuiz, quizFeedback, deleteQuiz } = useStudyStore();
  const [noteId, setNoteId] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [qType, setQType] = useState("mixed");
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchNotes(); fetchQuizzes(); }, [fetchNotes, fetchQuizzes]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!noteId) return;
    setGenerating(true);
    try { await generateQuiz(noteId, numQ, qType); setAnswers({}); } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmitting(true);
    const arr = activeQuiz.questions.map((_, i) => answers[i] || "");
    try { await submitQuiz(activeQuiz._id, arr); } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">AI Quiz Generator</h1>
        <p className="text-xs text-zinc-500">Generate custom quizzes from your notes. MCQ, True/False, Fill-in, and Short Answer.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-zinc-200">Create Quiz</h3>
          <form onSubmit={handleGenerate} className="space-y-3">
            <select value={noteId} onChange={(e) => setNoteId(e.target.value)} required
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none">
              <option value="">Select a note...</option>
              {notes.map((n) => <option key={n._id} value={n._id}>{n.title}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Questions</label>
                <input type="number" min={3} max={10} value={numQ} onChange={(e) => setNumQ(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Type</label>
                <select value={qType} onChange={(e) => setQType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none">
                  <option value="mixed">Mixed</option>
                  <option value="mcq">MCQ</option>
                  <option value="tf">True/False</option>
                  <option value="fill">Fill Blank</option>
                  <option value="short">Short Answer</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={generating || !noteId}
              className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {generating ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Quiz"}
            </button>
          </form>
        </div>

        {/* Quiz area */}
        <div className="lg:col-span-2">
          {activeQuiz ? (
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-base font-bold text-zinc-100">{activeQuiz.title}</h3>
                <button onClick={clearActiveQuiz} className="text-[11px] text-rose-500 hover:text-rose-400 font-semibold">Exit</button>
              </div>

              {quizFeedback ? (
                <div className="space-y-5">
                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-center">
                    <div className="text-3xl font-bold text-indigo-400">{quizFeedback.score} / {quizFeedback.maxScore}</div>
                    <p className="text-[11px] text-zinc-500 mt-1">Review the explanations below to strengthen weak areas.</p>
                  </div>
                  {quizFeedback.questions.map((q, idx) => {
                    const sa = (quizFeedback.answers[idx] || "").trim().toLowerCase();
                    const ca = q.answer.trim().toLowerCase();
                    const ok = sa === ca;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"} space-y-2`}>
                        <div className="text-sm font-semibold text-zinc-200">Q{idx + 1}: {q.question}</div>
                        <div className="text-xs text-zinc-400">
                          Your answer: <span className={ok ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{quizFeedback.answers[idx] || "(blank)"}</span>
                          {!ok && <> · Correct: <span className="text-emerald-400 font-bold">{q.answer}</span></>}
                        </div>
                        <p className="text-[11px] text-zinc-500 border-t border-zinc-800/50 pt-2">{q.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 space-y-3">
                      <div className="text-sm font-semibold text-zinc-200">Q{idx + 1}: {q.question}</div>
                      {q.questionType === "mcq" || q.questionType === "tf" ? (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <label key={oi}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${answers[idx] === opt ? "border-indigo-500 bg-indigo-500/5 text-indigo-400" : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:bg-zinc-900"}`}>
                              <input type="radio" name={`q-${idx}`} value={opt} checked={answers[idx] === opt}
                                onChange={() => setAnswers({ ...answers, [idx]: opt })} className="hidden" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type="text" placeholder="Type your answer..." value={answers[idx] || ""}
                          onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={submitting}
                    className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10">
              <h3 className="text-sm font-bold text-zinc-200 mb-4">Past Quizzes</h3>
              {quizzesLoading ? <p className="text-zinc-500 text-sm py-8 text-center">Loading...</p> : quizzes.length === 0 ? (
                <EmptyState icon={HelpCircle} title="No quizzes yet" description="Select a note and generate your first quiz." />
              ) : (
                <div className="divide-y divide-zinc-900">
                  {quizzes.map((qz) => (
                    <div key={qz._id}
                      className="py-3 flex items-center justify-between hover:bg-zinc-900/30 px-2 rounded-lg transition-colors group">
                      <div onClick={() => setActiveQuiz(qz)} className="flex-1 cursor-pointer">
                        <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{qz.title}</div>
                        <div className="text-[10px] text-zinc-500">{qz.completed ? `Score: ${qz.score}/${qz.maxScore}` : "Incomplete"} · {new Date(qz.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this quiz?")) deleteQuiz(qz._id); }}
                          className="cursor-pointer h-8 w-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronsRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
