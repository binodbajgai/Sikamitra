import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import MaterialDetail from "./pages/MaterialDetail";
import SubjectDetail from "./pages/materials/SubjectDetail";
import MockTests from "./pages/mock-tests/MockTests";
import MockTestTake from "./pages/mock-tests/MockTestTake";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import { applyUserPreferences, getUserPreferences } from "./utils/preferences";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-mark">S</div>
        <p>Loading Sikamitra...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-mark">S</div>
        <p>Loading Sikamitra...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}

function App() {
  useEffect(() => {
    applyUserPreferences(getUserPreferences());
  }, []);

  return (
    <Routes>
      {/* PUBLIC / LANDING — redirects to /dashboard if already logged in */}
      <Route path="/" element={<RootRedirect />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* MATERIALS */}
      <Route
        path="/materials"
        element={
          <ProtectedRoute>
            <AppShell>
              <Materials />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-materials"
        element={
          <ProtectedRoute>
            <AppShell>
              <Materials />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/:materialId"
        element={
          <ProtectedRoute>
            <AppShell>
              <MaterialDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/subjects/:subjectId"
        element={
          <ProtectedRoute>
            <AppShell>
              <SubjectDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* MOCK TESTS */}
      <Route
        path="/mock-tests"
        element={
          <ProtectedRoute>
            <AppShell>
              <MockTests />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/mock-tests/:mockTestId"
        element={
          <ProtectedRoute>
            <AppShell>
              <MockTestTake />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* PROGRESS */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <AppShell>
              <Progress />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* PROFILE & SETTINGS */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <Profile />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <Settings />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
