import { create } from "zustand";
import { apiFetch } from "../lib/api";

const useStudyStore = create((set, get) => ({
  // Notes
  notes: [],
  notesLoading: false,
  selectedNote: null,

  fetchNotes: async () => {
    set({ notesLoading: true });
    try {
      const res = await apiFetch("/api/study/notes");
      if (res.ok) {
        const data = await res.json();
        set({ notes: data.notes || [] });
      }
    } catch (err) { console.error(err); }
    set({ notesLoading: false });
  },

  createNote: async (title, content) => {
    const res = await apiFetch("/api/study/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const data = await res.json();
    set((s) => ({ notes: [data.note, ...s.notes], selectedNote: data.note }));
    return data.note;
  },

  updateNote: async (noteId, title, content) => {
    const res = await apiFetch(`/api/study/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const data = await res.json();
    set((s) => ({
      notes: s.notes.map((n) => (n._id === noteId ? data.note : n)),
      selectedNote: data.note,
    }));
    return data.note;
  },

  deleteNote: async (noteId) => {
    const res = await apiFetch(`/api/study/notes/${noteId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete note");
    set((s) => ({
      notes: s.notes.filter((n) => n._id !== noteId),
      selectedNote: null,
    }));
  },

  setSelectedNote: (note) => set({ selectedNote: note }),

  // Quizzes
  quizzes: [],
  quizzesLoading: false,
  activeQuiz: null,
  quizFeedback: null,

  fetchQuizzes: async () => {
    set({ quizzesLoading: true });
    try {
      const res = await apiFetch("/api/study/quizzes");
      if (res.ok) {
        const data = await res.json();
        set({ quizzes: data.quizzes || [] });
      }
    } catch (err) { console.error(err); }
    set({ quizzesLoading: false });
  },

  generateQuiz: async (noteId, numQuestions, questionType) => {
    const res = await apiFetch("/api/study/quizzes", {
      method: "POST",
      body: JSON.stringify({ noteId, numQuestions, questionType }),
    });
    if (!res.ok) throw new Error("Failed to generate quiz");
    const data = await res.json();
    set((s) => ({
      quizzes: [data.quiz, ...s.quizzes],
      activeQuiz: data.quiz,
      quizFeedback: null,
    }));
    return data.quiz;
  },

  submitQuiz: async (quizId, answers) => {
    const res = await apiFetch(`/api/study/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error("Failed to submit quiz");
    const data = await res.json();
    set({ quizFeedback: data.quiz });
    return data.quiz;
  },

  deleteQuiz: async (quizId) => {
    const res = await apiFetch(`/api/study/quizzes/${quizId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete quiz");
    set((s) => ({
      quizzes: s.quizzes.filter((q) => q._id !== quizId),
      activeQuiz: s.activeQuiz?._id === quizId ? null : s.activeQuiz,
      quizFeedback: s.activeQuiz?._id === quizId ? null : s.quizFeedback,
    }));
  },

  setActiveQuiz: (quiz) => set({ activeQuiz: quiz, quizFeedback: quiz?.completed ? quiz : null }),
  clearActiveQuiz: () => set({ activeQuiz: null, quizFeedback: null }),

  // Flashcards
  flashSets: [],
  flashLoading: false,
  selectedSet: null,
  currentCardIdx: 0,
  isFlipped: false,

  fetchFlashcards: async () => {
    set({ flashLoading: true });
    try {
      const res = await apiFetch("/api/study/flashcards");
      if (res.ok) {
        const data = await res.json();
        set({ flashSets: data.sets || [] });
      }
    } catch (err) { console.error(err); }
    set({ flashLoading: false });
  },

  generateFlashcards: async (noteId) => {
    const res = await apiFetch("/api/study/flashcards", {
      method: "POST",
      body: JSON.stringify({ noteId }),
    });
    if (!res.ok) throw new Error("Failed to generate flashcards");
    const data = await res.json();
    set((s) => ({
      flashSets: [data.flashcardSet, ...s.flashSets],
      selectedSet: data.flashcardSet,
      currentCardIdx: 0,
      isFlipped: false,
    }));
    return data.flashcardSet;
  },

  rateCard: async (setId, cardId, difficulty) => {
    const res = await apiFetch(`/api/study/flashcards/${setId}`, {
      method: "PUT",
      body: JSON.stringify({ cardId, difficulty }),
    });
    if (!res.ok) throw new Error("Failed to rate card");
    const data = await res.json();
    set({ selectedSet: data.flashcardSet });
    return data.flashcardSet;
  },

  deleteFlashcardSet: async (setId) => {
    const res = await apiFetch(`/api/study/flashcards/${setId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete flashcard set");
    set((s) => ({
      flashSets: s.flashSets.filter((f) => f._id !== setId),
      selectedSet: s.selectedSet?._id === setId ? null : s.selectedSet,
    }));
  },

  setSelectedSet: (s) => set({ selectedSet: s, currentCardIdx: 0, isFlipped: false }),
  setCurrentCardIdx: (i) => set({ currentCardIdx: i, isFlipped: false }),
  toggleFlip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  // Planner
  planner: null,
  plannerLoading: false,

  fetchPlanner: async () => {
    set({ plannerLoading: true });
    try {
      const res = await apiFetch("/api/study/planner");
      if (res.ok) {
        const data = await res.json();
        set({ planner: data.plan });
      }
    } catch (err) { console.error(err); }
    set({ plannerLoading: false });
  },

  generatePlan: async (subjects, examDates, studyHours) => {
    const res = await apiFetch("/api/study/planner", {
      method: "POST",
      body: JSON.stringify({ subjects, examDates, studyHours }),
    });
    if (!res.ok) throw new Error("Failed to generate plan");
    const data = await res.json();
    set({ planner: data.plan });
    return data.plan;
  },

  togglePlannerTask: async (date, taskId, completed) => {
    const res = await apiFetch("/api/study/planner/toggle-task", {
      method: "POST",
      body: JSON.stringify({ date, taskId, completed }),
    });
    if (!res.ok) throw new Error("Failed to toggle task");
    const data = await res.json();
    set({ planner: data.plan });
  },

  // Progress
  progress: null,
  progressLoading: false,

  fetchProgress: async () => {
    set({ progressLoading: true });
    try {
      const res = await apiFetch("/api/study/progress");
      if (res.ok) {
        const data = await res.json();
        set({ progress: data });
      }
    } catch (err) { console.error(err); }
    set({ progressLoading: false });
  },
}));

export default useStudyStore;
