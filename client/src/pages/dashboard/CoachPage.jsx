import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../stores/auth-store";
import { RefreshCw, AlertTriangle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "../../components/ui/MarkdownRenderer";

export default function CoachPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [history, setHistory] = useState([
    { sender: "tutor", text: `Hey ${user?.username || "there"}! 👋 I'm your AI Study Coach. Ask me to explain any concept — I'll use analogies, examples, and test your understanding. What should we learn today?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const msg = input.trim();
    setHistory((h) => [...h, { sender: "user", text: msg }]);
    setInput("");
    setLoading(true);
    setSuspended("");

    try {
      const res = await apiFetch("/api/study/coach", {
        method: "POST",
        body: JSON.stringify({ prompt: msg, chatHistory: history }),
      });
      const data = await res.json();

      if (res.ok) {
        setHistory((h) => [
          ...h,
          { sender: "tutor", text: data.response },
          ...(data.followUp ? [{ sender: "tutor", text: `💡 Quick check: ${data.followUp}`, isFollowUp: true }] : []),
        ]);
      } else if (res.status === 403) {
        setSuspended(data.error);
      } else {
        setHistory((h) => [...h, { sender: "tutor", text: data.error || "Oops, I hit a snag. Try again?" }]);
      }
    } catch (err) {
      setHistory((h) => [...h, { sender: "tutor", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  if (suspended) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
          <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-100">AI Tutor Access Blocked</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{suspended}</p>
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="cursor-pointer inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500 transition-all"
          >
            Go to Profile to Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-zinc-100">AI Study Coach</h1>
        <p className="text-xs text-zinc-500">Your personal tutor — explains concepts, uses analogies, and tests your understanding.</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-3">
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm whitespace-pre-wrap"
                  : msg.isFollowUp
                  ? "bg-violet-950/40 border border-violet-500/20 text-violet-350 rounded-bl-sm italic"
                  : "bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-bl-sm shadow-md"
              }`}
            >
              {msg.sender === "user" ? (
                msg.text
              ) : (
                <MarkdownRenderer content={msg.text} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-zinc-400 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to explain a concept, give an analogy, or test your knowledge..."
          disabled={loading}
          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="cursor-pointer inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
