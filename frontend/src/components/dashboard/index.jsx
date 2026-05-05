// frontend/src/components/dashboard/index.jsx

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Avatar } from '../ui';

// ─── Stat Card ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = 'blue', sub }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-primary', icon: 'bg-primary' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'bg-green-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'bg-red-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'bg-yellow-500' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-lg border border-navy-100 p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-navy-400 mt-1">{sub}</p>}
        </div>
        <div className={`${c.icon} w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ─── Status Bar Chart ─────────────────────────────────────────────────────────
const STATUS_COLORS = {
  TODO: '#7A869A',
  IN_PROGRESS: '#0052CC',
  DONE: '#36B37E',
};
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export const TasksByStatusChart = ({ data }) => {
  const chartData = (data || []).map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    count: d.count,
    fill: STATUS_COLORS[d.status] || '#97A0AF',
  }));

  return (
    <div className="bg-white rounded-lg border border-navy-100 p-5 shadow-card">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Tasks by Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBECF0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7A869A' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #DFE1E6' }}
            cursor={{ fill: '#F4F5F7' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tasks">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Priority Bar Chart ────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  HIGHEST: '#FF5630',
  HIGH: '#FF7452',
  MEDIUM: '#FFAB00',
  LOW: '#36B37E',
  LOWEST: '#97A0AF',
};
const PRIORITY_LABELS = {
  HIGHEST: 'Highest',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  LOWEST: 'Lowest',
};

export const TasksByPriorityChart = ({ data }) => {
  const chartData = (data || []).map((d) => ({
    name: PRIORITY_LABELS[d.priority] || d.priority,
    count: d.count,
    fill: PRIORITY_COLORS[d.priority] || '#97A0AF',
  }));

  return (
    <div className="bg-white rounded-lg border border-navy-100 p-5 shadow-card">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Tasks by Priority</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBECF0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7A869A' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #DFE1E6' }}
            cursor={{ fill: '#F4F5F7' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tasks">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Team Workload Donut Chart ─────────────────────────────────────────────────
const DONUT_COLORS = ['#0052CC', '#36B37E', '#FF7452', '#FFAB00', '#6554C0', '#00B8D9'];

export const TeamWorkloadChart = ({ memberStats }) => {
  const data = (memberStats || [])
    .filter((m) => m.taskCount > 0)
    .map((m) => ({
      name: m.user.name,
      value: m.taskCount,
      avatar: m.user.avatarUrl,
    }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-navy-100 p-5 shadow-card">
        <h3 className="text-sm font-semibold text-navy-800 mb-4">Team Workload</h3>
        <div className="flex items-center justify-center h-40 text-sm text-navy-300">
          No assigned tasks yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-navy-100 p-5 shadow-card">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Team Workload</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #DFE1E6' }}
            formatter={(value) => [`${value} tasks`, '']}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-navy-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Member Stats Table ───────────────────────────────────────────────────────
export const MemberStatsTable = ({ memberStats }) => (
  <div className="bg-white rounded-lg border border-navy-100 shadow-card">
    <div className="px-5 py-4 border-b border-navy-100">
      <h3 className="text-sm font-semibold text-navy-800">Team Members</h3>
    </div>
    <div className="divide-y divide-navy-50">
      {(memberStats || []).map((m) => (
        <div key={m.user.id} className="flex items-center gap-3 px-5 py-3">
          <Avatar user={m.user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{m.user.name}</p>
            <p className="text-xs text-navy-400">{m.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-navy-100 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (m.taskCount / Math.max(...(memberStats || []).map((ms) => ms.taskCount), 1)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-navy-600 w-12 text-right">
              {m.taskCount} tasks
            </span>
          </div>
        </div>
      ))}
      {(!memberStats || memberStats.length === 0) && (
        <div className="px-5 py-8 text-center text-sm text-navy-300">No members yet</div>
      )}
    </div>
  </div>
);
