'use client';

import { useState } from 'react';
import { Users, UserCheck, Crown, Star, Edit2, Trash2 } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  members?: TeamMember[];
}

interface TeamCardProps {
  team: Team;
  index: number;
  onDeleteTeam?: (teamId: number) => void;
  onEditTeam?: (team: Team) => void;
  deletingTeamId?: number | null;
}

export default function TeamCard({ team, index, onDeleteTeam, onEditTeam, deletingTeamId }: TeamCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const realMemberCount = team.members?.length || 0;

  const displayMembers: TeamMember[] = realMemberCount > 0
    ? team.members!
    : [
        { id: -1, name: 'Demo Member A', email: 'demo-a@example.com' },
        { id: -2, name: 'Demo Member B', email: 'demo-b@example.com' },
        { id: -3, name: 'Demo Member C', email: 'demo-c@example.com' },
      ];

  const memberCount = displayMembers.length;

  const getTeamSizeTheme = () => {
    if (memberCount >= 10) {
      return {
        bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: <Crown className="h-4 w-4" />
      };
    } else if (memberCount >= 5) {
      return {
        bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        icon: <Star className="h-4 w-4" />
      };
    } else {
      return {
        bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        icon: <UserCheck className="h-4 w-4" />
      };
    }
  };

  const teamTheme = getTeamSizeTheme();

  return (
    <div
      className="group transform"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative text-left w-full rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl cursor-pointer overflow-hidden p-6">

        {/* Main Content */}
        <div className="relative z-10 flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            {/* Team Icon */}
            <div className={`shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 
              grid place-items-center shadow-xl relative overflow-hidden`}>
              <Users className="h-7 w-7 text-white" />
            </div>

            {/* Title & Actions */}
            <div className="flex-1 min-w-0 pr-16">
              <h3 className="text-2xl font-bold tracking-tight text-white truncate">
                {team.name}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {memberCount > 0 ? 'Active collaboration team' : 'No members yet – invite teammates to join'}
              </p>
            </div>

            <div className="flex gap-2 pt-16 sm:pt-0 sm:mt-12">
              {/* Actions moved to a better spot if needed, but for now top right relative is okay */}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              {/* Members badge moved to footer, left side */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-lg bg-gradient-to-r ${teamTheme.bg} border ${teamTheme.border}`}>
                <span className={teamTheme.text}>{teamTheme.icon}</span>
                <span className={`font-semibold text-xs ${teamTheme.text}`}>
                  {memberCount} member{memberCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex -space-x-2">
                {displayMembers.slice(0, 5).map((member, idx) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full 
                  flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800"
                    style={{ zIndex: 10 - idx }}
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {(displayMembers.length) > 5 && (
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-800">
                    +{displayMembers.length - 5}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {onEditTeam && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditTeam(team); }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDeleteTeam && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTeam(team.id); }}
                  disabled={deletingTeamId === team.id}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  {deletingTeamId === team.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Member Tags */}
          {team.members && team.members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {team.members.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-medium border bg-white/5 border-white/10 text-gray-300"
                >
                  {member.name}
                </span>
              ))}
              {team.members.length > 3 && (
                <span className="text-[10px] text-gray-500 self-center">
                  +{team.members.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}