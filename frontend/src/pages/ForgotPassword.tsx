import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { requestPasswordReset } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <section className="auth-content">
        <p className="auth-eyebrow">Account Recovery</p>
        <h1>Reset your password</h1>
        <p className="auth-description">
          Enter the email address associated with your account and we will send you password reset instructions.
        </p>

        {submitted ? (
          <div className="auth-success-box" style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "12px",
            padding: "20px",
            color: "#065f46",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700 }}>Check your inbox</h3>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "#047857" }}>
              If an account exists for <strong>{email}</strong>, you will receive instructions to reset your password shortly.
            </p>
            <div style={{ marginTop: "18px" }}>
              <Link to="/login" style={{
                display: "inline-block",
                padding: "9px 18px",
                background: "#059669",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none"
              }}>
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send reset instructions"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </AuthLayout>
  );
}
