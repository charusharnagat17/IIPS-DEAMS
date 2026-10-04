import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/StudentService';
import { ShieldCheck, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const exList = await studentService.fetchAvailableExams();
        setExams(exList);

        const resList = await studentService.fetchResults();
        setResults(resList);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
              Student Examination Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.getDisplayName()}</h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Roll No: {user?.getIdentifier()} {user?.courseId ? `• Program: ${user.courseId} Semester ${user.semester || 1}` : ''}
            </p>
          </div>

          <div className="bg-neutral-800/80 p-4 rounded-2xl border border-neutral-700 text-center sm:text-right">
            <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Exam Status</span>
            <span className="text-lg font-black text-white flex items-center justify-center sm:justify-end mt-1">
              <ShieldCheck className="w-5 h-5 mr-1 text-white" />
              Eligible to Sit
            </span>
          </div>
        </div>
      </div>

      {/* Live & Upcoming Examinations */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-black">Active & Scheduled Examinations</h2>
          <p className="text-xs text-neutral-500">Access proctored online tests with automatic evaluation</p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
            <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-800">No active examinations scheduled for your program at this time.</p>
            <p className="text-neutral-400 mt-1">Scheduled papers created by faculty will appear here when active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((ex) => {
              const isOngoing = ex.isLive();
              return (
                <div
                  key={ex.id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                    isOngoing ? 'border-black ring-1 ring-black' : 'border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isOngoing ? 'bg-black text-white animate-pulse' : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                      }`}>
                        {ex.getStatusBadge().text}
                      </span>
                      <span className="text-xs font-mono font-bold text-black">
                        {ex.subjectId}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black mt-3">{ex.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{ex.subjectName}</p>

                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Duration</span>
                        <span className="font-bold text-neutral-900">{ex.formatDuration()}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Max Marks</span>
                        <span className="font-bold text-neutral-900">{ex.totalMarks} M</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Neg Marking</span>
                        <span className="font-bold text-neutral-900">{ex.hasNegativeMarking() ? `-${ex.defaultNegativeFactor}` : 'None'}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2 text-[11px] text-neutral-700 bg-neutral-100 p-2.5 rounded-xl border border-neutral-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-neutral-800" />
                      <span>Anti-cheating active: Tab switches and fullscreen exits are recorded.</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Proctored session</span>
                    <button
                      onClick={() => navigate(`/student/exam/${ex.id}`)}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <span>Enter Examination Room</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Results & Marksheets */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-black">Completed Assessments & Official Marksheets</h2>
            <p className="text-xs text-neutral-500">View performance breakdown and generate verified digital transcripts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Paper Code</th>
                <th className="py-3.5 px-4">Total Score</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Letter Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Marksheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-400 text-xs">
                    No completed exam records yet.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-bold text-black">{r.examTitle}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{r.subjectCode}</td>
                    <td className="py-3.5 px-4 font-extrabold text-black">
                      {r.totalScore} / {r.maxMarks}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800">{r.percentage}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${r.getGradeBadgeStyle()}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.getPassStatusBadge().color}`}>
                        {r.getPassStatusBadge().text}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/student/marksheet/${r.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs transition-colors border border-neutral-300"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Marksheet</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
