'use client';
import React from 'react';
import { useUser } from '@/hooks/useUser';
import Dashboard from '@/components/Dashboard';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorScreen from '@/components/ui/ErrorScreen';
import UnauthorizedScreen from '@/components/ui/UnauthorizedScreen';

export default function Home() {
  const { userData, loading, error } = useUser();
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={`Error: ${error}`} />;
  if (!userData) return <UnauthorizedScreen />;

  return (
    <Dashboard
      userData={userData}
    />
  );
}