"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAuth";

export default function AdminHome() {
  const { isAuthenticated, isChecking } = useAdminAuth();
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVolunteers: 0,
    totalStalls: 0,
    totalSchools: 0,
    totalEvents: 0,
    activeEvents: 0,
    pendingEvents: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      setAdminName(localStorage.getItem("admin_name") || "Admin");
      fetchStats();
    }
  }, [isChecking, isAuthenticated]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-soft-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-text dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, scansRes, eventsRes, stallsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/check-in-out?limit=4").catch(() => ({ data: { data: [] } })),
        api.get("/admin/events").catch(() => ({ data: { data: { events: [] } } })),
        api.get("/admin/stalls").catch(() => ({ data: { data: [] } } ))
      ]);
      
      // Calculate events stats
      const events = eventsRes.data?.data?.events || [];
      const activeEvents = events.filter(e => e.status === "ACTIVE" || e.status === "APPROVED").length;
      const pendingEvents = events.filter(e => e.status === "PENDING_APPROVAL").length;
      
      // Get unique schools from stalls
      const stalls = stallsRes.data?.data || [];
      const uniqueSchools = new Set(stalls.map(s => s.school_id).filter(Boolean));
      
      if (statsRes.data?.success) {
        setStats({
          totalStudents: statsRes.data.data.totalStudents || 0,
          totalVolunteers: statsRes.data.data.totalVolunteers || 0,
          totalStalls: statsRes.data.data.totalStalls || stalls.length || 0,
          totalSchools: uniqueSchools.size || 0,
          totalEvents: events.length,
          activeEvents: activeEvents,
          pendingEvents: pendingEvents
        });
      }

      if (scansRes.data?.success) {
        setRecentScans(scansRes.data.data.slice(0, 4) || []);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch(e){}
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <AdminHeader adminName={adminName} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 text-dark-text dark:text-white">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button className="p-2 text-dark-text hover:bg-gray-100 rounded-lg transition hidden sm:flex">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>
                <span className="hidden sm:inline">New Event</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-xl border border-gray-200 bg-white dark:bg-card-dark shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card title="Total Schools" value={stats.totalSchools} icon="account_balance" subtitle={`${stats.totalStalls} stalls`} />
              <Card title="Total Events" value={stats.totalEvents} icon="event" subtitle={`Active: ${stats.activeEvents}${stats.pendingEvents > 0 ? ` | Pending: ${stats.pendingEvents}` : ''}`} />
              <Card title="Participants" value={stats.totalStudents} icon="groups" subtitle={`${stats.totalVolunteers} volunteers`} />
            </div>
          )}

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-card-background dark:bg-card-dark p-4 sm:p-6 rounded-xl border border-light-gray-border shadow-soft">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-dark-text dark:text-white">Overview Summary</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current system status</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-light-gray-border">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Stalls</span>
                  <span className="text-sm font-semibold text-dark-text dark:text-white">{stats.totalStalls}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-light-gray-border">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Volunteers</span>
                  <span className="text-sm font-semibold text-dark-text dark:text-white">{stats.totalVolunteers}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Event Approvals</span>
                  <span className={`text-sm font-semibold ${stats.pendingEvents > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.pendingEvents}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card-background dark:bg-card-dark p-4 sm:p-6 rounded-xl border border-light-gray-border shadow-soft">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-dark-text dark:text-white">Quick Actions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Common admin tasks</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => router.push('/admin/students')}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-gray-border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="material-symbols-outlined text-primary">groups</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Students</span>
                </button>
                <button 
                  onClick={() => router.push('/admin/volunteers')}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-gray-border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Volunteers</span>
                </button>
                <button 
                  onClick={() => router.push('/admin/events')}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-gray-border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Events</span>
                </button>
                <button 
                  onClick={() => router.push('/admin/stalls')}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-gray-border hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Stalls</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Scan Events */}
          <div className="bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border shadow-soft overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-light-gray-border dark:border-gray-700">
              <h3 className="text-sm sm:text-base font-semibold text-dark-text dark:text-white">Recent Scan Events</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live feed of recent participant scans</p>
            </div>
            
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-4 bg-gray-50 dark:bg-gray-800 px-6 py-3 font-medium text-dark-text dark:text-gray-300 text-xs uppercase tracking-wider">
              <div>Participant ID</div>
              <div>Event / Stall</div>
              <div>Timestamp</div>
              <div>Status</div>
            </div>

            {/* Desktop DATA ROWS */}
            <div className="hidden md:block">
              {recentScans.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent scan events
                </div>
              ) : (
                <div>
                  {recentScans.map((scan) => (
                    <ScanRow
                      key={scan.id}
                      participantId={scan.student_registration_no || scan.student_name?.substring(0, 12) || "N/A"}
                      event={scan.stall_name || "Unknown"}
                      timestamp={scan.check_in_time ? new Date(scan.check_in_time).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : "—"}
                      status={scan.check_out_time ? "Success" : "Active"}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 p-4">
              {recentScans.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent scan events
                </div>
              ) : (
                recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-light-gray-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-dark-text dark:text-white text-sm">
                          {scan.student_registration_no || scan.student_name?.substring(0, 12) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {scan.stall_name || "Unknown"}
                        </div>
                      </div>
                      {scan.check_out_time ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-medium">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {scan.check_in_time ? new Date(scan.check_in_time).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}

function Card({ title, value, icon, subtitle, change, positive }) {
  return (
    <div className="p-5 rounded-xl border border-light-gray-border bg-card-background dark:bg-card-dark shadow-soft hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{subtitle}</p>}
          {change && (
            <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl text-primary dark:text-blue-400">{icon}</span>
        </div>
      </div>
    </div>
  );
}



function ScanRow({ participantId, event, timestamp, status }) {
  return (
    <div className="grid grid-cols-4 px-6 py-3 text-sm items-center border-b border-light-gray-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <div className="font-medium text-dark-text dark:text-gray-200">{participantId}</div>
      <div className="text-gray-600 dark:text-gray-400">{event}</div>
      <div className="text-gray-500 dark:text-gray-400 text-xs">{timestamp}</div>
      <div>
        {status === "Success" || status === "Active" ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-medium">
            {status === "Active" ? "Active" : "Success"}
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-medium">
            Failed
          </span>
        )}
      </div>
    </div>
  );
}
