import { useState, type FormEvent } from "react";
import { changePassword } from "../api/auth";
import {
  defaultPreferences,
  getUserPreferences,
  saveUserPreferences,
  type ThemePreference,
} from "../utils/preferences";

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
            <p className="profile-kicker">Accessibility</p>
            <h2>Display settings</h2>
            <p>Adjust Sikamitra to make studying more comfortable.</p>
          </div>

          <div className="settings-list">
            <label className="settings-row">
              <span>
                <strong>Theme</strong>
                <small>Choose the appearance used across the app.</small>
              </span>
              <select
                value={preferences.theme}
                onChange={(event) =>
                  updatePreferences({ theme: event.target.value as ThemePreference })
                }
              >
                <option value="light">Light</option>
                <option value="dim">Dim</option>
              </select>
            </label>

            <label className="settings-row">
              <span>
                <strong>Larger text</strong>
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
                <strong>Reduce motion</strong>
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
            <p className="profile-kicker">Security</p>
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