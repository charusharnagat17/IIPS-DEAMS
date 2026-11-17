import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/FacultyService';
import Modal from '../../components/Modal';
import { FileQuestion, Plus, Filter, Trash2, CheckCircle2, Code2, AlignLeft } from 'lucide-react';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Question Form state
  const [activeTab, setActiveTab] = useState('MCQ');
  const [formCourseId, setFormCourseId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('MEDIUM');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formMarks, setFormMarks] = useState(2);
  const [formNegativeMarks, setFormNegativeMarks] = useState(0.5);

  // MCQ Options
  const [options, setOptions] = useState([
    { id: 'A', text: '', correct: true, explanation: '' },
    { id: 'B', text: '', correct: false, explanation: '' },
    { id: 'C', text: '', correct: false, explanation: '' },
    { id: 'D', text: '', correct: false, explanation: '' }
  ]);

  // Descriptive
  const [modelAnswer, setModelAnswer] = useState('');

  // Code
  const [codeSnippet, setCodeSnippet] = useState('');
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cData = await facultyService.fetchCourses();
      if (cData) setCourses(cData);

      const sData = await facultyService.fetchSubjects();
      if (sData) setSubjects(sData);

      const qData = await facultyService.fetchQuestions();
      if (qData) setQuestions(qData);

      if (cData && cData.length > 0 && !formCourseId) {
        setFormCourseId(cData[0].code);
        const courseSubs = (sData || []).filter(s => s.courseId === cData[0].code);
        if (courseSubs.length > 0) {
          setFormSubjectId(courseSubs[0].code);
        } else if (sData && sData.length > 0) {
          setFormSubjectId(sData[0].code);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCourseChangeInForm = (courseCode) => {
    setFormCourseId(courseCode);
    const available = subjects.filter(s => s.courseId === courseCode);
    if (available.length > 0) {
      setFormSubjectId(available[0].code);
    } else {
      setFormSubjectId('');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formSubjectId) {
      alert('Please select a valid subject for the question.');
      return;
    }

    const newQuestion = {
      courseId: formCourseId,
      subjectId: formSubjectId,
      topic: formTopic || 'General',
      type: activeTab,
      difficulty: formDifficulty,
      questionText: formQuestionText,
      marks: parseFloat(formMarks),
      negativeMarks: activeTab === 'MCQ' ? parseFloat(formNegativeMarks) : 0,
      options: activeTab === 'MCQ' ? options : [],
      modelAnswer: activeTab === 'DESCRIPTIVE' ? modelAnswer : null,
      codeSnippet: activeTab === 'CODE' ? codeSnippet : null,
      testCases: activeTab === 'CODE' ? testCases : []
    };

    try {
      await facultyService.createQuestion(newQuestion);
      setIsModalOpen(false);
      // Reset form
      setFormQuestionText('');
      setFormTopic('');
      setModelAnswer('');
      setCodeSnippet('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this question from the Question Bank?')) {
      try {
        await facultyService.deleteQuestion(id);
        loadData();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // Filtered subjects for current filter selection
  const filteredSubjectsForView = selectedCourse === 'ALL'
    ? subjects
    : subjects.filter(s => s.courseId === selectedCourse);

  // Filtered subjects for form modal
  const formSubjectsList = formCourseId
    ? subjects.filter(s => s.courseId === formCourseId)
    : subjects;

  const filteredQuestions = questions.filter(q => {
    const matchesCourse = selectedCourse === 'ALL' || q.courseId === selectedCourse || subjects.some(s => s.code === q.subjectId && s.courseId === selectedCourse);
    const matchesSub = selectedSubject === 'ALL' || q.subjectId === selectedSubject;
    const matchesType = selectedType === 'ALL' || q.type === selectedType;
    return matchesCourse && matchesSub && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Question Bank Repository</h1>
          <p className="text-sm text-neutral-500">Manage Objective (MCQ), Subjective / Descriptive, and Code-based problems</p>
        </div>
        <button
          onClick={() => {
            if (courses.length > 0 && !formCourseId) {
              setFormCourseId(courses[0].code);
              const subs = subjects.filter(s => s.courseId === courses[0].code);
              if (subs.length > 0) setFormSubjectId(subs[0].code);
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-neutral-400" />
          
          {/* Course Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-neutral-500">Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSubject('ALL');
              }}
              className="text-xs font-semibold rounded-xl border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-hidden focus:border-black"
            >
              <option value="ALL">All Courses</option>
              {courses.map(c => (
                <option key={c.id || c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-neutral-500">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-hidden focus:border-black"
            >
              <option value="ALL">All Subjects</option>
              {filteredSubjectsForView.map(s => (
                <option key={s.id || s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Type Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-neutral-500">Format:</span>
          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold border border-neutral-200">
            {['ALL', 'MCQ', 'DESCRIPTIVE', 'CODE'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500 text-xs">
            <FileQuestion className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No questions found matching the selected criteria.</p>
            <p className="text-neutral-400 mt-1">Click "Add New Question" to add your syllabus problems to the repository.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q.id || idx} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-300">
                    {q.type}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-800">
                    {q.difficulty}
                  </span>

                  <span className="text-xs font-mono font-bold text-neutral-600">
                    {q.courseId ? `${q.courseId} • ` : ''}{q.subjectId} • {q.topic}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-neutral-800">+{q.marks} Marks</span>
                  {q.type === 'MCQ' && (
                    <span className="font-semibold text-neutral-500">-{q.negativeMarks || 0} Neg</span>
                  )}
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1 text-neutral-400 hover:text-black rounded transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-neutral-900 mt-3 leading-relaxed">
                {q.questionText}
              </p>

              {/* MCQ Options Display */}
              {q.type === 'MCQ' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        opt.correct
                          ? 'bg-neutral-100 border-neutral-400 text-black font-bold'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span><strong className="mr-1">{opt.id}.</strong> {opt.text}</span>
                      {opt.correct && <CheckCircle2 className="w-4 h-4 text-black shrink-0 ml-2" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Descriptive Model Rubric Display */}
              {q.type === 'DESCRIPTIVE' && q.modelAnswer && (
                <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-mono whitespace-pre-line">
                  <span className="block font-bold text-black mb-1 font-sans">Model Answer Rubric:</span>
                  {q.modelAnswer}
                </div>
              )}

              {/* Code Snippet Display */}
              {q.type === 'CODE' && (
                <div className="mt-3 p-3 rounded-xl bg-neutral-900 text-white text-xs font-mono">
                  <pre>{q.codeSnippet}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Question to Bank" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Format Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-bold border border-neutral-200">
            <button
              type="button"
              onClick={() => { setActiveTab('MCQ'); setFormMarks(2); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'MCQ' ? 'bg-black text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <FileQuestion className="w-4 h-4" />
              <span>Multiple Choice (MCQ)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('DESCRIPTIVE'); setFormMarks(10); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'DESCRIPTIVE' ? 'bg-black text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              <span>Subjective / Descriptive</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('CODE'); setFormMarks(10); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'CODE' ? 'bg-black text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code-Based</span>
            </button>
          </div>

          {/* Academic Selectors: Course, Subject, Topic, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Course</label>
              <select
                value={formCourseId}
                onChange={(e) => handleCourseChangeInForm(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                required
              >
                {courses.length === 0 ? (
                  <option value="">No courses created yet</option>
                ) : (
                  courses.map(c => (
                    <option key={c.id || c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Subject</label>
              <select
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                required
              >
                {formSubjectsList.length === 0 ? (
                  <option value="">No subjects for this course</option>
                ) : (
                  formSubjectsList.map(s => (
                    <option key={s.id || s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Topic / Unit</label>
              <input
                type="text"
                placeholder="e.g. Unit 1"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Difficulty</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Problem Statement / Question Text</label>
            <textarea
              required
              rows={3}
              placeholder="Enter question statement..."
              value={formQuestionText}
              onChange={(e) => setFormQuestionText(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Marks Awarded (+)</label>
              <input
                type="number"
                step="0.5"
                value={formMarks}
                onChange={(e) => setFormMarks(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
              />
            </div>

            {activeTab === 'MCQ' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Negative Marking Penalty (-)</label>
                <input
                  type="number"
                  step="0.25"
                  value={formNegativeMarks}
                  onChange={(e) => setFormNegativeMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
                />
              </div>
            )}
          </div>

          {/* Type Specific Fields */}
          {activeTab === 'MCQ' && (
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <label className="block text-xs font-bold text-neutral-700">Options (Select radio for correct answer)</label>
              {options.map((opt, i) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.correct}
                    onChange={() => {
                      setOptions(options.map((o, idx) => ({ ...o, correct: idx === i })));
                    }}
                    className="w-4 h-4 text-black focus:ring-black accent-black"
                  />
                  <span className="font-bold text-xs w-4">{opt.id}</span>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${opt.id} text`}
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i].text = e.target.value;
                      setOptions(updated);
                    }}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'DESCRIPTIVE' && (
            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <label className="block text-xs font-bold text-neutral-700">Model Answer & Scoring Rubrics</label>
              <textarea
                rows={4}
                placeholder="Enter evaluation guidelines and expected answer keys for examiners..."
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono focus:border-black"
              />
            </div>
          )}

          {activeTab === 'CODE' && (
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Starter Code Template</label>
                <textarea
                  rows={3}
                  placeholder="// Provide initial skeleton code or function signature"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono bg-neutral-900 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Unit Test Case Verification</label>
                {testCases.map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={tc.input}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].input = e.target.value;
                        setTestCases(updated);
                      }}
                      className="px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].expectedOutput = e.target.value;
                        setTestCases(updated);
                      }}
                      className="px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              Save to Question Bank
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
