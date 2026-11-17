import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/FacultyService';
import { adminService } from '../../services/AdminService';
import StatCard from '../../components/StatCard';
import { BarChart3, Award, TrendingUp, CheckCircle2, XCircle, FileQuestion } from 'lucide-react';

export default function ResultAnalytics() {
  const [schedules, setSchedules] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    passCount: 0,
    failCount: 0,
    passPercentage: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    gradeDistribution: {}
  });
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const schedulesData = await adminService.fetchSchedules();
      if (schedulesData && schedulesData.length > 0) {
        setSchedules(schedulesData);
        setSelectedExamId(schedulesData[0].id);
        fetchAnalytics(schedulesData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async (id) => {
    try {
      const analyticsData = await facultyService.fetchAnalytics(id);
      if (analyticsData) setAnalytics(analyticsData);
      const subData = await facultyService.fetchSubmissions(id);
      if (subData) setSubmissions(subData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectExam = (id) => {
    setSelectedExamId(id);
    fetchAnalytics(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Examination Analytics & Performance</h1>
          <p className="text-sm text-neutral-500">Class aggregate distributions, pass ratios, and score metrics</p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500 text-xs">
          <FileQuestion className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No examination schedules available.</p>
          <p className="text-neutral-400 mt-1">Once examinations are scheduled and attempted by candidates, analytics will appear here.</p>
        </div>
      ) : (
        <>
          {/* Select Examination */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-neutral-700 shrink-0" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Select Assessment:</span>
            <select
              value={selectedExamId}
              onChange={(e) => handleSelectExam(e.target.value)}
              className="flex-1 text-xs font-semibold rounded-xl border border-neutral-300 p-2.5 bg-neutral-50 text-neutral-900 focus:border-black"
            >
              {schedules.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.subjectId})</option>
              ))}
            </select>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pass Percentage"
              value={`${analytics.passPercentage || 0}%`}
              subtitle={`${analytics.passCount || 0} of ${analytics.totalAttempts || 0} Passed`}
              icon={TrendingUp}
            />
            <StatCard
              title="Class Average"
              value={`${analytics.averageScore || 0} Marks`}
              subtitle="Mean score achieved"
              icon={Award}
            />
            <StatCard
              title="Highest Score"
              value={`${analytics.highestScore || 0} Marks`}
              subtitle="Top performance"
              icon={CheckCircle2}
            />
            <StatCard
              title="Lowest Score"
              value={`${analytics.lowestScore || 0} Marks`}
              subtitle="Class minimum"
              icon={XCircle}
            />
          </div>

          {/* Visual Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade Distribution Visual Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-black mb-1">Grade Frequency Distribution</h2>
              <p className="text-xs text-neutral-500 mb-6">Letter grades according to University Assessment Standards</p>

              <div className="space-y-4">
                {[
                  { grade: 'O', label: 'Outstanding (>= 90%)', count: analytics.gradeDistribution?.['O'] || 0 },
                  { grade: 'A+', label: 'Excellent (80-89%)', count: analytics.gradeDistribution?.['A+'] || 0 },
                  { grade: 'A', label: 'Very Good (70-79%)', count: analytics.gradeDistribution?.['A'] || 0 },
                  { grade: 'B+', label: 'Good (60-69%)', count: analytics.gradeDistribution?.['B+'] || 0 },
                  { grade: 'B', label: 'Above Average (50-59%)', count: analytics.gradeDistribution?.['B'] || 0 },
                  { grade: 'C', label: 'Pass (40-49%)', count: analytics.gradeDistribution?.['C'] || 0 },
                  { grade: 'F', label: 'Fail (< 40%)', count: analytics.gradeDistribution?.['F'] || 0 },
                ].map(item => {
                  const maxVal = Math.max(1, analytics.totalAttempts || 1);
                  const widthPct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={item.grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-neutral-700">
                        <span>Grade {item.grade} ({item.label})</span>
                        <span className="font-bold text-black">{item.count} Candidates</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden border border-neutral-200">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(widthPct, item.count > 0 ? 10 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anti-Cheating & Integrity Overview */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-black mb-1">Proctoring Integrity Summary</h2>
                <p className="text-xs text-neutral-500 mb-4">Anti-cheating violation frequency analysis</p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">Tab Switches Recorded</span>
                    <span className="text-xs font-bold text-black">
                      {submissions.reduce((acc, s) => acc + (s.tabSwitchCount || 0), 0)} detected
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">Fullscreen Exits</span>
                    <span className="text-xs font-bold text-black">
                      {submissions.reduce((acc, s) => acc + (s.fullscreenExitCount || 0), 0)} detected
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">Disqualified Candidates</span>
                    <span className="text-xs font-bold text-black">
                      {submissions.filter(s => s.status === 'TERMINATED_CHEATING').length} candidates
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 text-center">
                Automated security logs synchronizing with backend.
              </div>
            </div>
          </div>

          {/* Candidate Score Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-bold text-black">Evaluated Candidates Performance Roster</h2>
            </div>
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No candidate submissions evaluated for this examination yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Objective Score</th>
                      <th className="py-3.5 px-4">Subjective Score</th>
                      <th className="py-3.5 px-4">Total Score</th>
                      <th className="py-3.5 px-4">Percentage</th>
                      <th className="py-3.5 px-4">Grade</th>
                      <th className="py-3.5 px-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-black">{s.rollNo}</td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">{s.studentName}</td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-700">{s.objectiveScore || 0}</td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-700">{s.subjectiveScore || 0}</td>
                        <td className="py-3.5 px-4 font-extrabold text-black">{s.totalScore || 0} / {s.maxMarks || 30}</td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">{s.percentage || 0}%</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-100 text-neutral-900 border border-neutral-300">
                            {s.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.passed ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {s.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
