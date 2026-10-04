import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/StudentService';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function MarksheetView() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const attemptModel = await studentService.fetchMarksheet(attemptId);
        setAttempt(attemptModel);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-12 text-neutral-500 text-xs">Generating marksheet...</div>;
  }

  if (!attempt) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 max-w-md mx-auto">
        <p className="text-sm font-semibold text-neutral-800">Marksheet record not found.</p>
        <p className="text-xs text-neutral-500 mt-1">Please ensure the examination has been taken and evaluated.</p>
        <Link to="/student/results" className="inline-block mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl">
          Back to Results
        </Link>
      </div>
    );
  }

  const att = attempt;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/student/results"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF Marksheet</span>
          </button>
        </div>
      </div>

      {/* Official Marksheet Document (Print-ready) */}
      <div className="bg-white rounded-3xl border-2 border-neutral-300 p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0 space-y-8">
        {/* University Official Header with Logo */}
        <div className="text-center border-b-2 border-black pb-6 space-y-1">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="IIPS DAVV Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            Devi Ahilya Vishwavidyalaya, Indore (M.P.)
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-neutral-800 uppercase tracking-wide">
            International Institute of Professional Studies (IIPS)
          </h2>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mt-1">
            Official Statement of Marks & Evaluation Grade Card
          </p>
        </div>

        {/* Candidate Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-neutral-500">Candidate Name</span>
            <span className="font-extrabold text-neutral-900 text-sm">{att.studentName || '—'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-neutral-500">Roll Number</span>
            <span className="font-mono font-extrabold text-black text-sm">{att.rollNo || '—'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-neutral-500">Degree Program</span>
            <span className="font-extrabold text-neutral-900">{att.courseId || '—'} {att.semester ? `(Semester ${att.semester})` : ''}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-neutral-500">Examination Title</span>
            <span className="font-extrabold text-neutral-900">{att.examTitle || 'Assessment Session'}</span>
          </div>
        </div>

        {/* Subject Score Breakdown Table */}
        <div className="border border-neutral-300 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-900 uppercase tracking-wider font-extrabold border-b border-neutral-300">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Objective Score</th>
                <th className="py-3 px-4 text-center">Subjective Score</th>
                <th className="py-3 px-4 text-center">Total Obtained</th>
                <th className="py-3 px-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="py-4 px-4 font-mono font-extrabold text-black">{att.subjectCode || '—'}</td>
                <td className="py-4 px-4 font-bold text-neutral-900">{att.subjectName || '—'}</td>
                <td className="py-4 px-4 text-center font-bold text-neutral-700">{att.maxMarks || 0}</td>
                <td className="py-4 px-4 text-center font-bold text-neutral-700">{att.objectiveScore || 0}</td>
                <td className="py-4 px-4 text-center font-bold text-neutral-700">{att.subjectiveScore || 0}</td>
                <td className="py-4 px-4 text-center font-black text-black text-sm">{att.totalScore || 0}</td>
                <td className="py-4 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-neutral-200 text-neutral-900 border border-neutral-300">
                    {att.grade}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Performance Summary Banner */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Final Assessment Result</span>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black">
                {att.passed ? 'PASSED' : 'FAILED'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-neutral-800 text-xs font-bold border border-neutral-700">
                Score: {att.percentage}%
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-neutral-400">
            <span className="block font-semibold">Awarded Letter Grade:</span>
            <span className="text-3xl font-black text-white">{att.grade}</span>
          </div>
        </div>

        {/* Faculty Remarks if present */}
        {att.facultyRemarks && (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <span className="block font-bold text-neutral-900 uppercase mb-1">Examiner Feedback / Note:</span>
            <p className="text-neutral-700 italic">"{att.facultyRemarks}"</p>
          </div>
        )}

        {/* Verification Footer & Signatures */}
        <div className="pt-8 border-t border-neutral-300 grid grid-cols-3 gap-4 text-center text-xs text-neutral-700">
          <div>
            <div className="h-12 flex items-end justify-center text-neutral-500 italic">
              System Verified
            </div>
            <p className="border-t border-neutral-300 pt-1 font-bold">DEAMS Automated Proctor</p>
          </div>
          <div className="flex flex-col items-center justify-end">
            <ShieldCheck className="w-8 h-8 text-neutral-800 mb-1" />
            <p className="border-t border-neutral-300 pt-1 font-bold">Digital Signature Authenticated</p>
          </div>
          <div>
            <div className="h-12 flex items-end justify-center font-bold text-neutral-900">
              Exam Section
            </div>
            <p className="border-t border-neutral-300 pt-1 font-bold">Controller of Examinations, IIPS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
