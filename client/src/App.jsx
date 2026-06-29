import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import GoogleCallback from "./pages/GoogleCallback";
import ForgotPassword from "./pages/ForgotPassword";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Study Pages
import OverviewPage from "./pages/dashboard/OverviewPage";
import CoachPage from "./pages/dashboard/CoachPage";
import NotesPage from "./pages/dashboard/NotesPage";
import QuizzesPage from "./pages/dashboard/QuizzesPage";
import FlashcardsPage from "./pages/dashboard/FlashcardsPage";
import PlannerPage from "./pages/dashboard/PlannerPage";
import SmartTutorPage from "./pages/dashboard/SmartTutorPage";
import ProfilePage from "./pages/dashboard/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      
      {/* Dashboard Nested Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="coach" element={<CoachPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="flashcards" element={<FlashcardsPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="smart" element={<SmartTutorPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
