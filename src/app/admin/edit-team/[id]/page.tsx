"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "teamLead";
  isApproved: boolean;
}

interface Team {
  id: number;
  name: string;
  members: User[];
}

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const teamId = params?.id;

  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch team data and all users
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamRes = await fetch(`/api/teams/${teamId}`, {
          credentials: 'include'
        });
        if (!teamRes.ok) throw new Error('Failed to fetch team');
        const teamData = await teamRes.json();
        
        // Fetch all users
        const usersRes = await fetch('/api/admin/users', {
          credentials: 'include'
        });
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        
        const fetchedTeam = teamData.team || teamData;
        const fetchedUsers = Array.isArray(usersData) ? usersData : usersData.users || [];
        
        setTeam(fetchedTeam);
        setAllUsers(fetchedUsers);
        setTeamName(fetchedTeam.name);
        setSelectedMembers(fetchedTeam.members?.map((m: User) => m.id) || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  // Update selectAll state when selectedMembers changes
  useEffect(() => {
    setSelectAll(selectedMembers.length === allUsers.length && allUsers.length > 0);
  }, [selectedMembers, allUsers]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(allUsers.map(user => user.id));
    }
  };

  const handleMemberToggle = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('At least one team member is required');
      return;
    }

    try {
      setSaving(true);
      
      // Update team name
      const updateRes = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: teamName.trim(),
        }),
      });

      if (!updateRes.ok) {
        if (updateRes.status === 409) {
          toast.error('A team with this name already exists. Please choose a different name.');
          return;
        }
        throw new Error('Failed to update team');
      }

      // Update team members
      const membersRes = await fetch(`/api/teams/${teamId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userIds: selectedMembers,
        }),
      });

      if (!membersRes.ok) {
        throw new Error('Failed to update team members');
      }

      toast.success('Team updated successfully!');
      router.push('/admin');
      
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          <span className="text-white/60">Loading team data...</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      <div className="relative px-6 md:px-10 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Team</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team Name Section */}
            <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <h2 className="text-xl font-semibold mb-4">Team Information</h2>
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-white/80 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter team name"
                  required
                />
              </div>
            </section>

            {/* Team Members Section */}
            <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Team Members</h2>
                <div className="text-sm text-white/60">
                  {selectedMembers.length} of {allUsers.length} selected
                </div>
              </div>

              {/* Select All Checkbox */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="font-medium text-white/90">Select All Users</span>
                </label>
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => handleMemberToggle(user.id)}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-white/60">{user.email}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-white/10 rounded-md text-white/70">
                      {user.role}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}