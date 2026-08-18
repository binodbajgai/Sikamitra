import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext.tsx";

import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Materials from "./pages/Materials.tsx";
import MaterialDetail from "./pages/MaterialDetail.tsx";

import AppLayout from "./layouts/AppLayout.tsx";


function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  /*
   * Restore session
   */
  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-content">
          <div className="app-loading-mark">
            S
          </div>

          <p>Loading Sikamitra...</p>
        </div>
      </div>
    );
  }

  /*
   * User is not authenticated
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}


function App() {
  return (
    <Routes>
      {/* =========================================
          PUBLIC ROUTES
      ========================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================================
          PROTECTED APPLICATION
      ========================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/materials"
          element={<Materials />}
        />

        <Route
          path="/materials/:materialId"
          element={<MaterialDetail />}
        />

        {/* Temporary route.
            We will build the actual page later. */}
        <Route
          path="/mock-tests"
          element={
            <div className="coming-soon-page">
              <span>Mock Tests</span>
              <h1>Coming soon</h1>
              <p>
                Your mock-test workspace will
                be available here.
              </p>
            </div>
          }
        />
      </Route>


      {/* =========================================
          ROOT ROUTE
      ========================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =========================================
          UNKNOWN ROUTES
      ========================================== */}

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