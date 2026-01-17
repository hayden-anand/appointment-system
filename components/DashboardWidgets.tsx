
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DepartmentHeatmap } from '../types';

export const StatsCard: React.FC<{ label: string, value: string | number, trend?: string }> = ({ label, value, trend }) => (
  <div className="bg-white p-6 border border-zinc-100 rounded-sm shadow-sm">
    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
    {trend && <p className="text-xs mt-2 text-emerald-600 font-medium">↑ {trend} from yesterday</p>}
  </div>
);

export const QueueHeatmap: React.FC<{ data: DepartmentHeatmap[] }> = ({ data }) => {
  return (
    <div className="bg-white p-6 border border-zinc-100 rounded-sm shadow-sm h-full">
      <h3 className="text-sm font-semibold mb-6 uppercase tracking-widest text-zinc-400">Hospital Queue Heatmap</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="congestion" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.congestion > 0.8 ? '#EF4444' : entry.congestion > 0.5 ? '#F59E0B' : '#1F6AE1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
