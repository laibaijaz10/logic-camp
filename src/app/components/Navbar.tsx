// src/components/Navbar.tsx
"use client";

import React from "react";
import { Bell, Search, User } from "lucide-react";
import Image from "next/image";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logic Camp logo"
          width={148}
          height={148}
          className="rounded-lg object-contain"
          priority
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-md w-1/3">
    <Search size={18} className="text-gray-300" />
    <input
      type="text"
      placeholder="Search..."
      className="bg-transparent outline-none w-full text-sm text-gray-200"
    />
  </div>

  {/* Actions */}
  <div className="flex items-center gap-4">
    {/* Notifications */}
    <button className="relative p-2 rounded-full hover:bg-gray-800">
      <Bell size={20} className="text-gray-200" />
      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded-full">
        3
      </span>
    </button>

    {/* User Avatar */}
    <button className="flex items-center gap-2 hover:bg-gray-800 px-3 py-1 rounded-md">
      <User size={20} className="text-gray-200" />
      <span className="text-sm font-medium text-gray-200">John Doe</span>
    </button>
  </div>
</nav>
  );
};

export default Navbar;
