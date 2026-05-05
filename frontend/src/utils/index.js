// frontend/src/utils/index.js

import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

// ─── Date Helpers ────────────────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return null;
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateShort = (date) => {
  if (!date) return null;
  return format(new Date(date), 'MMM d');
};

export const formatRelative = (date) => {
  if (!date) return null;
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'DONE') return false;
  return isPast(new Date(dueDate));
};

export const getDueDateLabel = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return formatDateShort(dueDate);
};

// ─── Priority ────────────────────────────────────────────────────────────────
export const PRIORITY_CONFIG = {
  HIGHEST: {
    label: 'Highest',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: '▲▲',
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-400',
    icon: '▲',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    icon: '■',
  },
  LOW: {
    label: 'Low',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-400',
    icon: '▼',
  },
  LOWEST: {
    label: 'Lowest',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-300',
    icon: '▼▼',
  },
};

export const getPriorityConfig = (priority) =>
  PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

// ─── Status ──────────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    color: 'text-navy-600',
    bg: 'bg-navy-100',
    border: 'border-navy-200',
    dot: 'bg-navy-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  DONE: {
    label: 'Done',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
};

export const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.TODO;

// ─── Error Parsing ───────────────────────────────────────────────────────────
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    'Something went wrong'
  );
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};
