import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/StudentService';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResultsView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await studentService.fetchResults();
        if (data) setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black tracking-tight">Examination Results & Performance</h1>
        <p className="text-sm text-neutral-500">Official transcripts, letter grades, and semester assessments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400 text-xs">Loading examination results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
          <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No examination results published yet.</p>
          <p className="text-neutral-400 mt-1">Evaluated tests and official grade transcripts will appear here once finalized by examiners.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-neutral-100 text-black border border-neutral-300">
                    Grade {r.grade}
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-500">{r.subjectCode}</span>
                </div>

                <h2 className="text-base font-bold text-black mt-3">{r.examTitle}</h2>
                <p className="text-xs text-neutral-500 mt-1">{r.subjectName}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Total Score</span>
                    <span className="font-extrabold text-black">{r.totalScore} / {r.maxMarks}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Percentage</span>
                    <span className="font-extrabold text-black">{r.percentage}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Status</span>
                    <span className="font-bold text-black">
                      {r.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Digital marksheet verified</span>
                <Link
                  to={`/student/marksheet/${r.id}`}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Marksheet</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
