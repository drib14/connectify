import { useState, useEffect } from "react";
import useSocialStore from "../../stores/social-store";
import useStudyStore from "../../stores/study-store";
import Avatar from "../ui/Avatar";
import { Send, BookOpen, HelpCircle, Lightbulb, Check } from "lucide-react";

export default function CreatePostForm({ user }) {
  const { createPost } = useSocialStore();
  const { notes, fetchNotes } = useStudyStore();
  const [content, setContent] = useState("");
  const [type, setType] = useState("study_tip");
  const [attachedNoteId, setAttachedNoteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const attachments = [];
      if (attachedNoteId) {
        const note = notes.find((n) => n._id === attachedNoteId);
        if (note) {
          attachments.push({
            noteId: note._id,
            title: note.title,
          });
        }
      }
      await createPost(content.trim(), type, attachments);
      setContent("");
      setAttachedNoteId("");
      setShowAttach(false);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.username} size="md" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a study tip, ask a question, or discuss lessons..."
          rows={3}
          className="flex-1 bg-transparent border-0 resize-none text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900/60">
        <div className="flex gap-2">
          {/* Post Type Selector */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none font-semibold"
          >
            <option value="study_tip">💡 Study Tip</option>
            <option value="question">❓ Study Question</option>
            <option value="note_share">📝 Shared Notes</option>
          </select>

          {/* Attach Note Toggle */}
          <button
            type="button"
            onClick={() => setShowAttach(!showAttach)}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              showAttach || attachedNoteId
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {attachedNoteId ? "Note Attached" : "Attach Note"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="cursor-pointer inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-all ml-auto"
        >
          <Send className="h-3.5 w-3.5" /> Post Feed
        </button>
      </div>

      {showAttach && (
        <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/60 animate-in slide-in-from-top-1">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Select Note to Attach</label>
          {notes.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No notes found. Create a study note first.</p>
          ) : (
            <select
              value={attachedNoteId}
              onChange={(e) => setAttachedNoteId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="">Choose note...</option>
              {notes.map((n) => (
                <option key={n._id} value={n._id}>
                  {n.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </form>
  );
}
