import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/FacultyService';
import { adminService } from '../../services/AdminService';
import StatCard from '../../components/StatCard';
import { FileQuestion, PenTool, FileText, BarChart3, PlusCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const [questionCount, setQuestionCount] = useState(0);
  const [pendingEvaluations, setPendingEvaluations] = useState(0);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const questions = await facultyService.fetchQuestions();
        if (questions) setQuestionCount(questions.length);

        const submissions = await facultyService.fetchSubmissions();
        if (submissions) {
          const pending = submissions.filter(s => s.status === 'SUBMITTED').length;
          setPendingEvaluations(pending);
        }

        const schedules = await adminService.fetchSchedules();
        if (schedules) setExams(schedules);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Faculty Examination Portal</h1>
          <p className="text-sm text-neutral-500">Question banking, automated paper generation, and subjective evaluation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/faculty/questions"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to Question Bank</span>
          </Link>
          <Link
            to="/faculty/paper-generator"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>Randomize Question Paper</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bank Questions"
          value={questionCount}
          subtitle="MCQ, Descriptive & Code"
          icon={FileQuestion}
        />
        <StatCard
          title="Pending Evaluations"
          value={pendingEvaluations}
          subtitle="Descriptive answers to grade"
          icon={FileText}
        />
        <StatCard
          title="Curated Exams"
          value={exams.length}
          subtitle="Active & Scheduled"
          icon={PenTool}
        />
        <StatCard
          title="Analytics Status"
          value={exams.length > 0 ? "Active" : "Pending"}
          subtitle="Class score distribution"
          icon={BarChart3}
        />
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/faculty/questions"
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs hover:border-black transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-black">Question Bank Management</h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Create and categorize Multiple Choice Questions, Descriptive problems with model answers, and Code problems with test cases.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-black">
            <span>Manage Questions</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          to="/faculty/paper-generator"
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs hover:border-black transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <PenTool className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-black">Auto Paper Randomization</h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Specify blueprint criteria (count of MCQs, subjective & code questions) and let the engine randomly shuffle and generate the exam.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-black">
            <span>Generate Exam Paper</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          to="/faculty/evaluations"
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs hover:border-black transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-black">Subjective Answer Evaluation</h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Review submitted student responses side-by-side with model answer rubrics, input marks, and publish final grades.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-black">
            <span>Start Grading</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
