import { useState, type FormEvent } from "react";
import { changePassword } from "../api/auth";
import {
  defaultPreferences,
  getUserPreferences,
  saveUserPreferences,
  type ThemePreference,
} from "../utils/preferences";
import { Lock, Monitor, Accessibility, Eye, Zap, Check } from "lucide-react";

interface ThemeOption {
  id: ThemePreference;
  name: string;
  description: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    name: "Silk",
    description: "Bright & clean with soft indigo aurora",
    gradient: "linear-gradient(135deg, #eef2fa 0%, #dde6f8 50%, #e8eeff 100%)",
    accentColor: "#4f46e5",
    textColor: "#0f172a",
    borderColor: "#c5cfe8",
  },
  {
    id: "dim",
    name: "Slate",
    description: "Twilight blue-gray with frosted glass surfaces",
    gradient: "linear-gradient(135deg, #16202e 0%, #1e2d40 50%, #1a2f4a 100%)",
    accentColor: "#818cf8",
    textColor: "#f0f4f8",
    borderColor: "#344b63",
  },
  {
    id: "dark",
    name: "Midnight",
    description: "Deep navy-black with indigo nebula glow",
    gradient: "linear-gradient(135deg, #07090f 0%, #0f1422 50%, #111c35 100%)",
    accentColor: "#6366f1",
    textColor: "#f8fafc",
    borderColor: "#233052",
  },
  {
    id: "oled",
    name: "Void",
    description: "Pure pitch black — zero glare, AMOLED-ready",
    gradient: "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #111111 100%)",
    accentColor: "#818cf8",
    textColor: "#ffffff",
    borderColor: "#333333",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Arctic teal-black lit by northern light radials",
    gradient: "linear-gradient(135deg, #080e18 0%, #0c1e30 40%, #0d2535 100%)",
    accentColor: "#06b6d4",
    textColor: "#e8f4f8",
    borderColor: "#1e3c50",
  },
  {
    id: "sepia",
    name: "Parchment",
    description: "Warm aged paper — easier on eyes, blue-light minimal",
    gradient: "linear-gradient(135deg, #f5ede0 0%, #ede3d3 50%, #e8d9c4 100%)",
    accentColor: "#c2640a",
    textColor: "#2c1e10",
    borderColor: "#c8ac90",
  },
  {
    id: "cyberpunk",
    name: "Neon",
    description: "Violet-black with dual cyan & magenta neon glow",
    gradient: "linear-gradient(135deg, #0a0618 0%, #13093a 50%, #180d45 100%)",
    accentColor: "#06b6d4",
    textColor: "#f5f0ff",
    borderColor: "#3d2080",
  },
  {
    id: "ocean",
    name: "Abyss",
    description: "Deep sea navy with bioluminescent blue accents",
    gradient: "linear-gradient(135deg, #040c18 0%, #081828 50%, #0b2035 100%)",
    accentColor: "#0ea5e9",
    textColor: "#e8f4ff",
    borderColor: "#144060",
  },
];




function Settings() {
  const [preferences, setPreferences] = useState(getUserPreferences);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updatePreferences(next: Partial<typeof defaultPreferences>) {
    const updated = { ...preferences, ...next };
    setPreferences(updated);
    saveUserPreferences(updated);
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessage("The new password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("The new passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <p className="profile-kicker">Preferences</p>
          <h1>Settings</h1>
          <p>Personalize your study workspace and account access.</p>
        </header>

        <section className="profile-card settings-card">
          <div className="settings-heading">
            <p className="profile-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Monitor size={15} /> Accessibility
            </p>
            <h2>Display settings</h2>
            <p>Adjust Sikamitra to make studying more comfortable.</p>
          </div>

          <div className="settings-list">
            <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span>
                  <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Eye size={15} /> Theme
                  </strong>
                  <small>Choose the appearance used across the workspace.</small>
                </span>
                <select
                  value={preferences.theme}
                  onChange={(event) =>
                    updatePreferences({ theme: event.target.value as ThemePreference })
                  }
                  aria-label="Theme selection"
                >
                  {THEME_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="theme-grid">
                {THEME_OPTIONS.map((opt) => {
                  const isActive = preferences.theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`theme-card ${isActive ? "active" : ""}`}
                      onClick={() => updatePreferences({ theme: opt.id })}
                      style={{ borderColor: isActive ? opt.accentColor : opt.borderColor }}
                    >
                      <div
                        className="theme-card-preview"
                        style={{ background: opt.gradient, borderColor: opt.borderColor }}
                      >
                        <div className="theme-card-preview-inner">
                          <span className="theme-card-stripe" style={{ background: opt.accentColor }} />
                          <span className="theme-card-preview-name" style={{ color: opt.textColor }}>
                            {opt.name}
                          </span>
                        </div>
                        {isActive && (
                          <span className="theme-card-check" style={{ background: opt.accentColor }}>
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="theme-card-name">{opt.name}</span>
                      <span className="theme-card-desc">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="settings-row">
              <span>
                <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Accessibility size={15} /> Larger text
                </strong>
                <small>Increase readable text across the workspace.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.largerText}
                onChange={(event) =>
                  updatePreferences({ largerText: event.target.checked })
                }
              />
            </label>

            <label className="settings-row">
              <span>
                <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={15} /> Reduce motion
                </strong>
                <small>Minimize animations and movement.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(event) =>
                  updatePreferences({ reduceMotion: event.target.checked })
                }
              />
            </label>
          </div>
        </section>

        <section className="profile-card settings-card">
          <div className="settings-heading">
            <p className="profile-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Lock size={15} /> Security
            </p>
            <h2>Change credentials</h2>
            <p>Update the password used to sign in with email.</p>
          </div>

          <form className="profile-edit-form settings-credentials-form" onSubmit={handlePasswordChange}>
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </button>
          </form>

          {message && <p className="profile-message">{message}</p>}
        </section>
      </div>
    </div>
  );
}

export default Settings;