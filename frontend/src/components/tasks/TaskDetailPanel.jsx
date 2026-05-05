// frontend/src/components/tasks/TaskDetailPanel.jsx

import { useState, useEffect, useRef } from 'react';
import { useTask, useUpdateTask, useDeleteTask, useAddComment, useDeleteComment, useProject } from '../../hooks';
import { Avatar, PriorityBadge, StatusBadge, Button, Spinner, Select } from '../ui';
import { formatDate, formatRelative, isOverdue, getErrorMessage } from '../../utils';
import { useAuth } from '../../context/AuthContext';

const PRIORITY_OPTIONS = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];
const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const PRIORITY_LABELS = { HIGHEST: '▲▲ Highest', HIGH: '▲ High', MEDIUM: '■ Medium', LOW: '▼ Low', LOWEST: '▼▼ Lowest' };

export const TaskDetailPanel = ({ taskId, projectId, onClose, onDeleted }) => {
  const { user } = useAuth();
  const { data: task, isLoading } = useTask(projectId, taskId);
  const { data: project } = useProject(projectId);
  const updateMutation = useUpdateTask(projectId, taskId);
  const deleteMutation = useDeleteTask(projectId);
  const addCommentMutation = useAddComment(projectId, taskId);
  const deleteCommentMutation = useDeleteComment(projectId, taskId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const titleRef = useRef();
  const commentRef = useRef();

  useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setDescValue(task.description || '');
    }
  }, [task]);

  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue !== task?.title) {
      await updateMutation.mutateAsync({ title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleDescSave = async () => {
    if (descValue !== task?.description) {
      await updateMutation.mutateAsync({ description: descValue || null });
    }
    setEditingDescription(false);
  };

  const handleFieldUpdate = (field) => async (e) => {
    const value = e.target.value || null;
    await updateMutation.mutateAsync({ [field]: value });
  };

  const handleAddComment = async () => {
    if (!commentBody.trim()) return;
    await addCommentMutation.mutateAsync(commentBody.trim());
    setCommentBody('');
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(taskId);
    onDeleted?.();
    onClose();
  };

  const overdue = task ? isOverdue(task.dueDate, task.status) : false;
  const memberOptions = (project?.members || []).map((m) => ({
    value: m.user.id,
    label: m.user.name,
  }));

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(9,30,66,0.3)' }} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-panel 
                      flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 shrink-0">
          <div className="flex items-center gap-3">
            {task && <StatusBadge status={task.status} />}
            <span className="text-xs text-navy-400 font-mono">
              {project?.key}-{task?.id?.slice(-4).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-navy-400 hover:text-danger hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-danger">Delete this task?</span>
                <Button size="xs" variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>
                  Yes, delete
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-navy-400 hover:text-navy-700 hover:bg-navy-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex">
              {/* Main content */}
              <div className="flex-1 px-6 py-5 space-y-5">
                {/* Title */}
                {editingTitle ? (
                  <div>
                    <textarea
                      ref={titleRef}
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTitleSave();
                        }
                        if (e.key === 'Escape') {
                          setTitleValue(task.title);
                          setEditingTitle(false);
                        }
                      }}
                      className="w-full text-xl font-semibold text-navy-900 border border-primary-300 
                                 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                      rows={2}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1
                    onClick={() => setEditingTitle(true)}
                    className="text-xl font-semibold text-navy-900 cursor-text hover:bg-navy-50 
                               rounded p-1 -m-1 transition-colors leading-snug"
                  >
                    {task.title}
                  </h1>
                )}

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  {editingDescription ? (
                    <div>
                      <textarea
                        value={descValue}
                        onChange={(e) => setDescValue(e.target.value)}
                        className="w-full border border-primary-300 rounded p-3 text-sm 
                                   focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none min-h-28"
                        rows={5}
                        autoFocus
                        placeholder="Add a description..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" loading={updateMutation.isPending} onClick={handleDescSave}>
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => {
                          setDescValue(task.description || '');
                          setEditingDescription(false);
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingDescription(true)}
                      className="min-h-12 cursor-text hover:bg-navy-50 rounded p-2 -m-2 
                                 transition-colors text-sm text-navy-700 leading-relaxed"
                    >
                      {task.description || (
                        <span className="text-navy-300 italic">Add a description...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">
                    Activity ({task.comments?.length || 0})
                  </p>

                  {/* Add comment */}
                  <div className="flex gap-2 mb-4">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1">
                      <textarea
                        ref={commentRef}
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border border-navy-200 rounded p-2.5 text-sm 
                                   focus:outline-none focus:ring-2 focus:ring-primary-200 
                                   focus:border-primary resize-none transition-all"
                        rows={commentBody ? 3 : 1}
                      />
                      {commentBody && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={handleAddComment}
                            loading={addCommentMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setCommentBody('')}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-3">
                    {(task.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-2 group">
                        <Avatar user={comment.author} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-navy-900">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-navy-400">
                              {formatRelative(comment.createdAt)}
                            </span>
                            {(comment.author.id === user?.id) && (
                              <button
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                className="text-xs text-navy-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all ml-auto"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-navy-700 mt-0.5 leading-relaxed">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar metadata */}
              <div className="w-52 shrink-0 border-l border-navy-100 px-4 py-5 space-y-5">
                {/* Status */}
                <div>
                  <p className="label">Status</p>
                  <select
                    value={task.status}
                    onChange={handleFieldUpdate('status')}
                    className="input text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <p className="label">Priority</p>
                  <select
                    value={task.priority}
                    onChange={handleFieldUpdate('priority')}
                    className="input text-xs"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <p className="label">Assignee</p>
                  <select
                    value={task.assigneeId || ''}
                    onChange={handleFieldUpdate('assigneeId')}
                    className="input text-xs"
                  >
                    <option value="">Unassigned</option>
                    {memberOptions.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  {task.assignee && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Avatar user={task.assignee} size="xs" />
                      <span className="text-xs text-navy-600">{task.assignee.name}</span>
                    </div>
                  )}
                </div>

                {/* Due date */}
                <div>
                  <p className="label">Due Date</p>
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      updateMutation.mutate({
                        dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className={`input text-xs ${overdue ? 'text-danger border-red-200' : ''}`}
                  />
                  {overdue && (
                    <p className="text-2xs text-danger mt-1 font-medium">⚠ Overdue</p>
                  )}
                </div>

                {/* Reporter */}
                <div>
                  <p className="label">Reporter</p>
                  <div className="flex items-center gap-1.5">
                    <Avatar user={task.creator} size="xs" />
                    <span className="text-xs text-navy-600">{task.creator?.name}</span>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <p className="label">Created</p>
                  <p className="text-xs text-navy-600">{formatDate(task.createdAt)}</p>
                </div>

                {/* Updated */}
                <div>
                  <p className="label">Updated</p>
                  <p className="text-xs text-navy-600">{formatRelative(task.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
