import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.tsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        university:
          university.trim() || undefined,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);

      const detail =
        err?.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (
        Array.isArray(detail) &&
        detail.length > 0
      ) {
        setError(
          detail
            .map(
              (item: any) =>
                item?.msg || "Invalid input."
            )
            .join(" ")
        );
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
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
            Get started
          </p>

          <h1>Create your account</h1>

          <p className="auth-description">
            Build your study workspace and keep your
            materials, summaries, questions, and tests
            in one place.
          </p>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleSignup}
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
              Full name

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                disabled={loading}
              />
            </label>

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
              University
              <span className="field-optional">
                Optional
              </span>

              <input
                type="text"
                value={university}
                onChange={(event) =>
                  setUniversity(event.target.value)
                }
                placeholder="Your university"
                autoComplete="organization"
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={loading}
              />
            </label>

            <label>
              Confirm password

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
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
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Register;