'use client';
import React, { useState } from 'react';
import { db } from '@/lib/mockData';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FolderOpen,
  BarChart3,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateTeam?: () => void;
  onCreateProject?: () => void;
}

export default function AdminSidebar({ activeSection, onSectionChange, onCreateTeam, onCreateProject }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Stats' },
    { id: 'users', label: 'Users', icon: Users, description: 'Manage Users' },
    { id: 'teams', label: 'Teams', icon: UsersRound, description: 'Team Management' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, description: 'Project Management' },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'create-team' && onCreateTeam) {
      onCreateTeam();
    } else if (sectionId === 'create-project' && onCreateProject) {
      onCreateProject();
    } else {
      onSectionChange(sectionId);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800/90 border border-slate-700/50 text-white hover:bg-slate-700/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl overflow-y-auto z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-slate-400">Management Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <div key={item.id} className="space-y-1">
                {/* Main Navigation Item */}
                <button
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 active:scale-[0.98] transform ${isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent hover:border-slate-600/50 hover:scale-[1.02] hover:shadow-md hover:shadow-slate-500/10'
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  )}
                </button>




              </div>
            );
          })}
        </nav>

        {/* Quick Stats Section */}
        <div className="p-4 mt-auto border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Users</span>
                <span className="text-white font-medium">{db.getUsers().length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Teams</span>
                <span className="text-white font-medium">{db.getTeams().length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Projects</span>
                <span className="text-white font-medium">{db.getProjects().length}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}