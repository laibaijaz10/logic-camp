"use client";

import { LogOut, Plus, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  // Logout function
  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10 animate-slideDown"
    >
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo lockup */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logic Camp logo"
            width={148}
            height={148}
            className="rounded-lg object-contain"
            priority
          />
          <div className="text-sm md:text-base font-bold tracking-wide">
          </div>
        </div>

        {/* Right: Branding + actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <span className="hidden sm:inline text-xs md:text-sm uppercase tracking-widest text-gray-300/90">
            Admin Dashboard | LogicCamp
          </span>

          {/* Optional children from dashboard */}
          {children}

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-colors"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>



          {/* Fixed Logout button */}
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
