'use client';
import React from 'react';
import UserHeader from '@/app/components/UserHeader';
import ProjectsSection from '@/components/ProjectsSection';
import TasksSection from '@/components/TasksSection';

import { useEffect, useState } from 'react';
import { getProjects } from '@/services/projectService';
import { getTasksByProject } from '@/services/taskService';
import UserSidebar from '@/app/components/UserSidebar';

import BoardSection from '@/components/BoardSection';
import MyOverview from '@/components/MyOverview';
import MyTasksBoard from '@/components/MyTasksBoard';
import TeamsSection from '@/components/TeamsSection';
import UserDashboardOverview from '@/app/components/UserDashboardOverview';
import useAdminData from '@/app/admin/hooks/useAdminData';
import { useSearchParams } from 'next/navigation';

import { UserAttributes } from '@/models/User';
import { ProjectAttributes } from '@/models/Project';
import { useUser as useUserContext } from '@/lib/context/UserContext';

type ExtendedUser = UserAttributes & {
  projects?: ProjectAttributes[];
};

type DashboardProps = {
  userData: ExtendedUser;
};

export default function Dashboard({ userData }: DashboardProps) {
  const [projects, setProjects] = useState<any[]>(userData.projects || []);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, setUser } = useUserContext();
  const searchParams = useSearchParams();
  const tab = (searchParams?.get('tab') || 'dashboard') as 'dashboard' | 'my-tasks' | 'projects' | 'teams';
  const { teams, loadingTeams, fetchTeams } = useAdminData(false) as unknown as {
    teams: any[];
    loadingTeams: boolean;
    fetchTeams: (page?: number) => Promise<void> | void;
  };

  useEffect(() => {
    // Sync authenticated user data into global UserContext for header dropdown
    if (userData) {
      const mapRole = (r: any): any => {
        if (r === 'team_lead') return 'teamLead';
        if (r === 'employee' || r === 'admin') return r;
        return 'user';
      };
      setUser({
        id: (userData as any).id,
        name: (userData as any).name,
        email: (userData as any).email,
        role: mapRole((userData as any).role),
        createdAt: (userData as any).createdAt,
      } as any);
    }
  }, [userData, setUser]);

  useEffect(() => {
    const load = async () => {
      try {
        // If userData had no projects, fetch
        if (!projects || projects.length === 0) {
          const p = await getProjects();
          setProjects(p);
        }
      } catch { }
    };
    load();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedProjectId) return;
      try {
        const t = await getTasksByProject(selectedProjectId);
        const normalized = (t.tasks ?? t) as any[];
        setTasks(normalized);
      } catch { }
    };
    loadTasks();
  }, [selectedProjectId]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <UserDashboardOverview />
            {/* Board Section */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Board</h3>
              <BoardSection />
            </div>
          </div>
        );
      case 'my-tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Tasks</h1>
              <div className="text-sm text-slate-400">
                {tasks.length} total tasks
              </div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
              <MyTasksBoard />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Projects</h1>
              <div className="text-sm text-slate-400">
                {projects.length} total projects
              </div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
              <ProjectsSection projects={projects} />
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Teams</h1>
              <div className="text-sm text-slate-400">
                {teams.length} total teams
              </div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
              <TeamsSection
                teams={teams as any}
                loading={loadingTeams}
                onDeleteTeam={async () => { }}
                onRefreshTeams={() => { (fetchTeams as any)?.(1); }}
              />
            </div>
          </div>
        );

      default:
        return <UserDashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen">
        <UserSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1 lg:ml-80 transition-all duration-300 animate-fadeIn">
          <UserHeader />

          <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}