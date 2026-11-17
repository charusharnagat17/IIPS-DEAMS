import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-neutral-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-900">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
