'use client';

import React from 'react';
import TaskCard from './TaskCard';

export interface TaskGridProps {
  tasks: any[];
  loadingTasks?: boolean;
  onEditTask?: (task: any) => void;
  onDeleteTask?: (taskId: number) => void;
  deletingTaskId?: number;
}

export default function TaskGrid({ 
  tasks, 
  loadingTasks = false,
  onEditTask,
  onDeleteTask,
  deletingTaskId 
}: TaskGridProps) {
  if (loadingTasks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl text-center">
        <p className="text-gray-400 mb-4">No tasks have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task}
          onEditTask={onEditTask ? () => onEditTask(task) : undefined}
          onDeleteTask={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
        />
      ))}
    </div>
  );
}