import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.tsx";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as {
      from?: string;
    } | null)?.from || "/dashboard";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      navigate(from, {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);

      const detail =
        err?.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Invalid email or password."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    setError(
      "Google Sign-In will be available once Google authentication is connected."
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-panel">

        <div className="auth-brand">
          <div className="auth-brand-mark">
            S
          </div>

          <span>Sikamitra</span>
        </div>

        <section className="auth-content">
          <p className="auth-eyebrow">
            Welcome back
          </p>

          <h1>Sign in to Sikamitra</h1>

          <p className="auth-description">
            Continue your study session and access
            your materials, questions, and mock tests.
          </p>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="google-logo">
              G
            </span>

            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;