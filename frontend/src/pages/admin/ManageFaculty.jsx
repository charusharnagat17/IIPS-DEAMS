import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import Modal from '../../components/Modal';
import { UserPlus, Mail, Award, CheckCircle2, UserCheck } from 'lucide-react';

export default function ManageFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    rollNoOrFacultyId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const data = await adminService.fetchFaculty();
      if (data) setFacultyList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createFaculty(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        username: '',
        email: '',
        rollNoOrFacultyId: '',
        password: ''
      });
      loadFaculty();
    } catch (err) {
      alert('Error creating faculty: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Faculty Management</h1>
          <p className="text-sm text-neutral-500">Examiners, paper setters, and invigilator appointments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {facultyList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
          <UserCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No faculty members registered in the system yet.</p>
          <p className="text-neutral-400 mt-1">Click "Add Faculty Member" above to appoint professors and examiners.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 text-neutral-900 border border-neutral-300 font-bold flex items-center justify-center text-sm shrink-0">
                  {f.fullName?.charAt(0) || 'F'}
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-sm">{f.fullName}</h3>
                  <p className="text-xs font-mono font-semibold text-neutral-700">{f.rollNoOrFacultyId}</p>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {f.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Designation</span>
                <span className="font-bold text-neutral-800">Examiner / Professor</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Appoint New Faculty Member"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Full Name & Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Faculty Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Faculty ID</label>
              <input
                type="text"
                required
                placeholder="e.g. FAC-101"
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
                placeholder="e.g. faculty_username"
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
              placeholder="e.g. faculty@iips.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Account Password</label>
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
              {loading ? 'Adding...' : 'Appoint Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
