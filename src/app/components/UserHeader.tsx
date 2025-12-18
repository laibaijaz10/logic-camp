"use client";

import { LogOut, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from "@/hooks/useAuth";

interface UserHeaderProps {
  children?: ReactNode;
}

export default function UserHeader({ children }: UserHeaderProps) {
  const { user, loading } = useAuth();
  // Logout function
  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10 animate-slideDown">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo lockup */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logic Camp logo"
            width={132}
            height={132}
            className="rounded-lg object-contain"
            priority
          />
          <div className="text-sm md:text-base font-bold tracking-wide">
          </div>
        </div>

        {/* Right: User info + actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <span className="hidden sm:inline text-xs md:text-sm uppercase tracking-widest text-gray-300/90">
            User Dashboard | LogicCamp
          </span>

          {/* Optional children from dashboard */}
          {children}

          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </button>

          <ProfileDropdown />

          {/* Show Admin link only for admin role */}
          {!loading && user?.role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-3.5 py-2 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Fixed Logout button */}
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
