// frontend/src/components/board/Column.jsx

import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { getStatusConfig } from '../../utils';

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'DONE'];

export const Column = ({ status, tasks, onTaskClick, onAddTask }) => {
  const config = getStatusConfig(status);

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            {config.label}
          </h3>
          <span className="bg-navy-100 text-navy-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="text-navy-400 hover:text-navy-700 hover:bg-navy-100 
                     p-0.5 rounded transition-colors"
          title={`Add task to ${config.label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-16 rounded-lg p-2 transition-colors space-y-2
                        ${snapshot.isDraggingOver ? 'bg-primary-50 border border-dashed border-primary-300' : 'bg-navy-50'}`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 text-xs text-navy-300">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
