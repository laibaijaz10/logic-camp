import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/mockData';

export type EditTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  team: { id: number; name: string; members?: Array<{ id: number; name: string; email?: string }>; } | null;
  allUsers: Array<{ id: number; name: string; email?: string }>;
  onSaved?: () => void;
  onError?: (message: string) => void;
};

export default function EditTeamModal({ isOpen, onClose, team, allUsers, onSaved, onError }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setSelectedUserIds((team.members || []).map(m => m.id));
    }
  }, [team]);

  const toggleUser = (id: number) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  async function handleSave() {
    if (!team) return;
    try {
      setSaving(true);
      const trimmedName = name.trim();

      // Update the team inside the mock database
      db.teams = db.teams.map((t: any) =>
        t.id === team.id
          ? {
              ...t,
              name: trimmedName,
              members: selectedUserIds,
            }
          : t
      );

      // Let parent hook refetch / refresh teams list
      onSaved && onSaved();
      onClose();
    } catch (err: any) {
      onError && onError(err?.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-slate-800/80 backdrop-blur-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Edit Team</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Team Name</label>
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-white outline-none focus:border-purple-500/60"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-slate-300">Members</label>
              <span className="text-xs text-slate-400">{selectedUserIds.length} selected</span>
            </div>
            <div className="max-h-72 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-700/60">
              {allUsers.map(u => {
                const selected = selectedUserIds.includes(u.id);
                return (
                  <label key={u.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${selected ? 'bg-purple-500/10 border border-purple-500/40' : 'bg-transparent border border-slate-700/40 hover:bg-slate-800/40'}`}>
                    <input
                      type="checkbox"
                      className="accent-purple-500"
                      checked={selected}
                      onChange={() => toggleUser(u.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white">{u.name}</div>
                      {u.email && <div className="text-xs text-slate-400">{u.email}</div>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-600/60 text-slate-300 hover:bg-slate-800/60">Cancel</button>
          <button disabled={!canSave || saving} onClick={handleSave} className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
