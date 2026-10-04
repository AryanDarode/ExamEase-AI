import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import StudyPlanner from './pages/StudyPlanner';
import StressTracker from './pages/StressTracker';
import AIAssistant from './pages/AIAssistant';
import Relaxation from './pages/Relaxation';
import Progress from './pages/Progress';
import Support from './pages/Support';

// Main layout with persistent sidebar Navbar
function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Profile Setup (Requires Verified Auth, but not completed profile) */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute requireProfile={true}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<StudyPlanner />} />
          <Route path="/stress" element={<StressTracker />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/relaxation" element={<Relaxation />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/support" element={<Support />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
