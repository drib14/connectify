import { useEffect, useState } from "react";
import useStudyStore from "../../stores/study-store";
import EmptyState from "../../components/ui/EmptyState";
import {
  BookOpen, ChevronsRight, RefreshCw, ArrowLeft, Upload,
  Trash2, Share2, Edit3, Save, Check
} from "lucide-react";

export default function NotesPage() {
  const {
    notes,
    notesLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    selectedNote,
    setSelectedNote,
    generateFlashcards
  } = useStudyStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [flashLoading, setFlashLoading] = useState(false);
  const [noteTab, setNoteTab] = useState("summary");

  // File Upload State
  const [fileError, setFileError] = useState("");
  const [fileSuccess, setFileSuccess] = useState("");

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    setFileSuccess("");
    try {
      await createNote(title, content);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    setFileSuccess("");

    const isText = file.name.endsWith(".txt") || file.name.endsWith(".md") || file.type.startsWith("text/");
    if (!isText) {
      setFileError("Please upload a text file (.txt or .md)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        const fileTitle = file.name.replace(/\.[^/.]+$/, ""); // Strip extension
        setTitle(fileTitle);
        setContent(text);
        setFileSuccess(`Successfully loaded "${file.name}"!`);
      }
    };
    reader.onerror = () => {
      setFileError("Failed to read the file");
    };
    reader.readAsText(file);
  };

  const handleFlash = async () => {
    if (!selectedNote) return;
    setFlashLoading(true);
    try {
      await generateFlashcards(selectedNote._id);
      alert("Flashcards generated successfully! Go to the Flashcards tab to study them.");
    } catch (err) {
      console.error(err);
    }
    setFlashLoading(false);
  };



  const handleDelete = async () => {
    if (!selectedNote) return;
    if (confirm("Are you sure you want to delete this study note? All generated quizzes and flashcards for this note will be decoupled.")) {
      try {
        await deleteNote(selectedNote._id);
      } catch (err) {
        alert("Failed to delete note");
      }
    }
  };

  const startEditMode = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;
    setUpdating(true);
    try {
      await updateNote(selectedNote._id, editTitle, editContent);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update note summary");
    }
    setUpdating(false);
  };

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "points", label: "Key Points" },
    { id: "terms", label: "Vocabulary" },
    { id: "objectives", label: "Objectives" },
    { id: "formulas", label: "Formulas" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">AI Study Notebook</h1>
        <p className="text-xs text-zinc-500">
          Upload textbook notes, drag-and-drop lecture materials, or paste study content to extract summaries, key takeaways, and flashcards.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Side: Note Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-zinc-200">Add Study Material</h3>
          
          {/* File drag drop area */}
          <label className="border border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
            <input type="file" onChange={handleFileUpload} accept=".txt,.md,text/plain" className="hidden" />
            <Upload className="h-6 w-6 text-zinc-650 group-hover:text-indigo-400 mb-2 transition-colors" />
            <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200">Upload Text File (.txt, .md)</span>
            <span className="text-[9px] text-zinc-600 mt-1">Or drag & drop file here</span>
          </label>

          {fileError && <p className="text-[10px] text-rose-500 font-semibold">{fileError}</p>}
          {fileSuccess && <p className="text-[10px] text-emerald-500 font-semibold">{fileSuccess}</p>}

          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title (e.g., Photosynthesis)"
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste study guides, lecture scripts, or textbooks..."
              rows={10}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none resize-none"
              required
            />
            <button
              type="submit"
              disabled={creating || !title || !content}
              className="cursor-pointer w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Digesting...
                </>
              ) : (
                "Digest Material"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Note Viewer / Notebook List */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            isEditing ? (
              /* Note Edit Form */
              <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-zinc-200">Edit Study Material</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleSaveUpdate} className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="cursor-pointer inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    {updating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Re-extract & Save Note
                  </button>
                </form>
              </div>
            ) : (
              /* Note summary Viewer */
              <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-4">
                  <div>
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mb-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> All Notes
                    </button>
                    <h3 className="text-base font-bold text-zinc-100">{selectedNote.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit mode toggle */}
                    <button
                      onClick={startEditMode}
                      className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                      title="Edit Note"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* Delete note */}
                    <button
                      onClick={handleDelete}
                      className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-805 bg-zinc-950 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Build flashcards */}
                    <button
                      onClick={handleFlash}
                      disabled={flashLoading}
                      className="cursor-pointer inline-flex h-8 items-center justify-center rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                    >
                      {flashLoading ? "Generating..." : "Build Flashcards"}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-900 text-xs overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setNoteTab(tab.id)}
                      className={`px-4 py-2 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                        noteTab === tab.id
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-sm leading-relaxed text-zinc-300 min-h-[220px]">
                  {noteTab === "summary" && <p>{selectedNote.summary || "No summary generated."}</p>}
                  {noteTab === "points" && (
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedNote.keyPoints?.length > 0 ? (
                        selectedNote.keyPoints.map((p, i) => <li key={i}>{p}</li>)
                      ) : (
                        <li className="text-zinc-500">No key points extracted.</li>
                      )}
                    </ul>
                  )}
                  {noteTab === "terms" && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedNote.terms?.length > 0 ? (
                        selectedNote.terms.map((t, i) => (
                          <div key={i} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40">
                            <div className="font-semibold text-indigo-300 text-xs mb-1">{t.term}</div>
                            <div className="text-[11px] text-zinc-400">{t.definition}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 col-span-2 italic">No vocabulary extracted.</p>
                      )}
                    </div>
                  )}
                  {noteTab === "objectives" && (
                    <ol className="list-decimal pl-5 space-y-2">
                      {selectedNote.objectives?.length > 0 ? (
                        selectedNote.objectives.map((o, i) => <li key={i}>{o}</li>)
                      ) : (
                        <li className="text-zinc-500">No learning objectives generated.</li>
                      )}
                    </ol>
                  )}
                  {noteTab === "formulas" && (
                    <div className="space-y-2">
                      {selectedNote.formulas?.length > 0 ? (
                        selectedNote.formulas.map((f, i) => (
                          <div
                            key={i}
                            className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900 font-mono text-center text-zinc-200 text-xs"
                          >
                            {f}
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic">No formulas or equations detected.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* Note Notebook List */
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10">
              <h3 className="text-sm font-bold text-zinc-200 mb-4">Your Study Notebook</h3>
              {notesLoading ? (
                <p className="text-zinc-500 text-sm py-8 text-center">Loading notes...</p>
              ) : notes.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No study notes"
                  description="Use the creator panel on the left to paste/upload your first lecture summary."
                />
              ) : (
                <div className="divide-y divide-zinc-900">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setNoteTab("summary");
                      }}
                      className="py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 px-2 rounded-lg transition-colors group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">
                          {note.title}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronsRight className="h-4 w-4 text-zinc-650 group-hover:text-indigo-400 transition-colors" />
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
