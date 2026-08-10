import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/auth/login" replace />}
        />

        <Route
          path="/auth/login"
          element={<Login />}
        />

        <Route
          path="/auth/register"
          element={<Register />}
        />

        <Route
          path="*"
          element={<Navigate to="/auth/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;