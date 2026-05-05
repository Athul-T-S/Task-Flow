// frontend/src/hooks/index.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, taskApi, dashboardApi } from '../api';

// ─── Projects ────────────────────────────────────────────────────────────────
export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await projectApi.list();
      return data.data.projects;
    },
  });

export const useProject = (projectId) =>
  useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await projectApi.get(projectId);
      return data.data.project;
    },
    enabled: !!projectId,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => projectApi.create(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectApi.update(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useAddMember = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectApi.addMember(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  });
};

export const useRemoveMember = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid) => projectApi.removeMember(projectId, uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  });
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const useTasks = (projectId, filters = {}) =>
  useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      const { data } = await taskApi.list(projectId, filters);
      return data.data.tasks;
    },
    enabled: !!projectId,
  });

export const useTask = (projectId, taskId) =>
  useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: async () => {
      const { data } = await taskApi.get(projectId, taskId);
      return data.data.task;
    },
    enabled: !!projectId && !!taskId,
  });

export const useCreateTask = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => taskApi.create(projectId, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useUpdateTask = (projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => taskApi.update(projectId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['task', projectId, taskId] });
    },
  });
};

export const useDeleteTask = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => taskApi.delete(projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useReorderTasks = (projectId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tasks) => taskApi.reorder(projectId, tasks),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useAddComment = (projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => taskApi.addComment(projectId, taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', projectId, taskId] }),
  });
};

export const useDeleteComment = (projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => taskApi.deleteComment(projectId, taskId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', projectId, taskId] }),
  });
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const useDashboard = (projectId) =>
  useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: async () => {
      const { data } = await dashboardApi.get(projectId);
      return data.data;
    },
    enabled: !!projectId,
  });
