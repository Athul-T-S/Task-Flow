// frontend/src/components/board/KanbanBoard.jsx

import { useState, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useReorderTasks } from '../../hooks';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export const KanbanBoard = ({ tasks, projectId, onTaskClick, onAddTask }) => {
  const reorderMutation = useReorderTasks(projectId);
  const [localTasks, setLocalTasks] = useState(null);

  const displayTasks = localTasks ?? tasks;

  const tasksByStatus = useMemo(() => {
    const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
    (displayTasks || []).forEach((t) => {
      if (grouped[t.status]) {
        grouped[t.status].push(t);
      }
    });
    // Sort by order within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [displayTasks]);

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const sourceStatus = source.droppableId;
      const destStatus = destination.droppableId;

      // Optimistic update
      const newGroups = {
        TODO: [...(tasksByStatus.TODO || [])],
        IN_PROGRESS: [...(tasksByStatus.IN_PROGRESS || [])],
        DONE: [...(tasksByStatus.DONE || [])],
      };

      // Remove from source
      const [movedTask] = newGroups[sourceStatus].splice(source.index, 1);

      // Insert at destination with new status
      const updatedTask = { ...movedTask, status: destStatus };
      newGroups[destStatus].splice(destination.index, 0, updatedTask);

      // Recalculate orders
      const reorderPayload = [];
      Object.keys(newGroups).forEach((status) => {
        newGroups[status].forEach((task, idx) => {
          reorderPayload.push({ id: task.id, status, order: idx });
        });
      });

      // Flatten for local state
      const flatTasks = Object.values(newGroups).flat();
      setLocalTasks(flatTasks);

      // Persist
      reorderMutation.mutate(reorderPayload, {
        onError: () => {
          // Revert on error
          setLocalTasks(null);
        },
        onSuccess: () => {
          setLocalTasks(null);
        },
      });
    },
    [tasksByStatus, reorderMutation]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 pb-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(status)}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
