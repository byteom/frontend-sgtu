"use client";

import { useRouter, usePathname } from "next/navigation";

export default function EventManagerMobileNav() {
  const router = useRouter();
  const path = usePathname();

  const NavItem = ({ label, icon, to }) => (
    <button
      onClick={() => router.push(to)}
      className={`flex flex-col items-center py-2 rounded-xl transition-colors
        ${path === to
          ? "text-primary bg-blue-50 dark:bg-blue-900/20"
          : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-gray-300"
        }
      `}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
      bg-card-background dark:bg-[#0d1117] border-t border-light-gray-border dark:border-gray-800 shadow-lg">

      <div className="grid grid-cols-4 gap-1 p-2 max-w-xl mx-auto">
        <NavItem label="Home" to="/event-manager" icon="dashboard" />
        <NavItem label="Events" to="/event-manager/events" icon="event" />
        <NavItem label="Analytics" to="/event-manager/analytics" icon="analytics" />
        <NavItem label="Profile" to="/event-manager/profile" icon="person" />
      </div>
    </nav>
  );
}
