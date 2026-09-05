import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadProfileImage } from "../api/auth";

function Profile() {
  const { user, setUser } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const updatedUser = await updateProfile({
        full_name: fullName,
        university,
      });
      setUser(updatedUser);
      setEditing(false);
      setMessage("Profile updated.");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setMessage("");
      const updatedUser = await uploadProfileImage(file);
      setUser(updatedUser);
      setMessage("Profile image updated.");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to update profile image.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <p className="profile-kicker">Account settings</p>
          <h1>Profile</h1>
          <p>Manage the account details you use with Sikamitra.</p>
        </header>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-large-avatar">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" />
              ) : (
                user?.full_name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div>
              <h2>{user?.full_name || "Student"}</h2>
              <p>{user?.email || "No email available"}</p>
            </div>
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => setEditing((current) => !current)}
            >
              {editing ? "Close edit" : "Edit profile"}
            </button>
          </div>

          {editing && (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <label>
                Full name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </label>
              <label>
                University
                <input value={university} onChange={(event) => setUniversity(event.target.value)} />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleImageChange}
          />

          <button
            type="button"
            className="profile-image-button"
            onClick={() => imageInputRef.current?.click()}
            disabled={saving}
          >
            Change profile image
          </button>

          {message && <p className="profile-message">{message}</p>}

          <div className="profile-fields">
            <div className="profile-field">
              <span>Full name</span>
              <strong>{user?.full_name || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span>Email address</span>
              <strong>{user?.email || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span>University</span>
              <strong>{user?.university || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span>Account status</span>
              <strong>{user?.is_active ? "Active" : "Inactive"}</strong>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Profile;