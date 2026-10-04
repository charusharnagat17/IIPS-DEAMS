import React, { useState, useEffect } from 'react';
import { facultyService } from '../../services/FacultyService';
import { Sparkles, CheckCircle2, Shuffle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaperGenerator() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState({
    subjectId: '',
    examTitle: '',
    mcqCount: 5,
    descriptiveCount: 1,
    codeCount: 1,
    difficulty: 'ANY',
    randomize: true,
    totalMarks: 30,
    passingMarks: 12,
    durationMinutes: 60,
    negativeMarking: true,
    negativeFactor: 0.5
  });

  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const cData = await facultyService.fetchCourses();
        if (cData) setCourses(cData);

        const sData = await facultyService.fetchSubjects();
        if (sData) setSubjects(sData);

        if (cData && cData.length > 0) {
          const firstCourse = cData[0].code;
          setSelectedCourse(firstCourse);
          const courseSubs = (sData || []).filter(s => s.courseId === firstCourse);
          if (courseSubs.length > 0) {
            setForm(prev => ({
              ...prev,
              subjectId: courseSubs[0].code,
              examTitle: `${firstCourse} Examination: ${courseSubs[0].name}`
            }));
          } else if (sData && sData.length > 0) {
            setForm(prev => ({
              ...prev,
              subjectId: sData[0].code,
              examTitle: `Examination: ${sData[0].name}`
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleCourseChange = (courseCode) => {
    setSelectedCourse(courseCode);
    const available = subjects.filter(s => s.courseId === courseCode);
    if (available.length > 0) {
      setForm(prev => ({
        ...prev,
        subjectId: available[0].code,
        examTitle: `${courseCode} Examination: ${available[0].name}`
      }));
    } else {
      setForm(prev => ({ ...prev, subjectId: '' }));
    }
  };

  const handleSubjectChange = (subCode) => {
    const sub = subjects.find(s => s.code === subCode);
    setForm(prev => ({
      ...prev,
      subjectId: subCode,
      examTitle: sub ? `${selectedCourse || ''} Assessment: ${sub.name}` : prev.examTitle
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.subjectId) {
      alert('Please select a valid subject.');
      return;
    }
    setLoading(true);
    try {
      const exam = await facultyService.generatePaper(form);
      if (exam) {
        setGeneratedExam(exam);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = selectedCourse
    ? subjects.filter(s => s.courseId === selectedCourse)
    : subjects;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-black tracking-tight">Automated Question Paper Generator</h1>
        <p className="text-sm text-neutral-500">Auto-randomize question sets from the Question Bank based on syllabus blueprint</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Degree Program / Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-semibold bg-white focus:border-black"
                >
                  {courses.length === 0 ? (
                    <option value="">No courses created</option>
                  ) : (
                    courses.map(c => (
                      <option key={c.id || c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Target Subject</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-semibold bg-white focus:border-black"
                  required
                >
                  {filteredSubjects.length === 0 ? (
                    <option value="">No subjects found for this course</option>
                  ) : (
                    filteredSubjects.map(s => (
                      <option key={s.id || s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Examination Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-Term Assessment"
                value={form.examTitle}
                onChange={(e) => setForm({ ...form, examTitle: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
              />
            </div>

            {/* Question Counts Blueprint */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
              <span className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Question Distribution Blueprint
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Objective (MCQ)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.mcqCount}
                    onChange={(e) => setForm({ ...form, mcqCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Descriptive / Theory</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={form.descriptiveCount}
                    onChange={(e) => setForm({ ...form, descriptiveCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Code / Practical</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={form.codeCount}
                    onChange={(e) => setForm({ ...form, codeCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Examination Rules */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  value={form.passingMarks}
                  onChange={(e) => setForm({ ...form, passingMarks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:border-black"
                />
              </div>
            </div>

            {/* Negative Marking */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-neutral-900">Negative Marking Rule</span>
                <span className="text-[11px] text-neutral-500">Deduct marks for incorrect MCQ answers</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.negativeMarking}
                  onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })}
                  className="w-4 h-4 text-black rounded accent-black"
                />
                {form.negativeMarking && (
                  <input
                    type="number"
                    step="0.25"
                    value={form.negativeFactor}
                    onChange={(e) => setForm({ ...form, negativeFactor: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 border border-neutral-300 rounded-lg text-xs bg-white text-black font-bold focus:border-black"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>{loading ? 'Randomizing Questions...' : 'Auto Randomize & Generate Paper'}</span>
            </button>
          </form>
        </div>

        {/* Blueprint Info Side Card */}
        <div className="space-y-4">
          <div className="bg-neutral-900 rounded-2xl p-6 text-white shadow-xs">
            <Sparkles className="w-8 h-8 text-neutral-300 mb-3" />
            <h3 className="font-extrabold text-base">Intelligent Shuffling</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              When an exam is generated, the system creates a curated pool and performs dynamic candidate-level shuffling to prevent question sequence leaks.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-400 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-white" />
              <span>Negative marking calibrated</span>
            </div>
          </div>

          {generatedExam && (
            <div className="bg-white rounded-2xl border border-neutral-300 p-5 shadow-xs">
              <div className="flex items-center space-x-2 text-black">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <h4 className="font-extrabold text-sm">Paper Created!</h4>
              </div>
              <p className="text-xs text-neutral-800 font-semibold mt-2">{generatedExam.title}</p>
              <p className="text-xs text-neutral-500 mt-1">Questions: {generatedExam.questionIds?.length || 0} selected</p>
              <button
                onClick={() => navigate('/admin/schedules')}
                className="mt-3 w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                View In Schedules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
