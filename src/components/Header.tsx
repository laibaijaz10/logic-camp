"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, User, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown'; // Assume we'll create this
import { useUser } from '@/lib/context/UserContext';

export default function Header() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    router.push('/login');
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isProfileOpen]);

  return (
    <header className="bg-[#0b0b10] shadow-md py-4 px-6 flex justify-between items-center text-white">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Logic Camp logo"
          width={32}
          height={32}
          className="rounded-lg object-contain"
          priority
        />
        <h1 className="text-2xl font-bold">MyTeamCamp Dashboard</h1>
      </div>
      {/* Tab buttons removed; navigation moved to Sidebar for a cleaner header */}
      <div className="flex items-center gap-4" ref={profileRef}>
        <button 
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>
        {isNotificationOpen && <NotificationDropdown userId={1} />}
        <button
          onClick={() => setIsProfileOpen((v) => !v)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Open profile"
        >
          <User className="h-5 w-5" />
        </button>
        {isProfileOpen && (
          <div className="absolute right-6 top-16 z-50 w-72 rounded-xl border border-white/10 bg-[#111219]/95 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-fadeIn">
            <div className="p-4 flex items-center gap-3 border-b border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{user?.name ?? 'Unknown User'}</div>
                <div className="truncate text-xs text-gray-300">{user?.email ?? '-'}</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Role</div>
                <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm">{user?.role ?? '-'}</div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-md px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}