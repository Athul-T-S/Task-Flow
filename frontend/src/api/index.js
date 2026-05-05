// frontend/src/api/index.js

import api from './axiosInstance';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

// ─── Projects ────────────────────────────────────────────────────────────────
export const projectApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, uid) => api.delete(`/projects/${id}/members/${uid}`),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const taskApi = {
  list: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  get: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  reorder: (projectId, tasks) =>
    api.patch(`/projects/${projectId}/tasks/reorder`, { tasks }),
  addComment: (projectId, taskId, body) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { body }),
  deleteComment: (projectId, taskId, commentId) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: (projectId) => api.get(`/projects/${projectId}/tasks/dashboard`),
};
