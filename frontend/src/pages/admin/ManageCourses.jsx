import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import Modal from '../../components/Modal';
import { BookOpen, Plus, PlusCircle, Layers } from 'lucide-react';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: '',
    durationYears: 3,
    totalSemesters: 6,
    description: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    courseId: '',
    semester: 1,
    credits: 4,
    facultyId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cData = await adminService.fetchCourses();
      if (cData) {
        setCourses(cData);
        if (cData.length > 0 && !subjectForm.courseId) {
          setSubjectForm(prev => ({ ...prev, courseId: cData[0].code || cData[0].id }));
        }
      }
      const sData = await adminService.fetchSubjects();
      if (sData) setSubjects(sData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCourse({ ...courseForm, id: courseForm.code });
      setIsCourseModalOpen(false);
      setCourseForm({
        code: '',
        name: '',
        department: '',
        durationYears: 3,
        totalSemesters: 6,
        description: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await adminService.createSubject({ ...subjectForm, id: subjectForm.code });
      setIsSubjectModalOpen(false);
      setSubjectForm({
        code: '',
        name: '',
        courseId: courses[0]?.code || '',
        semester: 1,
        credits: 4,
        facultyId: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Courses & Curriculum Structure</h1>
          <p className="text-sm text-neutral-500">Degree programs and semester-wise course codes</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Degree Program</span>
          </button>
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Course Subject</span>
          </button>
        </div>
      </div>

      {/* Degree Programs Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-500">
          <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No degree programs configured yet.</p>
          <p className="text-neutral-400 mt-1">Click "Add Degree Program" to create BCA, MCA, M.Tech, etc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id || c.code} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-900 font-black text-xs">
                  {c.code}
                </span>
                <span className="text-xs text-neutral-500">{c.durationYears} Years Duration</span>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-sm mt-3">{c.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{c.department}</p>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                <span>Total Semesters:</span>
                <span className="font-bold text-black">{c.totalSemesters} Semesters</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Curriculum Subjects Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-black">Registered Subjects & Paper Codes</h2>
          <span className="text-xs font-semibold text-neutral-500">{subjects.length} Total Subjects</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Subject Code</th>
                <th className="py-3.5 px-4">Subject Title</th>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Credits</th>
                <th className="py-3.5 px-4">Assigned Examiner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400 text-xs">
                    No curriculum subjects registered yet. Click "Add Course Subject" to create subjects.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id || s.code} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{s.code}</td>
                    <td className="py-3.5 px-4 font-bold text-black">{s.name}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-700">{s.courseId}</td>
                    <td className="py-3.5 px-4 text-neutral-600">Semester {s.semester}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{s.credits} Credits</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">{s.facultyId || 'Unassigned'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Create New Degree Program">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Program Code</label>
              <input
                type="text"
                required
                placeholder="e.g. BCA"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="6"
                value={courseForm.durationYears}
                onChange={(e) => setCourseForm({ ...courseForm, durationYears: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Program Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Bachelor of Computer Applications"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Department</label>
            <input
              type="text"
              placeholder="e.g. Department of Computer Science"
              value={courseForm.department}
              onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Program
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subject to Curriculum">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="e.g. BCA-401"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Program</label>
              <select
                value={subjectForm.courseId}
                onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
                required
              >
                <option value="">Select Degree Course</option>
                {courses.map(c => (
                  <option key={c.id || c.code} value={c.code || c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Software Engineering"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="10"
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Add Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
