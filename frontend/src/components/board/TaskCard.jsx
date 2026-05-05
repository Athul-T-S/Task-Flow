// frontend/src/components/board/TaskCard.jsx

import { Draggable } from '@hello-pangea/dnd';
import { Avatar, PriorityBadge } from '../ui';
import { isOverdue, getDueDateLabel } from '../../utils';

export const TaskCard = ({ task, index, onClick }) => {
  const overdue = isOverdue(task.dueDate, task.status);
  const dueDateLabel = getDueDateLabel(task.dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded border border-navy-100 p-3 cursor-pointer 
                      hover:border-primary-300 hover:shadow-card transition-all group
                      ${snapshot.isDragging ? 'shadow-modal rotate-1 border-primary-300' : ''}`}
        >
          {/* Title */}
          <p className="text-sm text-navy-900 font-medium leading-snug mb-2 
                         group-hover:text-primary transition-colors line-clamp-2">
            {task.title}
          </p>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span
                className={`badge text-2xs font-medium ${
                  overdue
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-navy-50 text-navy-600 border border-navy-200'
                }`}
              >
                {overdue ? '⚠ ' : ''}
                {dueDateLabel}
              </span>
            )}
          </div>

          {/* Footer: assignee + comment count */}
          <div className="flex items-center justify-between mt-2">
            <div>
              {task.assignee ? (
                <Avatar user={task.assignee} size="sm" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-navy-100 border border-dashed border-navy-300 
                               flex items-center justify-center" title="Unassigned">
                  <span className="text-navy-300 text-2xs">?</span>
                </div>
              )}
            </div>

            {task._count?.comments > 0 && (
              <div className="flex items-center gap-1 text-navy-400 text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {task._count.comments}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
