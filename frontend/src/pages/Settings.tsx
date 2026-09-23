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
  previewBg: string;
  borderColor: string;
  accentColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    description: "Sikamitra classic bright & clean workspace",
    previewBg: "#ebf1f8",
    borderColor: "#cbd5e1",
    accentColor: "#4f46e5",
  },
  {
    id: "dim",
    name: "Dim",
    description: "Twilight slate with soft balanced contrast",
    previewBg: "#1e293b",
    borderColor: "#475569",
    accentColor: "#818cf8",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Midnight indigo for night study sessions",
    previewBg: "#090d16",
    borderColor: "#334155",
    accentColor: "#6366f1",
  },
  {
    id: "oled",
    name: "OLED",
    description: "Pure pitch black for zero glare & battery saver",
    previewBg: "#000000",
    borderColor: "#3f3f46",
    accentColor: "#818cf8",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Forest sage tones to soothe study fatigue",
    previewBg: "#062017",
    borderColor: "#1b684e",
    accentColor: "#10b981",
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm paper & amber to filter blue light",
    previewBg: "#f8f3ea",
    borderColor: "#cfc0a7",
    accentColor: "#b45309",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "High-tech synthwave violet with neon accents",
    previewBg: "#0c071e",
    borderColor: "#5b2fa8",
    accentColor: "#d946ef",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep oceanic navy with arctic blue highlights",
    previewBg: "#061524",
    borderColor: "#225180",
    accentColor: "#0ea5e9",
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
                    >
                      <div className="theme-card-top">
                        <span
                          className="theme-card-preview"
                          style={{ background: opt.previewBg, borderColor: opt.borderColor }}
                        >
                          <span
                            className="theme-card-dot"
                            style={{ background: opt.accentColor }}
                          />
                        </span>
                        {isActive && (
                          <span className="theme-card-check">
                            <Check size={12} strokeWidth={3} />
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