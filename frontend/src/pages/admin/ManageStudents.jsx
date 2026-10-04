import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import Modal from '../../components/Modal';
import { Users, UserPlus, Search, Filter, CheckCircle2, XCircle, Trash2, Edit } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    rollNoOrFacultyId: '',
    courseId: '',
    semester: 1,
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await adminService.fetchStudents();
      if (data) setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await adminService.fetchCourses();
      if (data && data.length > 0) {
        setCourses(data);
        setFormData(prev => ({ ...prev, courseId: prev.courseId || data[0].code || data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createStudent(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        username: '',
        email: '',
        rollNoOrFacultyId: '',
        courseId: courses[0]?.code || '',
        semester: 1,
        password: ''
      });
      loadStudents();
    } catch (err) {
      alert('Error creating student: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesCourse = selectedCourse === 'ALL' || s.courseId === selectedCourse;
    const matchesSearch = s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNoOrFacultyId?.toLowerCase().includes(search.toLowerCase()) ||
                          s.email?.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Manage Students</h1>
          <p className="text-sm text-neutral-500">Student enrollment, roster verification & course allotments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, roll no, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-black"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-semibold text-neutral-600">Program:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-800 focus:outline-hidden"
          >
            <option value="ALL">All Degree Programs</option>
            {courses.map((c) => (
              <option key={c.id || c.code} value={c.code || c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Course & Sem</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400 text-xs">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-bold text-black flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-900 font-bold flex items-center justify-center text-[11px] border border-neutral-300">
                        {s.fullName?.charAt(0) || 'S'}
                      </div>
                      <span>{s.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{s.rollNoOrFacultyId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                        {s.courseId} • Sem {s.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">{s.email}</td>
                    <td className="py-3.5 px-4">
                      {s.active !== false ? (
                        <span className="inline-flex items-center text-black font-semibold space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-neutral-500 font-semibold space-x-1">
                          <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Student: ${s.fullName}\nRoll: ${s.rollNoOrFacultyId}\nCourse: ${s.courseId} Sem ${s.semester}`)}
                        className="p-1 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll New Student to IIPS Portal"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Full Student Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Student Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Roll Number</label>
              <input
                type="text"
                required
                placeholder="e.g. BCA-2024-001"
                value={formData.rollNoOrFacultyId}
                onChange={(e) => setFormData({ ...formData, rollNoOrFacultyId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. student_username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              placeholder="e.g. student@iips.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Degree Program</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
                required
              >
                <option value="">Select Degree Course</option>
                {courses.map((c) => (
                  <option key={c.id || c.code} value={c.code || c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Current Semester</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Initial Password</label>
            <input
              type="password"
              placeholder="Leave blank for default password or enter custom"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
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
              disabled={loading}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {loading ? 'Enrolling...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
