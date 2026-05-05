// frontend/src/components/tasks/TaskForm.jsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Select, Alert } from '../ui';
import { getErrorMessage } from '../../utils';
import { useProject } from '../../hooks';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const TaskForm = ({ projectId, initialStatus = 'TODO', task, onSubmit, onCancel, isLoading }) => {
  const { data: project } = useProject(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      status: task?.status || initialStatus,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assigneeId: task?.assigneeId || '',
    },
  });

  const [submitError, setSubmitError] = [null, () => {}];

  const handleFormSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assigneeId: data.assigneeId || null,
        description: data.description || null,
      };
      await onSubmit(payload);
    } catch (error) {
      // Let parent handle
    }
  };

  const priorityOptions = [
    { value: 'HIGHEST', label: '▲▲ Highest' },
    { value: 'HIGH', label: '▲ High' },
    { value: 'MEDIUM', label: '■ Medium' },
    { value: 'LOW', label: '▼ Low' },
    { value: 'LOWEST', label: '▼▼ Lowest' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...(project?.members || []).map((m) => ({
      value: m.user.id,
      label: m.user.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Add a description..."
        rows={4}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          options={priorityOptions}
          {...register('priority')}
        />
        <Select
          label="Status"
          options={statusOptions}
          {...register('status')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Due Date</label>
          <input
            type="date"
            className="input"
            {...register('dueDate')}
          />
        </div>
        <Select
          label="Assignee"
          options={memberOptions}
          {...register('assigneeId')}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-navy-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
};
