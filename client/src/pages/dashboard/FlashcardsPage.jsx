import { useEffect, useState } from "react";
import useStudyStore from "../../stores/study-store";
import EmptyState from "../../components/ui/EmptyState";
import { Layers, ChevronsRight, RotateCcw, ChevronLeft, ChevronRight, Check, X, AlertCircle, Trash2 } from "lucide-react";

export default function FlashcardsPage() {
  const { flashSets, flashLoading, fetchFlashcards, selectedSet, setSelectedSet, currentCardIdx, setCurrentCardIdx, isFlipped, toggleFlip, rateCard, notes, fetchNotes, generateFlashcards, deleteFlashcardSet } = useStudyStore();
  const [genLoading, setGenLoading] = useState(false);
  const [noteId, setNoteId] = useState("");

  useEffect(() => { fetchFlashcards(); fetchNotes(); }, [fetchFlashcards, fetchNotes]);

  const handleGenerate = async () => {
    if (!noteId) return;
    setGenLoading(true);
    try { await generateFlashcards(noteId); } catch (err) { console.error(err); }
    setGenLoading(false);
  };

  const handleRate = async (difficulty) => {
    if (!selectedSet) return;
    const card = selectedSet.cards[currentCardIdx];
    await rateCard(selectedSet._id, card._id || card.id || currentCardIdx, difficulty);
    if (currentCardIdx < selectedSet.cards.length - 1) {
      setCurrentCardIdx(currentCardIdx + 1);
    }
  };

  const card = selectedSet?.cards?.[currentCardIdx];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Flashcards</h1>
        <p className="text-xs text-zinc-500">Review AI-generated flashcards. Rate each card to track your progress.</p>
      </div>

      {selectedSet && card ? (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <button onClick={() => setSelectedSet(null)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" /> All Sets
            </button>
            <span className="text-[10px] text-zinc-500 font-bold">{currentCardIdx + 1} / {selectedSet.cards.length}</span>
          </div>

          {/* Flip card */}
          <div onClick={toggleFlip}
            className="min-h-[260px] cursor-pointer p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/40 transition-all flex flex-col items-center justify-center text-center select-none">
            {!isFlipped ? (
              <>
                <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-3">Front</div>
                <p className="text-lg font-semibold text-zinc-100 leading-relaxed">{card.front}</p>
                <p className="text-[10px] text-zinc-600 mt-4">Tap to reveal</p>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase font-bold text-violet-400 tracking-wider mb-3">Back</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{card.back}</p>
              </>
            )}
          </div>

          {/* Difficulty rating */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => handleRate("easy")}
              className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10">
              <Check className="h-4 w-4" /> Easy
            </button>
            <button onClick={() => handleRate("medium")}
              className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 text-xs font-bold text-amber-400 hover:bg-amber-500/10">
              <AlertCircle className="h-4 w-4" /> Medium
            </button>
            <button onClick={() => handleRate("hard")}
              className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 text-xs font-bold text-rose-400 hover:bg-rose-500/10">
              <X className="h-4 w-4" /> Hard
            </button>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => currentCardIdx > 0 && setCurrentCardIdx(currentCardIdx - 1)} disabled={currentCardIdx === 0}
              className="cursor-pointer h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => currentCardIdx < selectedSet.cards.length - 1 && setCurrentCardIdx(currentCardIdx + 1)} disabled={currentCardIdx === selectedSet.cards.length - 1}
              className="cursor-pointer h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-3 h-fit">
            <h3 className="text-sm font-bold text-zinc-200">Generate from Note</h3>
            <select value={noteId} onChange={(e) => setNoteId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none">
              <option value="">Select a note...</option>
              {notes.map((n) => <option key={n._id} value={n._id}>{n.title}</option>)}
            </select>
            <button onClick={handleGenerate} disabled={genLoading || !noteId}
              className="cursor-pointer w-full h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {genLoading ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10">
            <h3 className="text-sm font-bold text-zinc-200 mb-4">Flashcard Sets</h3>
            {flashLoading ? <p className="text-zinc-500 text-sm py-8 text-center">Loading...</p> : flashSets.length === 0 ? (
              <EmptyState icon={Layers} title="No flashcard sets yet" description="Generate flashcards from your notes to start reviewing." />
            ) : (
              <div className="divide-y divide-zinc-900">
                 {flashSets.map((fset) => (
                  <div key={fset._id}
                    className="py-3 flex items-center justify-between hover:bg-zinc-900/30 px-2 rounded-lg transition-colors group">
                    <div onClick={() => setSelectedSet(fset)} className="flex-1 cursor-pointer">
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{fset.title}</div>
                      <div className="text-[10px] text-zinc-500">{fset.cards?.length || 0} cards</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this flashcard set?")) deleteFlashcardSet(fset._id); }}
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
        </div>
      )}
    </div>
  );
}
