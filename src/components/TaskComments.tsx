'use client';

import React, { useEffect, useRef, useState } from 'react';

type CommentUser = { id: number; name: string };
type TaskComment = {
  id: number;
  task_id: number;
  user_id: number;
  comment?: string | null;
  files?: any;
  createdAt: string;
  user?: CommentUser;
};

interface TaskCommentsProps {
  taskId: number;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/task-comments?taskId=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    };
    fetchComments();
  }, [taskId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async () => {
    if (!text && !files) return;
    const form = new FormData();
    form.append('taskId', String(taskId));
    form.append('comment', text);
    if (files) {
      Array.from(files).forEach((f) => form.append('files', f));
    }
    const res = await fetch('/api/task-comments', { method: 'POST', body: form });
    if (res.ok) {
      setText('');
      setFiles(null);
    }
  };

  return (
    <div className="flex flex-col h-80 bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="text-sm bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-indigo-300 mb-1">
              {c.user?.name || 'User'} • {new Date(c.createdAt).toLocaleString()}
            </div>
            {c.comment && <div className="text-gray-200 whitespace-pre-wrap">{c.comment}</div>}
            {Array.isArray(c.files) && c.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {c.files.map((f: any, idx: number) => (
                  <a key={idx} href={f.url} target="_blank" rel="noreferrer" className="text-xs text-blue-300 underline">
                    {f.name || 'attachment'}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-slate-800 text-white rounded px-3 py-2 border border-white/10"
          />
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="text-white text-xs" />
          <button onClick={handleSubmit} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Send</button>
        </div>
      </div>
    </div>
  );
}


