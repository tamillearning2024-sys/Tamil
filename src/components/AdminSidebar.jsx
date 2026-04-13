import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useYear } from '../context/YearContext';

const years = ['1st Year', '2nd Year', '3rd Year'];

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/students', label: 'Students', icon: '👥' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
  { to: '/admin/profile', label: 'Profile', icon: '⚙️' }
];

const AdminSidebar = () => {
  const { logout } = useAuth();
  const { selectedYear } = useYear();

  return (
    <aside>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div className="logo-tile">TL</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Tamil Learning</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Admin Console</div>
        </div>
      </div>

      <div className="nav-label">Overview</div>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end}>
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div className="nav-label">Years</div>
      {years.map((y) => (
        <NavLink key={y} to={`/admin/year/${encodeURIComponent(y)}/dashboard`}>
          <span aria-hidden>📘</span>
          {y} {selectedYear === y ? '•' : ''}
        </NavLink>
      ))}

      <button className="btn btn-secondary" onClick={logout} style={{ marginTop: 'auto' }}>
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
