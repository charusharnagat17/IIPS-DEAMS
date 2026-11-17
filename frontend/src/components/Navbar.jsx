import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="IIPS DAVV Logo"
              className="w-11 h-11 object-contain"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-black tracking-tight text-lg">IIPS-DEAMS</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300">
                  Digital Examination System
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden md:block">
                International Institute of Professional Studies • DAVV Indore
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-neutral-900 leading-tight">
                    {user.fullName || user.username}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    {user.rollNoOrFacultyId} • {role?.replace('ROLE_', '')}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
