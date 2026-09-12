import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { requestPasswordReset, resetPassword } from "../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Steps: "request" (enter email) | "verify" (enter code + new password) | "success"
  const [step, setStep] = useState<"request" | "verify" | "success">("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Step 1: Send verification code to email
  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify code and update password
  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the 6-digit verification code from your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim(), cleanCode, newPassword);
      setSuccessMessage("Password reset successfully! You can now log in with your new password.");
      setStep("success");
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Invalid or expired verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <section className="auth-content">
        <p className="auth-eyebrow">Account Recovery</p>

        {step === "request" && (
          <>
            <h1>Reset your password</h1>
            <p className="auth-description">
              Enter the email address associated with your account and we'll email you a 6-digit verification code.
            </p>

            <form className="auth-form" onSubmit={handleSendCode}>
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
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          </>
        )}

        {step === "verify" && (
          <>
            <h1>Enter verification code</h1>
            <p className="auth-description">
              We sent a 6-digit code to <strong>{email}</strong>. Enter the code and choose your new password.
            </p>

            <form className="auth-form" onSubmit={handleResetPassword}>
              <label>
                6-digit code
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  style={{
                    letterSpacing: "6px",
                    fontSize: "20px",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                  disabled={loading}
                  autoComplete="one-time-code"
                  required
                />
              </label>

              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </label>

              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Updating password..." : "Update password"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("request");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Change email
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSendCode(e as any)}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}

        {step === "success" && (
          <div
            className="auth-success-box"
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "14px",
              padding: "24px",
              color: "#065f46",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              ✓
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 800, color: "#065f46" }}>
              Password Changed!
            </h3>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#047857" }}>
              {successMessage}
            </p>
            <div style={{ marginTop: "22px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  background: "#059669",
                  color: "#ffffff",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                }}
              >
                Sign in now
              </button>
            </div>
          </div>
        )}

        <p className="auth-switch" style={{ marginTop: "24px" }}>
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </AuthLayout>
  );
}
