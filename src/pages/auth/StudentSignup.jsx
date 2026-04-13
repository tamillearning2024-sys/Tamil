import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentSignup = () => {
  const navigate = useNavigate();
  const { signupStudent } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', year: '1st Year' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signupStudent(form);
    } catch (err) {
      // signupStudent throws for success message as well
      const msg = err.message || '';
      if (msg.includes('Signup successful')) {
        setInfo(msg);
        navigate('/auth/student-login');
      } else {
        setError(msg || 'Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <h2>Create Student Account</h2>
        <form className="grid" style={{ gap: 12 }} onSubmit={handleSubmit}>
          <input className="input" placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Password (min 6 chars)" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          <select className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
            <option>1st Year</option><option>2nd Year</option><option>3rd Year</option>
          </select>
          {error && <div style={{ color: 'crimson', fontSize: 14 }}>{error}</div>}
          {info && <div style={{ color: 'green', fontSize: 14 }}>{info}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Sign Up'}
          </button>
          <div style={{ fontSize: 14 }}>
            Already have an account? <Link to="/auth/student-login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentSignup;
