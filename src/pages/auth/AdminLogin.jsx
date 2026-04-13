import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import loginBg from "../../../assest/tamil-bg.jpg";

const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginAdmin(form);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err.code === "not-admin") setError("Only admin can login here.");
      else setError("Admin login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-shell"
      style={{
        display: "grid",
        placeItems: "center",
        padding: 24,
        minHeight: "100vh",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: "100%", backdropFilter: "blur(4px)" }}>
        <h2>Admin Login</h2>
        <p style={{ color: "#475569", fontSize: 14 }}>Only pre-created admin accounts can sign in.</p>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
          <input
            className="input"
            placeholder="Admin email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <div style={{ color: "crimson", fontSize: 14 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login as Admin"}
          </button>
          <div style={{ fontSize: 14 }}>
            Back to <Link to="/auth">role selection</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
