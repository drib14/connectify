import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { Compass, RefreshCw, Send, BookOpen, Target, Map } from "lucide-react";
import MarkdownRenderer from "../../components/ui/MarkdownRenderer";

export default function SmartTutorPage() {
  const [mode, setMode] = useState("homework");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const modes = [
    { id: "homework", label: "Homework Helper", icon: BookOpen, desc: "Get step-by-step guidance on homework problems — not answers, but HOW to solve them." },
    { id: "weakness", label: "Weakness Detector", icon: Target, desc: "Describe what you're struggling with and get a diagnosis of your knowledge gaps." },
    { id: "concept", label: "Concept Explainer", icon: Map, desc: "Enter any concept and get a detailed explanation with examples and analogies." },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const endpoint = mode === "homework" ? "/api/study/coach" : mode === "weakness" ? "/api/study/weakness" : "/api/study/coach";
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ prompt: mode === "concept" ? `Explain this concept in detail with analogies: ${prompt}` : prompt, chatHistory: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.response || data.analysis || JSON.stringify(data, null, 2));
      } else {
        setResult(data.error || "Something went wrong.");
      }
    } catch (err) {
      setResult("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2"><Compass className="h-5 w-5 text-indigo-400" /> Smart Tutor</h1>
        <p className="text-xs text-zinc-500">Specialized AI tools for homework help, weakness detection, and concept exploration.</p>
      </div>

      {/* Mode selector */}
      <div className="grid sm:grid-cols-3 gap-4">
        {modes.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${mode === m.id ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-900 hover:border-zinc-800"}`}>
            <m.icon className={`h-5 w-5 mb-2 ${mode === m.id ? "text-indigo-400" : "text-zinc-600"}`} />
            <div className="text-sm font-bold text-zinc-200">{m.label}</div>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === "homework" ? "Paste your homework problem here. I'll guide you through solving it step by step..."
              : mode === "weakness" ? "Describe what topic you're struggling with and what specifically confuses you..."
              : "Enter a concept you want explained in depth (e.g., Mitosis, Quadratic Formula, Supply and Demand)..."
          }
          rows={5}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none resize-none" required />
        <button type="submit" disabled={loading || !prompt.trim()}
          className="cursor-pointer inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 gap-2">
          {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Send className="h-4 w-4" /> Go</>}
        </button>
      </form>

      {result && (
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 shadow-2xl">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
}
