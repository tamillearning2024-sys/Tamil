import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db, auth } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

const StudentProfile = () => {
  const { profile } = useAuth();
  const initials = useMemo(
    () => (profile?.name || "ST").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    [profile?.name]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    setNameInput(profile?.name || "");
  }, [profile?.name]);

  const closeEdit = () => {
    setEditOpen(false);
    setError("");
    setMsg("");
    setNameInput(profile?.name || "");
  };

  const closePwd = () => {
    setPwdOpen(false);
    setError("");
    setMsg("");
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const saveProfile = async () => {
    if (!profile?.uid) {
      setError("No user.");
      return;
    }
    if (!nameInput.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", profile.uid), {
        name: nameInput.trim(),
        updatedAt: new Date()
      });
      setMsg("Profile updated successfully");
      setError("");
      setTimeout(() => setEditOpen(false), 600);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!auth.currentUser) {
      setError("No user.");
      return;
    }
    if (!currentPwd || !newPwd || !confirmPwd) {
      setError("All password fields are required.");
      return;
    }
    if (newPwd.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      setPwdSaving(true);
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPwd);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPwd);
      setMsg("Password changed successfully");
      setError("");
      setTimeout(() => closePwd(), 800);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password") setError("Current password is incorrect.");
      else if (err.code === "auth/weak-password") setError("Password is too weak.");
      else setError("Failed to change password. Please try again.");
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="profile-shell">
      <div className="profile-banner">
        <div className="profile-avatar" title={profile?.name || "Student"}>
          {initials}
        </div>
        <div className="profile-text">
          <div className="profile-title">{profile?.name || "Student"}</div>
          <div className="profile-sub">Student Information</div>
          <div className="profile-badges">
            {profile?.year && <span className="badge soft">{profile.year}</span>}
            <span className="badge glow">{profile?.role || "student"}</span>
            <span className="badge success">Active</span>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-grid">
          <div className="profile-field">
            <div className="label">Name</div>
            <div className="value">{profile?.name || "-"}</div>
          </div>
          <div className="profile-field">
            <div className="label">Email</div>
            <div className="value wrap-anywhere">{profile?.email || "-"}</div>
          </div>
          <div className="profile-field">
            <div className="label">Year</div>
            <div className="value">{profile?.year || "-"}</div>
          </div>
          <div className="profile-field">
            <div className="label">Role</div>
            <div className="value">{profile?.role || "student"}</div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={() => setEditOpen(true)}>Edit Profile</button>
          <button className="btn btn-secondary" onClick={() => setPwdOpen(true)}>Change Password</button>
        </div>
        {(msg || error) && (
          <div style={{ marginTop: 10, fontWeight: 700, color: error ? '#c05621' : '#0f9f6a' }}>
            {error || msg}
          </div>
        )}
      </div>

      {editOpen && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h4>Edit Profile</h4>
            <label className="label">Name</label>
            <input
              className="input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeEdit}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwdOpen && (
        <div className="modal-overlay" onClick={closePwd}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h4>Change Password</h4>
            <label className="label">Current Password</label>
            <input
              className="input"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closePwd}>Cancel</button>
              <button className="btn btn-primary" onClick={changePassword} disabled={pwdSaving}>
                {pwdSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
export { StudentProfile };
