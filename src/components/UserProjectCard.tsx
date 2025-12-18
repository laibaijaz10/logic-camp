'use client';

import React from 'react';
import Link from 'next/link';

type UserProjectCardProps = {
  id: number | string;
  name: string;
  description?: string;
  endDate?: string | Date | null;
  membersCount?: number;
};

export default function UserProjectCard({ id, name, description = '', endDate, membersCount }: UserProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="block">
      <div className="group cursor-pointer text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-5 
        overflow-hidden">
        <h3 className="font-semibold text-base leading-tight line-clamp-1 text-white">
          {name}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-300/90 line-clamp-2">{description}</p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 gap-3">
          <div className="min-w-0 truncate">
            <span className="text-indigo-400">📅</span>{' '}
            <span className="truncate">
              {endDate ? new Date(endDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>
          {typeof membersCount === 'number' && (
            <div className="min-w-0 truncate">
              <span className="text-purple-400">👥</span>{' '}
              <span className="truncate">{membersCount} members</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


