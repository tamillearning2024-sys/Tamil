import React from "react";
import { Link } from "react-router-dom";
import loginBg from "../../../assest/tamil-bg.jpg";

const LoginSelection = () => {
  return (
    <div
      className="app-shell"
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        minHeight: '100vh',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
        <h2>Tamil Learning</h2>
        <p style={{ color: '#475569' }}>Choose how you want to continue</p>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <Link className="btn btn-primary" to="/auth/student-login">Student Login</Link>
          <Link className="btn btn-secondary" to="/auth/student-signup">Student Sign Up</Link>
          <Link className="btn btn-primary" to="/auth/admin-login" style={{ gridColumn: '1 / -1' }}>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
