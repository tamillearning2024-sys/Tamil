import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import tu from "../../assest/TU.png";
import av from "../../assest/av logo.jpg";
import fp from "../../assest/faceprep.png";
import KuralHeader from "./KuralHeader";

const StudentLayout = () => {
  const { logout, profile } = useAuth();
  const { year } = useParams();
  const location = useLocation();
  const { selectedYear, setSelectedYear } = useYear();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    const assignedYear = profile?.year;
    if (!assignedYear) return;

    if (year && year !== selectedYear) setSelectedYear(year);

    if (!year) {
      if (location.pathname.startsWith('/student/profile')) {
        if (selectedYear !== assignedYear) setSelectedYear(assignedYear);
        return;
      }
      navigate(`/student/year/${encodeURIComponent(assignedYear)}/dashboard`, { replace: true });
      return;
    }

    if (year !== assignedYear) {
      const segments = location.pathname.split('/').slice(4);
      const suffix = segments.length ? `/${segments.join('/')}` : '/dashboard';
      navigate(`/student/year/${encodeURIComponent(assignedYear)}${suffix}`, { replace: true });
      return;
    }

    if (selectedYear !== assignedYear) setSelectedYear(assignedYear);
  }, [year, selectedYear, setSelectedYear, navigate, profile, location.pathname]);

  const currentYear = year || profile?.year || selectedYear || '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        className={`sidebar ${open ? 'mobile-drawer' : ''} ${!open && isMobile ? 'mobile-hidden' : ''}`}
        aria-label="Student sidebar navigation"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-tile">TL</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Student</div>
            <div style={{ fontSize: 12, opacity: 0.75, wordBreak: 'break-word' }}>{profile?.email}</div>
          </div>
        </div>

        <div className="nav-label">Navigate</div>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/dashboard`} onClick={() => setOpen(false)}>Dashboard</NavLink>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/units`} onClick={() => setOpen(false)}>Units</NavLink>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/tests`} onClick={() => setOpen(false)}>Tests</NavLink>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/tasks`} onClick={() => setOpen(false)}>Tasks</NavLink>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/reports`} onClick={() => setOpen(false)}>Reports</NavLink>
        <NavLink to={`/student/year/${encodeURIComponent(currentYear)}/notes`} onClick={() => setOpen(false)}>Notes</NavLink>
        <NavLink to="/student/profile" onClick={() => setOpen(false)}>Profile</NavLink>

        <button className="btn btn-secondary" onClick={() => { setOpen(false); logout(); }} style={{ marginTop: 'auto' }}>
          Logout
        </button>
      </aside>

      {open && isMobile && <div className="overlay" onClick={() => setOpen(false)} aria-label="Close sidebar overlay" />}

      <main style={{ flex: 1 }}>
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger" onClick={() => setOpen(!open)}>
              <span />
              <span />
              <span />
            </button>
            <div className="header-logos">
              <div className="logo-chip"><img src={tu} alt="TU logo" /></div>
              <div className="logo-chip"><img src={av} alt="AV logo" /></div>
              <div className="logo-chip"><img src={fp} alt="Faceprep logo" /></div>
            </div>
          </div>
          <div className="kural-wrap"><KuralHeader /></div>
        </div>
        <div className="container main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
