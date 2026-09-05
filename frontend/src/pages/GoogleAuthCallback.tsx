import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const accessToken = new URLSearchParams(window.location.hash.slice(1))
      .get("access_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      navigate("/dashboard", { replace: true });
      return;
    }

    setError(true);
  }, [navigate]);

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <section className="auth-content">
          <p className="auth-eyebrow">Google authentication</p>
          <h1>{error ? "Sign-in was not completed" : "Signing you in..."}</h1>
          <p className="auth-description">
            {error
              ? "Please return to the sign-in page and try again."
              : "Connecting your Google account to Sikamitra."}
          </p>
          {error && (
            <button type="button" onClick={() => navigate("/login")}>
              Return to sign in
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default GoogleAuthCallback;