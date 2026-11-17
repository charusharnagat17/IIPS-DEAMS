import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import { ShieldAlert, ShieldCheck, Filter, Search } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, [selectedModule]);

  const loadLogs = async () => {
    try {
      const data = await adminService.fetchAuditLogs(selectedModule);
      if (data) setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesModule = selectedModule === 'ALL' || l.module === selectedModule;
    const matchesSearch = l.action?.toLowerCase().includes(search.toLowerCase()) ||
                          l.username?.toLowerCase().includes(search.toLowerCase()) ||
                          l.details?.toLowerCase().includes(search.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Security & Audit Logs</h1>
          <p className="text-sm text-neutral-500">Immutable ledger of student proctor alerts, logins, and examination actions</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-black"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-semibold text-neutral-600">Module:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-800 focus:outline-hidden"
          >
            <option value="ALL">All Modules</option>
            <option value="ADMIN">Admin</option>
            <option value="FACULTY">Faculty</option>
            <option value="STUDENT">Student (Proctoring)</option>
            <option value="AUTH">Authentication</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Triggered By</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Audit Details</th>
                <th className="py-3.5 px-4">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400 text-xs">
                    No security audit logs recorded matching this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAlert = log.action.includes('ALERT') || log.action.includes('CHEATING') || log.action.includes('WARNING');
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-4 font-bold flex items-center space-x-2">
                        {isAlert ? (
                          <ShieldAlert className="w-4 h-4 text-black shrink-0" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
                        )}
                        <span className={isAlert ? 'text-black font-extrabold' : 'text-neutral-800'}>{log.action}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{log.username}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                          {log.role?.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-700">{log.module}</td>
                      <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
