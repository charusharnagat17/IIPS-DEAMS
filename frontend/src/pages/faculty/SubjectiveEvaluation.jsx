import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/FacultyService';
import Modal from '../../components/Modal';
import { FileText, CheckCircle2, Code2, AlignLeft } from 'lucide-react';

export default function SubjectiveEvaluation() {
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evalMarks, setEvalMarks] = useState({});
  const [evalComments, setEvalComments] = useState({});
  const [overallRemarks, setOverallRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subData = await facultyService.fetchSubmissions();
      if (subData) setSubmissions(subData);
      const qData = await facultyService.fetchQuestions();
      if (qData) setQuestions(qData);
    } catch (e) {
      console.error(e);
    }
  };

  const openEvaluationModal = (att) => {
    setSelectedAttempt(att);
    const marksMap = {};
    const commentsMap = {};
    att.answers?.forEach(a => {
      if (a.questionType === 'DESCRIPTIVE' || a.questionType === 'CODE') {
        marksMap[a.questionId] = a.marksAwarded || 0;
        commentsMap[a.questionId] = a.facultyComment || '';
      }
    });
    setEvalMarks(marksMap);
    setEvalComments(commentsMap);
    setOverallRemarks(att.facultyRemarks || '');
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const evaluationPayload = {
        attemptId: selectedAttempt.id,
        evaluations: Object.keys(evalMarks).map(qId => ({
          questionId: qId,
          marksAwarded: parseFloat(evalMarks[qId]) || 0,
          facultyComment: evalComments[qId] || 'Evaluated'
        })),
        facultyRemarks: overallRemarks
      };

      await facultyService.evaluateSubmission(evaluationPayload);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black tracking-tight">Subjective Answer Evaluation</h1>
        <p className="text-sm text-neutral-500">Grade descriptive essays, theoretical derivations, and code implementations against rubrics</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        {submissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-800">No candidate submissions pending evaluation.</p>
            <p className="text-neutral-400 mt-1">Submitted examination scripts will appear here for grading.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Examination</th>
                  <th className="py-3.5 px-4">Objective Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {submissions.map((att) => (
                  <tr key={att.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-bold text-black">{att.studentName || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{att.rollNo || '—'}</td>
                    <td className="py-3.5 px-4 text-neutral-800 font-semibold">{att.examTitle}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {att.objectiveScore || 0} Marks
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'EVALUATED'
                          ? 'bg-black text-white'
                          : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {att.status === 'EVALUATED' ? 'Graded' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEvaluationModal(att)}
                        className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        {att.status === 'EVALUATED' ? 'Review & Re-grade' : 'Evaluate Script'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Modal with Side-by-Side View */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Evaluate Candidate: ${selectedAttempt?.studentName || ''} (${selectedAttempt?.rollNo || ''})`}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-6">
          <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-900 flex items-center justify-between">
            <span><strong>Exam:</strong> {selectedAttempt?.examTitle}</span>
            <span><strong>Auto-graded Objective Score:</strong> {selectedAttempt?.objectiveScore || 0} Marks</span>
          </div>

          <div className="space-y-6">
            {selectedAttempt?.answers
              ?.filter(a => a.questionType === 'DESCRIPTIVE' || a.questionType === 'CODE')
              .map((ans, idx) => {
                const questionObj = questions.find(q => q.id === ans.questionId);
                return (
                  <div key={ans.questionId} className="border border-neutral-300 rounded-2xl p-4 bg-neutral-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black flex items-center">
                        {ans.questionType === 'CODE' ? <Code2 className="w-4 h-4 mr-1 text-black" /> : <AlignLeft className="w-4 h-4 mr-1 text-black" />}
                        Question {idx + 1} ({ans.questionType}) • Max: {questionObj?.marks || 10} Marks
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-neutral-900 bg-white p-3 rounded-xl border border-neutral-200">
                      {questionObj?.questionText || 'Question statement'}
                    </p>

                    {/* Side-by-Side: Student Answer vs Rubric */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] font-bold text-neutral-800 uppercase mb-1">
                          Candidate Submitted Answer:
                        </span>
                        <div className="bg-white p-3 rounded-xl border border-neutral-300 text-xs min-h-[120px] font-mono whitespace-pre-wrap text-neutral-900">
                          {ans.descriptiveText || ans.codeSnippet || '(No answer provided)'}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-bold text-neutral-800 uppercase mb-1">
                          Official Model Answer / Rubric:
                        </span>
                        <div className="bg-white p-3 rounded-xl border border-neutral-300 text-xs min-h-[120px] font-mono whitespace-pre-wrap text-neutral-900">
                          {questionObj?.modelAnswer || (questionObj?.testCases ? 'Test cases criteria' : 'Standard academic rubric')}
                        </div>
                      </div>
                    </div>

                    {/* Marks Input & Comment */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-800 mb-1">Marks Awarded</label>
                        <input
                          type="number"
                          step="0.5"
                          max={questionObj?.marks || 10}
                          min="0"
                          value={evalMarks[ans.questionId] ?? 0}
                          onChange={(e) => setEvalMarks({ ...evalMarks, [ans.questionId]: e.target.value })}
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs bg-white font-bold focus:border-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-neutral-800 mb-1">Examiner Note / Feedback</label>
                        <input
                          type="text"
                          placeholder="Feedback on candidate solution..."
                          value={evalComments[ans.questionId] || ''}
                          onChange={(e) => setEvalComments({ ...evalComments, [ans.questionId]: e.target.value })}
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Overall Evaluation Remarks</label>
            <textarea
              rows={2}
              placeholder="Candidate performance summary..."
              value={overallRemarks}
              onChange={(e) => setOverallRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Finalize & Publish Grades'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
