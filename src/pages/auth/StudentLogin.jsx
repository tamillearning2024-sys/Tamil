import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import loginBg from "../../../assest/tamil-bg.jpg";

const StudentLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await login(form);
      const targetYear = data?.year;
      if (!targetYear) throw new Error("No year assigned. Contact admin.");
      navigate(`/student/year/${encodeURIComponent(targetYear)}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
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
        <h2>Student Login</h2>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
          <input
            className="input"
            placeholder="Email"
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
          {info && <div style={{ color: "green", fontSize: 14 }}>{info}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <div style={{ fontSize: 14 }}>
            New student? <Link to="/auth/student-signup">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
