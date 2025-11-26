// "use client";

// import { usePathname, useRouter } from "next/navigation";

// export default function AdminSidebar({ onLogout }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   return (
//     <aside className="hidden lg:flex flex-col w-64 
//       bg-card-light dark:bg-card-dark 
//       border-r border-light-gray-border dark:border-gray-800 p-6">

//       {/* LOGO */}
//       <div className="flex items-center justify-center gap-2 mb-10">
//         <h2 className="font-bold text-xl text-primary">Admin Panel</h2>
//       </div>

//       <SidebarLink
//         label="Dashboard"
//         icon="dashboard"
//         active={pathname === "/admin"}
//         onClick={() => router.push("/admin")}
//       />

//       <SidebarLink
//         label="Volunteers"
//         icon="group"
//         active={pathname === "/admin/volunteers"}
//         onClick={() => router.push("/admin/volunteers")}
//       />

//       <SidebarLink
//         label="Students"
//         icon="school"
//         active={pathname === "/admin/students"}
//         onClick={() => router.push("/admin/students")}
//       />

//       <SidebarLink
//         label="Stalls"
//         icon="store"
//         active={pathname === "/admin/stalls"}
//         onClick={() => router.push("/admin/stalls")}
//       />

//       <SidebarLink
//         label="Scan Logs"
//         icon="qr_code_scanner"
//         active={pathname === "/admin/logs"}
//         onClick={() => router.push("/admin/logs")}
//       />

//       {/* LOGOUT */}
//       <div className="mt-auto">
//         <SidebarLink
//           label="Logout"
//           icon="logout"
//           danger
//           onClick={onLogout}
//         />
//       </div>
//     </aside>
//   );
// }

// function SidebarLink({ label, icon, active, danger, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition
//       ${
//         danger
//           ? "text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
//           : active
//           ? "bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300"
//           : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
//       }`}
//     >
//       <span className="material-symbols-outlined">{icon}</span>
//       {label}
//     </button>
//   );
// }





"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminSidebar({ onLogout }) {
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
          active={pathname === "/admin"}
          onClick={() => router.push("/admin")}
        />

        <SidebarLink
          label="Events"
          icon="event"
          active={pathname === "/admin/events"}
          onClick={() => router.push("/admin/events")}
        />

        <SidebarLink
          label="Event Managers"
          icon="manage_accounts"
          active={pathname === "/admin/event-managers"}
          onClick={() => router.push("/admin/event-managers")}
        />

        <SidebarLink
          label="Attendance Log"
          icon="fact_check"
          active={pathname === "/admin/scans"}
          onClick={() => router.push("/admin/scans")}
        />

        <SidebarLink
          label="Volunteers"
          icon="groups"
          active={pathname === "/admin/volunteers"}
          onClick={() => router.push("/admin/volunteers")}
        />

        <SidebarLink
          label="Students"
          icon="school"
          active={pathname === "/admin/students"}
          onClick={() => router.push("/admin/students")}
        />

        <SidebarLink
          label="Stalls"
          icon="store"
          active={pathname === "/admin/stalls"}
          onClick={() => router.push("/admin/stalls")}
        />

        <SidebarLink
          label="Analytics"
          icon="analytics"
          active={pathname === "/admin/analytics"}
          onClick={() => router.push("/admin/analytics")}
        />

        <SidebarLink
          label="Settings"
          icon="settings"
          active={pathname === "/admin/settings"}
          onClick={() => router.push("/admin/settings")}
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

      {/* ADMIN USER */}
      <div className="p-4 border-t border-light-gray-border dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-dark-text dark:text-gray-300">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-dark-text dark:text-white truncate">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@sgtuniversity.ac.in</p>
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
