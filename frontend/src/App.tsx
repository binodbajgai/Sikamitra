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

import SubjectDetail from "./pages/materials/SubjectDetail.tsx";

import MockTests from "./pages/mock-tests/MockTests.tsx";
import MockTestTake from "./pages/mock-tests/MockTestTake.tsx";

import AppLayout from "./layouts/AppLayout.tsx";


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-content">
          <div className="app-loading-mark">
            S
          </div>

          <p>
            Loading Sikamitra...
          </p>
        </div>
      </div>
    );
  }

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


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =====================================================
          PROTECTED APPLICATION
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
            STUDY MATERIALS
        ================================================= */}

        <Route
          path="/materials"
          element={<Materials />}
        />

        {/* Subject detail
            IMPORTANT: this comes before
            /materials/:materialId
        */}
        <Route
          path="/materials/subject/:subjectId"
          element={<SubjectDetail />}
        />

        {/* Individual material */}
        <Route
          path="/materials/:materialId"
          element={<MaterialDetail />}
        />


        {/* =================================================
            MOCK TESTS
        ================================================= */}

        <Route
          path="/mock-tests"
          element={<MockTests />}
        />

        <Route
          path="/mock-tests/take"
          element={<MockTestTake />}
        />

      </Route>


      {/* =====================================================
          ROOT
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =====================================================
          UNKNOWN ROUTES
      ===================================================== */}

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