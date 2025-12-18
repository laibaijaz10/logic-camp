import React from 'react';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  description: string;
  // Add other fields as needed
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white/5 p-3 rounded-lg shadow-md border border-white/10">
        <h3 className="text-sm font-semibold mb-1 text-white">{project.name}</h3>
        <p className="text-xs text-gray-300">{project.description}</p>
      </div>
    </Link>
  );
}