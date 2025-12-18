'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/ui/use-toast';

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({ name: data.user.name, email: data.user.email });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setEditMode(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update profile',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'teamLead': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'employee': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (isActive: boolean, isApproved: boolean) => {
    if (!isApproved) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (!isActive) return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  const getStatusText = (isActive: boolean, isApproved: boolean) => {
    if (!isApproved) return 'Pending Approval';
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-white/10 rounded w-32"></div>
              <div className="h-4 bg-white/10 rounded w-48"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="text-center text-white/60">
          Failed to load profile data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>
        <div className="flex items-center space-x-2">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{profile.name}</h3>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(profile.role)}`}>
              {profile.role}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(profile.isActive, profile.isApproved)}`}>
              {getStatusText(profile.isActive, profile.isApproved)}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Full Name
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                {profile.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Address
            </label>
            {editMode ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                {profile.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Member Since
          </label>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
            {new Date(profile.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editMode && (
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => {
              setEditMode(false);
              setFormData({ name: profile.name, email: profile.email });
            }}
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-all duration-200"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;