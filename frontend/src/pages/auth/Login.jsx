import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('ROLE_STUDENT');
  const [isRegister, setIsRegister] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state (strictly for student role only)
  const [regData, setRegData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'ROLE_STUDENT',
    rollNoOrFacultyId: '',
    courseId: '',
    semester: 1
  });

  const { login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIsRegister(false);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(usernameOrEmail, password);

      if (selectedRole === 'ROLE_STUDENT' && data.role !== 'ROLE_STUDENT') {
        if (data.role === 'ROLE_ADMIN') navigate('/admin');
        else if (data.role === 'ROLE_FACULTY') navigate('/faculty');
        return;
      }

      if (selectedRole === 'ROLE_FACULTY' && data.role !== 'ROLE_FACULTY') {
        if (data.role === 'ROLE_ADMIN') {
          navigate('/admin');
          return;
        }
        setError('This account does not have Faculty privileges. Please use the Student login tab.');
        logout();
        return;
      }

      if (selectedRole === 'ROLE_ADMIN' && data.role !== 'ROLE_ADMIN') {
        setError('This account does not have Administrator privileges. Please select your authorized role.');
        logout();
        return;
      }

      if (data.role === 'ROLE_ADMIN') navigate('/admin');
      else if (data.role === 'ROLE_FACULTY') navigate('/faculty');
      else navigate('/student');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        ...regData,
        role: 'ROLE_STUDENT'
      });
      navigate('/student');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="max-w-4xl w-full">
        {/* Main 2-Column Grid Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* LEFT GRID: Institute Details */}
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-10 border-b md:border-b-0 md:border-r border-neutral-200 bg-neutral-50/50">
            <div className="mb-4">
              <img
                src="/logo.png"
                alt="IIPS DAVV Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-sm"
              />
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              IIPS-DEAMS
            </h1>
            <p className="text-sm font-semibold text-neutral-700 mt-1 max-w-xs">
              Digital Examination & Assessment Management System
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              International Institute of Professional Studies, DAVV Indore
            </p>
          </div>

          {/* RIGHT GRID: Role-Based Login Window */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            {/* Role Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 border border-neutral-200 mb-5">
              <button
                type="button"
                onClick={() => handleRoleChange('ROLE_STUDENT')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'ROLE_STUDENT'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('ROLE_FACULTY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'ROLE_FACULTY'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('ROLE_ADMIN')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'ROLE_ADMIN'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Tab Switcher (Only for Student role) */}
            {selectedRole === 'ROLE_STUDENT' ? (
              <div className="flex border-b border-neutral-200 mb-5">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    !isRegister
                      ? 'border-black text-black'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    isRegister
                      ? 'border-black text-black'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Register New Account
                </button>
              </div>
            ) : (
              <div className="border-b border-neutral-200 pb-2 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Sign In
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-neutral-700" />
                <span>{error}</span>
              </div>
            )}

            {!isRegister ? (
              /* Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Username or Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your username or email"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
              </form>
            ) : (
              /* Register Form (Strictly for Student Role Only) */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={regData.fullName}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={regData.username}
                      onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Student Roll Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Roll Number"
                      value={regData.rollNoOrFacultyId}
                      onChange={(e) => setRegData({ ...regData, rollNoOrFacultyId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.edu"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create a strong password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BCA, MCA"
                      value={regData.courseId}
                      onChange={(e) => setRegData({ ...regData, courseId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={regData.semester}
                      onChange={(e) => setRegData({ ...regData, semester: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-400 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          IIPS Digital Examination & Assessment Management System • Clean Institutional Setup
        </p>
      </div>
    </div>
  );
}
