"use client";

import { useEffect, useState } from "react";
import EventManagerSidebar from "@/components/event-manager/EventManagerSidebar";
import EventManagerHeader from "@/components/event-manager/EventManagerHeader";
import EventManagerMobileNav from "@/components/event-manager/EventManagerMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEventManagerAuth } from "@/hooks/useAuth";

export default function EventManagerDashboard() {
  const { isAuthenticated, isChecking } = useEventManagerAuth();
  const [managerName, setManagerName] = useState("Event Manager");
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    pendingApproval: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState("approved");
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      setManagerName(localStorage.getItem("event_manager_name") || "Event Manager");
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, eventsRes] = await Promise.all([
        api.get("/event-manager/profile"),
        api.get("/event-manager/events?limit=5")
      ]);

      if (profileRes.data?.success) {
        const manager = profileRes.data.data.manager;
        const managerStats = profileRes.data.data.stats;

        setManagerName(manager.full_name || "Event Manager");
        setApprovalStatus(manager.is_approved_by_admin ? "approved" : "pending");

        setStats({
          totalEvents: managerStats?.total_events_created || 0,
          activeEvents: managerStats?.active_events || 0,
          totalRegistrations: managerStats?.total_registrations_across_events || 0,
          pendingApproval: managerStats?.pending_events || 0
        });
      }

      if (eventsRes.data?.success) {
        // Backend returns { data: { data: [...events...], pagination: {...} } }
        const eventsData = eventsRes.data.data.data || eventsRes.data.data.events || [];
        setRecentEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/event-manager/logout");
    } catch(e){}
    localStorage.removeItem("event_manager_token");
    localStorage.removeItem("event_manager_name");
    localStorage.removeItem("event_manager_email");
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
      <EventManagerSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <EventManagerHeader managerName={managerName} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          {/* Approval Status Banner */}
          {approvalStatus !== "approved" && (
            <div className="mb-6 p-5 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl">pending_actions</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                    Account Pending Admin Approval
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Your Event Manager account is awaiting admin approval. You'll be able to create and manage events once your account is approved by an administrator.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                    <strong>Note:</strong> Any events you create will also require admin approval before becoming active.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 text-dark-text dark:text-white">
                Welcome back, {managerName}!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Here's an overview of your event management dashboard
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push("/event-manager/events/create")}
                disabled={approvalStatus !== "approved"}
                className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-5 rounded-xl border border-gray-200 bg-white dark:bg-card-dark shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Events"
                value={stats.totalEvents}
                icon="event"
                subtitle="All time"
              />
              <StatCard
                title="Active Events"
                value={stats.activeEvents}
                icon="event_available"
                subtitle="Currently running"
                positive
              />
              <StatCard
                title="Total Registrations"
                value={stats.totalRegistrations}
                icon="how_to_reg"
                subtitle="Across all events"
              />
              <StatCard
                title="Pending Approval"
                value={stats.pendingApproval}
                icon="pending"
                subtitle="Awaiting admin review"
              />
            </div>
          )}

          {/* Recent Events */}
          <div className="bg-card-background dark:bg-card-dark p-4 sm:p-6 rounded-xl border border-light-gray-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-dark-text dark:text-white">Recent Events</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your latest event activities</p>
              </div>
              <button
                onClick={() => router.push("/event-manager/events")}
                className="text-sm text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => router.push(`/event-manager/events/${event.id}`)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">event_busy</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No events created yet</p>
                <button
                  onClick={() => router.push("/event-manager/events/create")}
                  disabled={approvalStatus !== "approved"}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Your First Event
                </button>
              </div>
            )}
          </div>
        </main>

        <EventManagerMobileNav />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, positive }) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-dark-text dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${positive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
          <span className={`material-symbols-outlined text-xl ${positive ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
            {icon}
          </span>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

function EventCard({ event, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "ACTIVE": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING_APPROVAL": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "REJECTED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "CANCELLED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "DRAFT": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-dark-text dark:text-white truncate">{event.event_name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.event_code}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusColor(event.status)}`}>
              {event.status === "PENDING_APPROVAL" && (
                <span className="material-symbols-outlined text-sm">pending_actions</span>
              )}
              {(event.status === "APPROVED" || event.status === "ACTIVE") && (
                <span className="material-symbols-outlined text-sm">check_circle</span>
              )}
              {(event.status === "REJECTED" || event.status === "CANCELLED") && (
                <span className="material-symbols-outlined text-sm">cancel</span>
              )}
              {event.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {event.event_type}
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
      </div>
    </button>
  );
}
