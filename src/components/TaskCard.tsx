import React from 'react';
import { User } from 'lucide-react';

type TaskAssignee = {
  id: number;
  name: string;
  email: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  assignedTo?: TaskAssignee; // Single assignee for backward compatibility
  assignees?: TaskAssignee[]; // Multiple assignees
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50';
    case 'high': return 'text-orange-600 bg-orange-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-green-600 bg-green-50';
    case 'in-progress': return 'text-blue-600 bg-blue-50';
    case 'review': return 'text-purple-600 bg-purple-50';
    case 'todo': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

interface TaskCardProps {
  task: Task;
  onEditTask?: () => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateStatus?: (task: Task) => Promise<void>;
}

export default function TaskCard({ task, onEditTask, onDeleteTask, onUpdateStatus }: TaskCardProps) {
  const displayAssignees = task.assignees || (task.assignedTo ? [task.assignedTo] : []);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
        {task.priority && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-3 text-sm line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
        </span>
        
        {displayAssignees.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-1">
              {displayAssignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
                  title={assignee.name}
                >
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {displayAssignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-medium">
                  +{displayAssignees.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {task.dueDate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
        {onUpdateStatus && (
          <button 
            onClick={() => onUpdateStatus(task)}
            className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
          >
            Toggle Status
          </button>
        )}
        {onEditTask && (
          <button 
            onClick={onEditTask}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
        )}
        {onDeleteTask && (
          <button 
            onClick={() => onDeleteTask(task.id)}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}