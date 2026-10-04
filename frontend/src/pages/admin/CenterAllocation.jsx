import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import Modal from '../../components/Modal';
import { MapPin, Users, Plus, CheckCircle2, ShieldCheck, Building } from 'lucide-react';

export default function CenterAllocation() {
  const [schedules, setSchedules] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({
    centerName: '',
    roomNumber: '',
    capacity: 30,
    allocatedRollRange: '',
    invigilatorName: ''
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await adminService.fetchSchedules();
      if (data && data.length > 0) {
        setSchedules(data);
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedExam = schedules.find(s => s.id === selectedExamId) || schedules[0];

  const handleAddAllocation = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    const current = selectedExam.centerAllocations || [];
    const updated = [...current, allocForm];
    try {
      await adminService.allocateCenters(selectedExam.id, updated);
      setIsModalOpen(false);
      setAllocForm({
        centerName: '',
        roomNumber: '',
        capacity: 30,
        allocatedRollRange: '',
        invigilatorName: ''
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
          <h1 className="text-2xl font-black text-black tracking-tight">Exam Center & Room Allocations</h1>
          <p className="text-sm text-neutral-500">Physical and computer lab seat plans, roll number blocks & invigilation</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedExam}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Center / Lab</span>
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
          <Building className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold text-neutral-800">No active exam schedules found.</p>
          <p className="text-neutral-400 mt-1">Please create an exam schedule first before allocating testing rooms.</p>
        </div>
      ) : (
        <>
          {/* Select Exam Filter */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex items-center space-x-3">
            <Building className="w-5 h-5 text-black shrink-0" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Active Examination:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="flex-1 text-xs font-bold rounded-xl border border-neutral-300 p-2.5 bg-neutral-50 text-neutral-800 focus:outline-hidden"
            >
              {schedules.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.subjectId})</option>
              ))}
            </select>
          </div>

          {/* Center Cards Grid */}
          {!selectedExam?.centerAllocations || selectedExam.centerAllocations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
              <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-800">No rooms or centers allocated for this exam yet.</p>
              <p className="text-neutral-400 mt-1">Click "Allocate Center / Lab" to configure room number and invigilators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedExam.centerAllocations.map((c, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                        {c.roomNumber}
                      </span>
                      <span className="text-xs font-bold text-neutral-500 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Capacity: {c.capacity}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-neutral-900 text-sm mt-3">{c.centerName}</h3>
                    <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">Allocated Candidates</span>
                      <span className="font-mono font-semibold text-neutral-800">{c.allocatedRollRange}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-black" />
                      Invigilator:
                    </span>
                    <span className="font-bold text-neutral-800">{c.invigilatorName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Allocation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Exam Center / Lab Block">
        <form onSubmit={handleAddAllocation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Center / Building Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Takshashila Campus Computer Lab 1"
              value={allocForm.centerName}
              onChange={(e) => setAllocForm({ ...allocForm, centerName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Room / Lab Number</label>
              <input
                type="text"
                required
                placeholder="e.g. Lab 204"
                value={allocForm.roomNumber}
                onChange={(e) => setAllocForm({ ...allocForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Seating Capacity</label>
              <input
                type="number"
                min="10"
                value={allocForm.capacity}
                onChange={(e) => setAllocForm({ ...allocForm, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Allocated Roll Range</label>
            <input
              type="text"
              required
              placeholder="e.g. BCA-2024-001 to BCA-2024-060"
              value={allocForm.allocatedRollRange}
              onChange={(e) => setAllocForm({ ...allocForm, allocatedRollRange: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">Invigilator / Proctor Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Faculty Examiner"
              value={allocForm.invigilatorName}
              onChange={(e) => setAllocForm({ ...allocForm, invigilatorName: e.target.value })}
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
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Allocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
