import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginSelection from './pages/auth/LoginSelection';
import StudentLogin from './pages/auth/StudentLogin';
import StudentSignup from './pages/auth/StudentSignup';
import AdminLogin from './pages/auth/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import StudentAutoRedirect from './components/StudentAutoRedirect';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminYear from './pages/admin/AdminYear';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';
import AdminStudents from './pages/admin/AdminStudents';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentUnits from './pages/student/StudentUnits';
import StudentTests from './pages/student/StudentTests';
import StudentTasks from './pages/student/StudentTasks';
import StudentReports from './pages/student/StudentReports';
import StudentNotes from './pages/student/StudentNotes';
import StudentProfile from './pages/student/StudentProfile';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<LoginSelection />} />
      <Route path="/auth/student-login" element={<StudentLogin />} />
      <Route path="/auth/student-signup" element={<StudentSignup />} />
      <Route path="/auth/admin-login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="year/:yearId/dashboard" element={<AdminYear />} />
          <Route path="year/:yearId/units" element={<AdminYear />} />
          <Route path="year/:yearId/tests" element={<AdminYear />} />
          <Route path="year/:yearId/reports" element={<AdminYear />} />
          <Route path="year/:yearId/students" element={<AdminYear />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentAutoRedirect />} />
          <Route path="dashboard" element={<StudentAutoRedirect />} />
          <Route path="year/:year/dashboard" element={<StudentDashboard />} />
          <Route path="year/:year/units" element={<StudentUnits />} />
          <Route path="year/:year/tests" element={<StudentTests />} />
          <Route path="year/:year/tasks" element={<StudentTasks />} />
          <Route path="year/:year/reports" element={<StudentReports />} />
          <Route path="year/:year/notes" element={<StudentNotes />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;
