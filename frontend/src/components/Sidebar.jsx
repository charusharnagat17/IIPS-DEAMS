import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  MapPin,
  ShieldAlert,
  FileQuestion,
  FileText,
  BarChart3,
  Award,
  PenTool
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useAuth();

  const getLinks = () => {
    if (role === 'ROLE_ADMIN') {
      return [
        { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
        { to: '/admin/students', label: 'Manage Students', icon: Users },
        { to: '/admin/faculty', label: 'Manage Faculty', icon: UserCheck },
        { to: '/admin/courses', label: 'Courses & Subjects', icon: BookOpen },
        { to: '/admin/schedules', label: 'Exam Schedules', icon: Calendar },
        { to: '/admin/centers', label: 'Center Allocation', icon: MapPin },
        { to: '/admin/audit', label: 'Security & Audit Logs', icon: ShieldAlert },
      ];
    }
    if (role === 'ROLE_FACULTY') {
      return [
        { to: '/faculty', label: 'Faculty Dashboard', icon: LayoutDashboard },
        { to: '/faculty/questions', label: 'Question Bank', icon: FileQuestion },
        { to: '/faculty/paper-generator', label: 'Auto Paper Generator', icon: PenTool },
        { to: '/faculty/evaluations', label: 'Evaluate Subjective', icon: FileText },
        { to: '/faculty/analytics', label: 'Result Analytics', icon: BarChart3 },
      ];
    }
    // Student
    return [
      { to: '/student', label: 'Student Dashboard', icon: LayoutDashboard },
      { to: '/student/exams', label: 'Online Exams', icon: Calendar },
      { to: '/student/results', label: 'Results & Marksheets', icon: Award },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'ROLE_ADMIN' ? 'Administrator Portal' : role === 'ROLE_FACULTY' ? 'Faculty Portal' : 'Student Examination Portal'}
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/faculty' || link.to === '/student'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        IIPS-DEAMS • v1.0.0
      </div>
    </aside>
  );
}
