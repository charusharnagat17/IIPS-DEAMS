import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import Modal from '../../components/Modal';
import { Calendar, Plus, Clock, Award, ShieldAlert, CheckCircle, Play } from 'lucide-react';

export default function ExamSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    courseId: '',
    subjectId: '',
    subjectName: '',
    semester: 1,
    durationMinutes: 60,
    totalMarks: 50,
    passingMarks: 20,
    negativeMarkingEnabled: true,
    defaultNegativeFactor: 0.5,
    status: 'SCHEDULED'
  });

  useEffect(() => {
    loadSchedules();
    loadSubjects();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await adminService.fetchSchedules();
      if (data) setSchedules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await adminService.fetchSubjects();
      if (data && data.length > 0) {
        setSubjects(data);
        setForm(prev => ({
          ...prev,
          subjectId: prev.subjectId || data[0].code,
          subjectName: prev.subjectName || data[0].name,
          courseId: prev.courseId || data[0].courseId,
          semester: prev.semester || data[0].semester
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selSub = subjects.find(s => s.code === form.subjectId);
      await adminService.createSchedule({
        ...form,
        subjectName: selSub?.name || form.subjectName,
        courseId: selSub?.courseId || form.courseId,
        semester: selSub?.semester || form.semester,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        questionIds: []
      });
      setIsModalOpen(false);
      setForm({
        title: '',
        courseId: subjects[0]?.courseId || '',
        subjectId: subjects[0]?.code || '',
        subjectName: subjects[0]?.name || '',
        semester: subjects[0]?.semester || 1,
        durationMinutes: 60,
        totalMarks: 50,
        passingMarks: 20,
        negativeMarkingEnabled: true,
        defaultNegativeFactor: 0.5,
        status: 'SCHEDULED'
      });
      loadSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Examination Schedules</h1>
          <p className="text-sm text-neutral-500">Configure online test slots, negative marking, and proctoring policies</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
          <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No examination schedules created yet.</p>
          <p className="text-neutral-400 mt-1">Click "Schedule New Exam" above to configure an assessment slot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((ex) => (
            <div key={ex.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    ex.status === 'ONGOING'
                      ? 'bg-black text-white animate-pulse'
                      : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                  }`}>
                    {ex.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-700">
                    {ex.subjectId} • {ex.courseId} Sem {ex.semester}
                  </span>
                </div>

                <h2 className="text-base font-bold text-black mt-3">{ex.title}</h2>
                <p className="text-xs text-neutral-500 mt-1">{ex.subjectName}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Duration</span>
                    <span className="text-xs font-bold text-black">{ex.durationMinutes} Mins</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Total Marks</span>
                    <span className="text-xs font-bold text-black">{ex.totalMarks} M</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Neg Marking</span>
                    <span className="text-xs font-bold text-neutral-900">{ex.negativeMarkingEnabled ? `-${ex.defaultNegativeFactor}` : 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Allocated Centers:</span>
                <span className="font-bold text-black">
                  {ex.centerAllocations?.length || 0} Test Centers Assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Examination Schedule">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Examination Title</label>
            <input
              type="text"
              required
              placeholder="e.g. End-Term Examination: Database Systems"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Target Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => {
                  const s = subjects.find(sub => sub.code === e.target.value);
                  setForm({
                    ...form,
                    subjectId: e.target.value,
                    subjectName: s?.name || '',
                    courseId: s?.courseId || form.courseId,
                    semester: s?.semester || form.semester
                  });
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
                required
              >
                <option value="">Select Curriculum Subject</option>
                {subjects.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name} ({s.courseId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="15"
                max="180"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Total Marks</label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Passing Marks</label>
              <input
                type="number"
                value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Negative Factor</label>
              <input
                type="number"
                step="0.25"
                value={form.defaultNegativeFactor}
                onChange={(e) => setForm({ ...form, defaultNegativeFactor: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
