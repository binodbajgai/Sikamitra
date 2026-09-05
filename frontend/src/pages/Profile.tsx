import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
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
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2>{user?.full_name || "Student"}</h2>
              <p>{user?.email || "No email available"}</p>
            </div>
          </div>

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

        <section className="profile-card profile-actions-card">
          <div>
            <p className="profile-kicker">Session</p>
            <h2>Account access</h2>
            <p>Sign out of Sikamitra on this device.</p>
          </div>
          <button type="button" className="profile-logout-button" onClick={handleLogout}>
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}

export default Profile;