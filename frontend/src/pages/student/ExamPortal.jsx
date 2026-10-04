import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/StudentService';
import { ExamSession } from '../../engine/ExamSession';
import { AntiCheatingEngine } from '../../engine/AntiCheatingEngine';
import Modal from '../../components/Modal';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  Maximize2,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw
} from 'lucide-react';

export default function ExamPortal() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lifecycle states
  const [hasStarted, setHasStarted] = useState(false);
  const [declaredRules, setDeclaredRules] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [exam, setExam] = useState(null);
  const [loadingPreExam, setLoadingPreExam] = useState(true);

  // OOP Session & Proctor Engines
  const sessionRef = useRef(null);
  const proctorRef = useRef(null);
  const timerRef = useRef(null);

  // React state mirroring engine for render updates
  const [, setForceUpdate] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(3600);
  const [infractionCount, setInfractionCount] = useState(0);

  // Modals & UI status
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Synced');
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rerender = () => setForceUpdate(prev => prev + 1);

  // Load exam metadata beforehand for the pre-exam declaration screen
  useEffect(() => {
    async function loadPreExamInfo() {
      try {
        const exams = await studentService.fetchAvailableExams();
        const found = exams.find(e => e.id === examId);
        if (found) {
          setExam(found);
        }
      } catch (err) {
        console.warn('Could not load pre-exam metadata:', err);
      } finally {
        setLoadingPreExam(false);
      }
    }
    loadPreExamInfo();
  }, [examId]);

  // 1. Start Session
  const startExamSession = async () => {
    if (!declaredRules) {
      alert('Please read and agree to the examination rules and anti-cheating guidelines.');
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      const data = await studentService.startExam(examId);
      setAttemptId(data.attemptId);
      setExam(data.exam);

      // Instantiate OOP ExamSession
      sessionRef.current = new ExamSession({
        questions: data.questions,
        durationMinutes: data.durationMinutes || (exam?.durationMinutes || 60)
      });

      // Instantiate OOP AntiCheatingEngine
      proctorRef.current = new AntiCheatingEngine({
        maxStrikes: 3,
        onInfraction: async ({ type, details, count }) => {
          setInfractionCount(count);
          setWarningMessage(`SECURITY WARNING #${count} of 3: ${details}`);
          setWarningModalOpen(true);
          try {
            await studentService.reportProctorAlert(data.attemptId, {
              examId,
              eventType: type,
              details: `Violation #${count}: ${details}`
            });
          } catch (e) {
            console.warn(e);
          }
        },
        onDisqualification: () => {
          setWarningMessage('CRITICAL SECURITY VIOLATION: Maximum infractions (3) exceeded! Exam auto-submitted.');
          setWarningModalOpen(true);
          setTimeout(() => {
            handleFinalSubmit('Auto-disqualified due to anti-cheating threshold.');
          }, 3000);
        }
      });

      proctorRef.current.attach();
      setSecondsLeft((data.durationMinutes || (exam?.durationMinutes || 60)) * 60);
      setHasStarted(true);
    } catch (err) {
      alert('Unable to initialize exam session: ' + err.message);
    }
  };

  // 2. Timer Lifecycle
  useEffect(() => {
    if (!hasStarted) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit('Exam time limit expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [hasStarted]);

  // Cleanup proctor engine on unmount
  useEffect(() => {
    return () => {
      if (proctorRef.current) {
        proctorRef.current.detach();
      }
    };
  }, []);

  // 3. Periodic Auto-Save
  useEffect(() => {
    if (!hasStarted || !attemptId || !sessionRef.current) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        setAutoSaveStatus('Saving...');
        await studentService.autoSaveAnswers(attemptId, sessionRef.current.getAnswersArray());
        setAutoSaveStatus('All answers auto-saved');
      } catch (err) {
        setAutoSaveStatus('Draft stored locally');
      }
    }, 20000);

    return () => clearInterval(autoSaveInterval);
  }, [hasStarted, attemptId]);

  // Answer modification handlers delegated to session
  const handleOptionSelect = (optionId) => {
    const q = sessionRef.current?.getCurrentQuestion();
    if (q) {
      sessionRef.current.setOption(q.id, optionId);
      setAutoSaveStatus('Auto-saved');
      rerender();
    }
  };

  const handleDescriptiveChange = (text) => {
    const q = sessionRef.current?.getCurrentQuestion();
    if (q) {
      sessionRef.current.setDescriptive(q.id, text);
      rerender();
    }
  };

  const handleCodeChange = (code) => {
    const q = sessionRef.current?.getCurrentQuestion();
    if (q) {
      sessionRef.current.setCode(q.id, code);
      rerender();
    }
  };

  const toggleMarkForReview = () => {
    const q = sessionRef.current?.getCurrentQuestion();
    if (q) {
      sessionRef.current.toggleReview(q.id);
      rerender();
    }
  };

  const clearCurrentResponse = () => {
    const q = sessionRef.current?.getCurrentQuestion();
    if (q) {
      sessionRef.current.clearResponse(q.id);
      rerender();
    }
  };

  // Final submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    if (proctorRef.current) proctorRef.current.detach();

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      const answersArray = sessionRef.current ? sessionRef.current.getAnswersArray() : [];
      const attemptModel = await studentService.submitExam(attemptId, {
        examId,
        answers: answersArray,
        tabSwitchCount: infractionCount
      });

      navigate(`/student/marksheet/${attemptModel.id || attemptId}`);
    } catch (e) {
      alert('Error during submission: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const session = sessionRef.current;
  const currentQ = session ? session.getCurrentQuestion() : null;
  const currentAns = session ? session.getCurrentAnswer() : null;
  const stats = session ? session.getStatistics() : { total: 0, answered: 0, unanswered: 0, review: 0 };

  // --- SCREEN 1: Pre-Exam Declaration ---
  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
          <div className="bg-neutral-900 p-6 sm:p-8 text-white">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
              Official Assessment Session
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-2 text-white">
              {exam ? `${exam.title} (${exam.subjectId || exam.subjectName || ''})` : 'Digital Examination Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Candidate: {user?.getDisplayName()} • Roll No: {user?.getIdentifier()}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <span className="block text-[10px] uppercase font-bold text-neutral-500">Duration</span>
                <span className="text-sm font-black text-neutral-900">
                  {exam ? `${exam.durationMinutes} Minutes` : 'Time-bound'}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <span className="block text-[10px] uppercase font-bold text-neutral-500">Max Marks</span>
                <span className="text-sm font-black text-neutral-900">
                  {exam ? `${exam.totalMarks} Marks` : 'Prescribed'}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <span className="block text-[10px] uppercase font-bold text-neutral-500">Negative Marking</span>
                <span className="text-sm font-black text-neutral-900">
                  {exam?.hasNegativeMarking?.() || exam?.negativeMarkingEnabled
                    ? `-${exam.defaultNegativeFactor || 0.5} Marks / MCQ`
                    : 'None'}
                </span>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50 space-y-3 text-xs text-neutral-700 leading-relaxed">
              <h3 className="font-extrabold text-neutral-900 text-sm flex items-center">
                <ShieldAlert className="w-4 h-4 text-neutral-900 mr-1.5" />
                Anti-Cheating & Examination Protocol:
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li><strong>Fullscreen Enforcement:</strong> Must be taken in Fullscreen. Exiting triggers an infraction.</li>
                <li><strong>Strict Tab Switch Detection:</strong> Switching browser tabs logs an infraction immediately.</li>
                <li><strong>Three-Strike Disqualification:</strong> 3 infractions result in automatic termination and submission.</li>
                <li><strong>Dynamic Shuffling:</strong> Questions and options are randomized per student.</li>
                <li><strong>Periodic Auto-Save:</strong> Draft answers synchronize every 20 seconds.</li>
                <li>Right-click, devtools, and copy/paste shortcuts are strictly locked.</li>
              </ul>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
              <input
                type="checkbox"
                id="declare"
                checked={declaredRules}
                onChange={(e) => setDeclaredRules(e.target.checked)}
                className="w-4 h-4 accent-black rounded mt-0.5 cursor-pointer"
              />
              <label htmlFor="declare" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                I declare that I am sitting for this examination individually without external assistance. I understand that my screen activity is tracked and violations lead to automated disqualification.
              </label>
            </div>

            <button
              onClick={startExamSession}
              disabled={!declaredRules || loadingPreExam}
              className="w-full py-4 rounded-2xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Maximize2 className="w-5 h-5" />
              <span>Enter Secure Fullscreen Mode & Start Exam</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: Proctored Examination Hall ---
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col fixed inset-0 z-50 select-none">
      {/* Top Proctor Bar */}
      <header className="bg-neutral-900 text-white px-4 sm:px-6 py-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 font-bold text-xs text-white">
            IIPS-DEAMS
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {exam?.title || 'Examination Session'}
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Roll No: {user?.getIdentifier()} • Candidate: {user?.getDisplayName()}
            </p>
          </div>
        </div>

        {/* Live Countdown Timer & Infractions Count */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold">
            <ShieldAlert className={`w-4 h-4 ${infractionCount > 0 ? 'text-white animate-pulse' : 'text-neutral-400'}`} />
            <span className={infractionCount > 0 ? 'text-white font-bold' : 'text-neutral-300'}>
              Violations: {infractionCount}/3
            </span>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-black ${
            secondsLeft < 300 ? 'bg-neutral-950 text-white border-neutral-500 animate-pulse' : 'bg-neutral-800 text-neutral-100 border-neutral-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Active Question Viewer Area */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto p-4 sm:p-8">
          {currentQ ? (
            <div className="max-w-4xl w-full mx-auto space-y-6">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-neutral-900">
                    Question {session.currentIndex + 1} of {session.totalQuestions}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                    {currentQ.type}
                  </span>
                  {currentQ.topic && <span className="text-xs text-neutral-500 font-semibold">• {currentQ.topic}</span>}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-extrabold text-black font-mono">{currentQ.formatMarks()}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{autoSaveStatus}</span>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* 1. MCQ Choices */}
              {currentQ.isObjective() && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = currentAns?.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionSelect(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-100 border-2 border-black text-black font-bold ring-1 ring-neutral-400'
                            : 'bg-white border-neutral-200 hover:border-neutral-400 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isSelected ? 'bg-black text-white border-black' : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                          }`}>
                            {opt.id}
                          </div>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-black shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Descriptive Area */}
              {currentQ.type === 'DESCRIPTIVE' && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">Type your subjective answer below:</span>
                    <span>Words: {currentAns?.descriptiveText ? currentAns.descriptiveText.trim().split(/\s+/).filter(Boolean).length : 0}</span>
                  </div>
                  <textarea
                    rows={8}
                    placeholder="Provide a comprehensive academic explanation or analysis..."
                    value={currentAns?.descriptiveText || ''}
                    onChange={(e) => handleDescriptiveChange(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-neutral-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-black leading-relaxed"
                  />
                </div>
              )}

              {/* 3. Code Workspace */}
              {currentQ.type === 'CODE' && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-neutral-600 block">
                    Source Code Solution Workspace:
                  </span>
                  <textarea
                    rows={8}
                    value={currentAns?.codeSnippet || ''}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-neutral-700 bg-neutral-950 text-neutral-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-500"
                  />
                  {currentQ.sampleIo && currentQ.sampleIo.length > 0 && (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-neutral-900">Sample Test Case:</span>
                      <p className="text-neutral-700 font-mono">Input: {currentQ.sampleIo[0].input}</p>
                      <p className="text-neutral-700 font-mono">Expected Output: {currentQ.sampleIo[0].expectedOutput}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMarkForReview}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      currentAns?.isMarkedForReview
                        ? 'bg-neutral-800 text-white border-neutral-800'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{currentAns?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    onClick={clearCurrentResponse}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={session.currentIndex === 0}
                    onClick={() => { session.previous(); rerender(); }}
                    className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!session.next()) {
                        setIsSubmitConfirmOpen(true);
                      }
                      rerender();
                    }}
                    className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm"
                  >
                    <span>{session.currentIndex < session.totalQuestions - 1 ? 'Save & Next' : 'Finish & Review'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-400 py-12 text-xs">No question loaded</div>
          )}
        </main>

        {/* Right: Question Navigation Palette */}
        <aside className="w-80 bg-neutral-50 border-l border-neutral-200 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-800 mb-3">
              Question Palette
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-3 bg-white rounded-2xl border border-neutral-200">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-black inline-block shrink-0" />
                <span className="text-neutral-700 font-medium">Answered ({stats.answered})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-300 inline-block shrink-0 border border-neutral-400" />
                <span className="text-neutral-700 font-medium">Not Answered ({stats.unanswered})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-700 inline-block shrink-0" />
                <span className="text-neutral-700 font-medium">Review ({stats.review})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-100 border border-neutral-300 inline-block shrink-0" />
                <span className="text-neutral-700 font-medium">Not Visited</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {session?.questions.map((q, idx) => {
                const ans = session.answers[q.id];
                const isCurrent = idx === session.currentIndex;

                let badgeColor = 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200';
                if (ans?.isMarkedForReview) {
                  badgeColor = 'bg-neutral-700 text-white';
                } else if (ans?.isAttempted) {
                  badgeColor = 'bg-black text-white';
                } else if (idx <= session.currentIndex) {
                  badgeColor = 'bg-neutral-300 text-neutral-900 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => { session.setCurrentIndex(idx); rerender(); }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${badgeColor} ${
                      isCurrent ? 'ring-2 ring-black ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Final Submit Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Proctor Security Warning Modal */}
      <Modal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        title="Anti-Cheating Security Alert"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 text-base">Infraction Recorded</h4>
            <p className="text-xs text-neutral-800 font-semibold mt-1 bg-neutral-100 p-3 rounded-xl border border-neutral-300">
              {warningMessage}
            </p>
          </div>
          <button
            onClick={() => setWarningModalOpen(false)}
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            I Acknowledge & Return to Exam
          </button>
        </div>
      </Modal>

      {/* Final Submission Confirmation Modal */}
      <Modal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        title="Confirm Examination Submission"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">
            Are you sure you want to finalize and submit your test answers?
          </p>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-xs">
            <div>
              <span className="block text-neutral-500 font-bold text-[10px]">Answered</span>
              <span className="font-bold text-black text-sm">{stats.answered}</span>
            </div>
            <div>
              <span className="block text-neutral-500 font-bold text-[10px]">Unanswered</span>
              <span className="font-bold text-neutral-600 text-sm">{stats.unanswered}</span>
            </div>
            <div>
              <span className="block text-neutral-500 font-bold text-[10px]">In Review</span>
              <span className="font-bold text-neutral-800 text-sm">{stats.review}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsSubmitConfirmOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Back to Test
            </button>
            <button
              onClick={() => handleFinalSubmit()}
              disabled={submitting}
              className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Yes, Submit Test'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
