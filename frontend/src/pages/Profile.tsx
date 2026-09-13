import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadProfileImage } from "../api/auth";
import { User, Mail, GraduationCap, Camera, Pencil, ShieldCheck, Sliders } from "lucide-react";
import AvatarAdjustModal from "../components/AvatarAdjustModal";

function Profile() {
  const { user, setUser } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustImageSrc, setAdjustImageSrc] = useState<string>("");

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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        setAdjustImageSrc(src);
        setIsAdjustModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSaveCroppedAvatar(file: File) {
    try {
      setSaving(true);
      setMessage("");
      const updatedUser = await uploadProfileImage(file);
      setUser(updatedUser);
      setIsAdjustModalOpen(false);
      setMessage("Profile image updated and perfectly adjusted!");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to update profile image.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenAdjustExisting() {
    if (user?.profile_image) {
      setAdjustImageSrc(user.profile_image);
      setIsAdjustModalOpen(true);
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
              <Pencil size={15} style={{ marginRight: "5px", verticalAlign: "middle" }} />
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

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "16px 0" }}>
            <button
              type="button"
              className="profile-image-button"
              onClick={() => imageInputRef.current?.click()}
              disabled={saving}
            >
              <Camera size={15} style={{ marginRight: "5px", verticalAlign: "middle" }} />
              Change profile image
            </button>

            {user?.profile_image && (
              <button
                type="button"
                className="profile-image-button"
                onClick={handleOpenAdjustExisting}
                disabled={saving}
                style={{ background: "transparent", borderColor: "#6366f1", color: "#6366f1" }}
              >
                <Sliders size={15} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                Auto-adjust / Reposition photo
              </button>
            )}
          </div>

          <AvatarAdjustModal
            isOpen={isAdjustModalOpen}
            imageSrc={adjustImageSrc}
            onSave={handleSaveCroppedAvatar}
            onCancel={() => setIsAdjustModalOpen(false)}
            saving={saving}
          />

          {message && <p className="profile-message">{message}</p>}

          <div className="profile-fields">
            <div className="profile-field">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={15} color="#6366f1" /> Full name
              </span>
              <strong>{user?.full_name || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={15} color="#6366f1" /> Email address
              </span>
              <strong>{user?.email || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={15} color="#6366f1" /> University
              </span>
              <strong>{user?.university || "Not provided"}</strong>
            </div>
            <div className="profile-field">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={15} color="#059669" /> Account status
              </span>
              <strong>{user?.is_active ? "Active" : "Inactive"}</strong>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Profile;