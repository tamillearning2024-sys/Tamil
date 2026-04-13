import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// role can be 'admin' or 'student'; if provided, route only allowed for that role
const ProtectedRoute = ({ role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'student') {
    if (!profile || profile.role !== 'student') return <Navigate to="/auth" replace />;
    if (!(profile.status === 'approved' || profile.approved === true)) {
      return <Navigate to="/auth/student-login" replace />;
    }
  }
  if (role && profile?.role !== role) {
    if (role === 'admin') return <Navigate to="/auth/admin-login" replace />;
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (profile?.role === 'student') {
      const y = profile.year ? encodeURIComponent(profile.year) : '';
      return <Navigate to={y ? `/student/year/${y}/dashboard` : '/auth'} replace />;
    }
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
