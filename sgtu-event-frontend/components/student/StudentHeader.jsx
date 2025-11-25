"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function StudentHeader({ theme, toggleTheme, onLogout, title }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const titles = {
    "/student": "Welcome, Student!",
    "/student/qr": "My QR Code",
    "/student/profile": "My Profile",
    "/student/my-visits": "My Visits",
    "/student/feedback": "Stall Feedback",
    "/student/ranking": "Stall Ranking",
  };

  const pageTitle = title || titles[pathname] || "Student Panel";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const goToProfile = () => {
    router.push("/student/profile");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-card-background border-b border-light-gray-border flex items-center justify-between h-20 px-6 lg:px-10">
      {/* LEFT: LOGO + TITLE */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/SGT-Logo.png"
          alt="SGT"
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <h2 className="font-display font-bold text-xl lg:text-2xl">{pageTitle}</h2>
      </div>

      {/* RIGHT: THEME + PROFILE MENU */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:opacity-80 transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <span className="material-symbols-outlined">dark_mode</span>
          ) : (
            <span className="material-symbols-outlined">light_mode</span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card-background border border-light-gray-border text-sm font-semibold text-dark-text dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <span className="hidden sm:inline">Profile</span>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-light-gray-border bg-card-background shadow-soft overflow-hidden">
              <button
                onClick={goToProfile}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-dark-text hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <span className="material-symbols-outlined text-primary">person</span>
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
