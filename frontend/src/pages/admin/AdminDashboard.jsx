import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import StatCard from '../../components/StatCard';
import { Users, UserCheck, Calendar, ShieldAlert, PlusCircle, ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalSubjects: 0,
    totalExams: 0,
    totalSubmissions: 0,
    totalCheatingAlerts: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await adminService.fetchStats();
        if (statsData) setStats(statsData);

        const coursesData = await adminService.fetchCourses();
        if (coursesData) setCourses(coursesData);

        const logsData = await adminService.fetchAuditLogs();
        if (logsData) setRecentLogs(logsData.slice(0, 6));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Admin Examination Console</h1>
          <p className="text-sm text-neutral-500">IIPS-DEAMS • Central Administration & Exam Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/schedules"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Exam Schedule</span>
          </Link>
          <Link
            to="/admin/students"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Students</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled Candidates"
          icon={Users}
        />
        <StatCard
          title="Active Faculty"
          value={stats.totalFaculty}
          subtitle="Examiners & Paper Setters"
          icon={UserCheck}
        />
        <StatCard
          title="Exam Schedules"
          value={stats.totalExams}
          subtitle="Scheduled & Completed"
          icon={Calendar}
        />
        <StatCard
          title="Integrity Alerts"
          value={stats.totalCheatingAlerts}
          subtitle="Proctored Infractions"
          icon={ShieldAlert}
        />
      </div>

      {/* Course Breakdown & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Modules Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Academic Structure & Active Programs</h2>
              <p className="text-xs text-neutral-500">Enrolled degree programs and curriculums</p>
            </div>
            <Link to="/admin/courses" className="text-xs font-semibold text-neutral-900 hover:text-black flex items-center">
              Manage All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-300 rounded-xl bg-neutral-50">
              <BookOpen className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-700">No courses configured in the system yet.</p>
              <Link to="/admin/courses" className="mt-2 inline-block text-xs font-bold text-black underline">
                Add your first course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id || c.code} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{c.department || 'Department'}</span>
                  <h3 className="font-extrabold text-neutral-900 mt-1">{c.code}</h3>
                  <p className="text-xs text-neutral-600 truncate">{c.name}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-200 pt-2">
                    <span>Duration:</span>
                    <span className="font-bold text-neutral-800">{c.durationYears} Years ({c.totalSemesters} Sem)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health Card */}
        <div className="bg-neutral-900 rounded-2xl p-6 text-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-200 border border-neutral-700">
                System Active
              </span>
              <span className="text-xs text-neutral-400">Spring Boot + MongoDB</span>
            </div>
            <h3 className="text-lg font-bold mt-4">Security & Anti-Cheating Engine</h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Real-time browser blur detection, fullscreen enforcement, candidate-level question randomization, and automated negative marking are operational.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Audit Logging:</span>
            <span className="text-white font-bold">100% Synced</span>
          </div>
        </div>
      </div>

      {/* Recent Security & Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-black">Recent Security & System Audit Trail</h2>
            <p className="text-xs text-neutral-500">Live events recorded from student examination and faculty modules</p>
          </div>
          <Link to="/admin/audit" className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center">
            View All Logs <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 rounded-xl">
            No audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 uppercase tracking-wider font-semibold border-y border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-bold text-black">{log.action}</td>
                    <td className="py-3 px-4 text-neutral-700">{log.username} ({log.role?.replace('ROLE_', '')})</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{log.details}</td>
                    <td className="py-3 px-4 text-neutral-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
