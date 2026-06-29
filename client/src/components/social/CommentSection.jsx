import { useState, useEffect } from "react";
import useSocialStore from "../../stores/social-store";
import Avatar from "../ui/Avatar";
import { Send, Clock } from "lucide-react";

export default function CommentSection({ postId }) {
  const { fetchComments, addComment } = useSocialStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchComments(postId);
        if (active) setComments(list);
      } catch (err) {
        console.error(err);
      }
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [postId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    try {
      const newComment = await addComment(postId, text);
      setComments((c) => [...c, newComment]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-900 space-y-4">
      {/* List */}
      {loading ? (
        <div className="text-center py-4 text-xs text-zinc-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-zinc-500 text-xs italic px-2">No comments yet. Be the first to reply!</div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3 bg-zinc-950/20 p-3 rounded-xl border border-zinc-900/60">
              <Avatar src={c.userId?.avatar} name={c.userId?.username} size="sm" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">{c.userId?.username || "Student"}</span>
                  <span className="text-[9px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="cursor-pointer inline-flex h-8 px-3 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
