"use client";

import { useState, useEffect, useCallback } from "react";
import { Project } from "../../admin/hooks/useAdminData";
import { db } from "@/lib/mockData";

export default function useUserData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const all = db.getProjects() as any[];
      setProjects(all);
    } catch (err) {
      setError("An error occurred while fetching projects");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  return {
    projects,
    loadingProjects,
    fetchUserProjects,
  };
}