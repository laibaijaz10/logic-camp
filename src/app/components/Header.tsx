// src/components/Header.tsx
"use client";

import React from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  title?: string;
  user?: User | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "myTeamCamp", 
  user, 
  onLogout 
}) => {
  return (
    <header className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-wide">{title}</h1>

      {/* Navigation Links */}
      <nav className="flex gap-6">
        <Link href="/" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <Link href="/tasks" className="hover:underline">
          Tasks
        </Link>
      </nav>

      {/* User Info and Logout */}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-300">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/register"
            className="bg-transparent border border-white px-4 py-2 rounded hover:bg-white hover:text-gray-900 transition"
          >
            Register
          </Link>
          <Link
            href="/signin"
            className="bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
