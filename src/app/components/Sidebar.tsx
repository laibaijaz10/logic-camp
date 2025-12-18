// src/components/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface SidebarLink {
  label: string;
  href: string;
}

const links: SidebarLink[] = [
  { label: "Dashboard", href: "/?tab=dashboard" },
  { label: "My Tasks", href: "/?tab=my-tasks" },
  { label: "Projects", href: "/?tab=projects" },
  { label: "Teams", href: "/?tab=teams" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams?.get('tab') || 'projects').toLowerCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col bg-gray-900/95 text-gray-200 shadow-xl backdrop-blur md:flex">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">myTeamCamp</h2>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          let isActive = false;
          if (link.href.startsWith('/?tab=')) {
            const tab = link.href.split('tab=')[1];
            isActive = pathname === '/' && currentTab === tab;
          } else {
            isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          }
          return (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className={`px-3 py-2 rounded-md transition-colors ${isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
