import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
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

function App() {
  useEffect(() => {
    applyUserPreferences(getUserPreferences());
  }, []);

  return (
    <Routes>

      {/* AUTH */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/auth/google/callback"
        element={<GoogleAuthCallback />}
      />


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
        path="/study-materials/subject/:subjectId"
        element={
          <ProtectedRoute>
            <AppShell>
              <SubjectDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-materials/:materialId"
        element={
          <ProtectedRoute>
            <AppShell>
              <MaterialDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

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
        path="/mock-tests/take"
        element={
          <ProtectedRoute>
            <AppShell>
              <MockTestTake />
            </AppShell>
          </ProtectedRoute>
        }
      />

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


      {/* DEFAULT */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;