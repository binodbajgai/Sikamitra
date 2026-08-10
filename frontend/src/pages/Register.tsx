import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        university: university || undefined,
      });

      navigate("/");
    } catch {
      setError(
        "Unable to create your account. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-content">
        <p className="auth-eyebrow">Create your account</p>

        <h1>Build a better study routine.</h1>

        <p className="auth-description">
          Create your Sikamitra account and start preparing
          with structured mock tests.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Your full name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            University
            <input
              type="text"
              value={university}
              onChange={(event) =>
                setUniversity(event.target.value)
              }
              placeholder="Your university"
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
              placeholder="Create a password"
              required
              minLength={8}
            />
          </label>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}