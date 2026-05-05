// frontend/src/pages/Board.jsx

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal, Button, Spinner, Alert, Avatar } from '../components/ui';
import { useProject, useTasks, useCreateTask } from '../hooks';
import { getErrorMessage } from '../utils';

const Board = () => {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId);
  const [filters, setFilters] = useState({});
  const { data: tasks, isLoading, error } = useTasks(projectId, filters);
  const createTask = useCreateTask(projectId);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('TODO');
  const [createError, setCreateError] = useState('');

  const handleTaskClick = useCallback((task) => {
    setSelectedTaskId(task.id);
  }, []);

  const handleAddTask = useCallback((status) => {
    setCreateInitialStatus(status);
    setCreateError('');
    setShowCreateModal(true);
  }, []);

  const handleCreateTask = async (data) => {
    setCreateError('');
    try {
      await createTask.mutateAsync(data);
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(getErrorMessage(err));
      throw err;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const members = project?.members || [];
  const activeFilterCount = Object.keys(filters).length;

  return (
    <PageWrapper>
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Board header */}
        <div className="bg-white border-b border-navy-100 px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-navy-900">Board</h1>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Assignee filter - avatar buttons */}
            <div className="flex items-center gap-1">
              {members.slice(0, 5).map((m) => (
                <button
                  key={m.user.id}
                  onClick={() =>
                    handleFilterChange(
                      'assigneeId',
                      filters.assigneeId === m.user.id ? '' : m.user.id
                    )
                  }
                  title={m.user.name}
                  className={`rounded-full transition-all ${
                    filters.assigneeId === m.user.id
                      ? 'ring-2 ring-primary ring-offset-1'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Avatar user={m.user} size="sm" />
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <select
              className="input text-xs w-32"
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All priorities</option>
              <option value="HIGHEST">▲▲ Highest</option>
              <option value="HIGH">▲ High</option>
              <option value="MEDIUM">■ Medium</option>
              <option value="LOW">▼ Low</option>
              <option value="LOWEST">▼▼ Lowest</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="input text-xs w-44 pl-8"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-xs text-primary hover:underline"
              >
                Clear filters ({activeFilterCount})
              </button>
            )}

            <Button size="sm" onClick={() => handleAddTask('TODO')}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create
            </Button>
          </div>
        </div>

        {/* Board content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center pt-20">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : error ? (
            <Alert message="Failed to load tasks" className="max-w-sm mx-auto mt-8" />
          ) : (
            <KanbanBoard
              tasks={tasks || []}
              projectId={projectId}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          )}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={() => setSelectedTaskId(null)}
          onDeleted={() => setSelectedTaskId(null)}
        />
      )}

      {/* Create task modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create task"
        size="lg"
      >
        {createError && (
          <div className="px-6 pt-4">
            <Alert message={createError} />
          </div>
        )}
        <TaskForm
          projectId={projectId}
          initialStatus={createInitialStatus}
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createTask.isPending}
        />
      </Modal>
    </PageWrapper>
  );
};

export default Board;
