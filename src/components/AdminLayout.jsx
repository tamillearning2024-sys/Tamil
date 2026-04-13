import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useYear } from '../context/YearContext';

const DESKTOP_BREAKPOINT = 1024;

const AdminLayout = () => {
  const { yearId } = useParams();
  const { selectedYear, setSelectedYear } = useYear();
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= DESKTOP_BREAKPOINT);

  useEffect(() => {
    if (yearId && yearId !== selectedYear) setSelectedYear(yearId);
  }, [yearId, selectedYear, setSelectedYear]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = useMemo(() => viewportWidth >= DESKTOP_BREAKPOINT, [viewportWidth]);

  useEffect(() => {
    // Keep sidebar open on desktop; close by default on tablet/mobile
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const shouldLockScroll = !isDesktop && isSidebarOpen;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, isSidebarOpen]);

  const sidebarClasses = `admin-sidebar ${isDesktop ? 'fixed' : 'drawer'} ${isSidebarOpen && !isDesktop ? 'is-open' : ''}`;
  const shellClasses = `admin-shell ${isDesktop ? 'has-fixed-sidebar' : ''}`;

  return (
    <div className={shellClasses}>
      <aside className={sidebarClasses} aria-label="Admin sidebar navigation">
        <AdminSidebar />
      </aside>

      {!isDesktop && isSidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
          role="presentation"
        />
      )}

      <main className="admin-main">
        <AdminTopbar
          year={yearId || selectedYear}
          onMenu={() => setSidebarOpen((prev) => !prev)}
          showMenu={!isDesktop}
        />
        <div className="container main-content admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
