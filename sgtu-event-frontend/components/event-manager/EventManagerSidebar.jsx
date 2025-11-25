"use client";

import { usePathname, useRouter } from "next/navigation";

export default function EventManagerSidebar({ onLogout }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className="
        hidden md:flex flex-col
        w-64 h-screen fixed left-0 top-0
        bg-card-background dark:bg-[#0d1117]
        border-r border-light-gray-border dark:border-gray-800
        z-40
      "
    >
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-light-gray-border dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h2 className="text-base font-semibold text-dark-text dark:text-white">SGT University</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarLink
          label="Dashboard"
          icon="dashboard"
          active={pathname === "/event-manager"}
          onClick={() => router.push("/event-manager")}
        />

        <SidebarLink
          label="My Events"
          icon="event"
          active={pathname.startsWith("/event-manager/events") && pathname !== "/event-manager/events/create"}
          onClick={() => router.push("/event-manager/events")}
        />

        <SidebarLink
          label="Create Event"
          icon="add_circle"
          active={pathname === "/event-manager/events/create"}
          onClick={() => router.push("/event-manager/events/create")}
        />

        <SidebarLink
          label="Analytics"
          icon="analytics"
          active={pathname === "/event-manager/analytics"}
          onClick={() => router.push("/event-manager/analytics")}
        />

        <SidebarLink
          label="Profile"
          icon="person"
          active={pathname === "/event-manager/profile"}
          onClick={() => router.push("/event-manager/profile")}
        />
      </div>

      {/* LOGOUT BUTTON */}
      <div className="px-3 pb-2">
        <button
          onClick={onLogout}
          className="
            flex items-center gap-3 w-full px-4 py-2.5 rounded-lg mb-1 transition-all text-sm
            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium
          "
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Logout</span>
        </button>
      </div>

      {/* EVENT MANAGER USER */}
      <div className="p-4 border-t border-light-gray-border dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-dark-text dark:text-gray-300">manage_accounts</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-dark-text dark:text-white truncate">Event Manager</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Event Management</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-4 py-2.5 rounded-lg mb-1 transition-all text-sm
        ${active
          ? "bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300 font-medium"
          : "text-dark-text hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"}
      `}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
