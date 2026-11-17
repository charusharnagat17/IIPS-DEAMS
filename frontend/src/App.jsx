import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageCourses from './pages/admin/ManageCourses';
import ExamSchedules from './pages/admin/ExamSchedules';
import CenterAllocation from './pages/admin/CenterAllocation';
import AuditLogs from './pages/admin/AuditLogs';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import QuestionBank from './pages/faculty/QuestionBank';
import PaperGenerator from './pages/faculty/PaperGenerator';
import SubjectiveEvaluation from './pages/faculty/SubjectiveEvaluation';
import ResultAnalytics from './pages/faculty/ResultAnalytics';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamPortal from './pages/student/ExamPortal';
import ResultsView from './pages/student/ResultsView';
import MarksheetView from './pages/student/MarksheetView';

// Standard Portal Layout (Navbar + Sidebar + Main content)
function PortalLayout() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Root Dispatcher
function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'ROLE_FACULTY') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Standalone Proctored Exam Hall (No sidebar to maximize screen space) */}
          <Route path="/student/exam/:examId" element={<ExamPortal />} />

          {/* Authenticated Portal Routes */}
          <Route element={<PortalLayout />}>
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/faculty" element={<ManageFaculty />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/schedules" element={<ExamSchedules />} />
            <Route path="/admin/centers" element={<CenterAllocation />} />
            <Route path="/admin/audit" element={<AuditLogs />} />

            {/* Faculty */}
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/questions" element={<QuestionBank />} />
            <Route path="/faculty/paper-generator" element={<PaperGenerator />} />
            <Route path="/faculty/evaluations" element={<SubjectiveEvaluation />} />
            <Route path="/faculty/analytics" element={<ResultAnalytics />} />

            {/* Student */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/exams" element={<StudentDashboard />} />
            <Route path="/student/results" element={<ResultsView />} />
            <Route path="/student/marksheet/:attemptId" element={<MarksheetView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
