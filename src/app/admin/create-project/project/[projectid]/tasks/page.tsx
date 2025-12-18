"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "lucide-react";

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: TaskAssignee;
  assignees?: TaskAssignee[];
}

export default function ProjectTasksPage() {
  const params = useParams<{ projectid: string }>(); // 👈 project id from URL
  const projectId = params?.projectid;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/tasks`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    if (projectId) fetchTasks();
  }, [projectId]);

  // ✅ Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]); // update list
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <h1 className="text-xl font-bold mb-4 text-white">Tasks for Project {projectId}</h1>

      {/* ✅ Task List */}
      <div className="mb-6 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const displayAssignees = task.assignees || (task.assignedTo ? [task.assignedTo] : []);
            return (
              <div
                key={task.id}
                className="border border-white/10 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{task.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full">
                    {task.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  {displayAssignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex items-center gap-1">
                        {displayAssignees.slice(0, 3).map((assignee) => (
                          <div
                            key={assignee.id}
                            className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
                            title={assignee.name}
                          >
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {displayAssignees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center font-medium">
                            +{displayAssignees.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {displayAssignees.length === 1 
                          ? displayAssignees[0].name 
                          : `${displayAssignees.length} assignees`
                        }
                      </span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <span className="text-xs text-slate-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-slate-400">No tasks yet.</p>
        )}
      </div>

      {/* ✅ Add Task Form */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            required
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
