"use client";

import { useEffect, useState } from "react";
import EventManagerSidebar from "@/components/event-manager/EventManagerSidebar";
import EventManagerHeader from "@/components/event-manager/EventManagerHeader";
import EventManagerMobileNav from "@/components/event-manager/EventManagerMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEventManagerAuth } from "@/hooks/useAuth";

export default function AnalyticsPage() {
  const { isAuthenticated, isChecking } = useEventManagerAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      fetchEvents();
    }
  }, [isChecking, isAuthenticated]);

  useEffect(() => {
    if (selectedEvent) {
      fetchAnalytics(selectedEvent);
    }
  }, [selectedEvent]);

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

  if (!isAuthenticated) {
    return null;
  }

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/event-manager/events");

      if (response.data?.success) {
        // Backend returns { data: { data: [...events...], pagination: {...} } }
        const eventsData = response.data.data.data || response.data.data.events || [];
        const eventsList = Array.isArray(eventsData) ? eventsData : [];
        setEvents(eventsList);
        if (eventsList.length > 0) {
          setSelectedEvent(eventsList[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (eventId) => {
    try {
      const response = await api.get(`/event-manager/events/${eventId}/analytics`);

      if (response.data?.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
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

  const selectedEventData = events.find(e => e.id === selectedEvent);

  return (
    <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
      <EventManagerSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <EventManagerHeader managerName={localStorage.getItem("event_manager_name") || "Event Manager"} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-dark-text dark:text-white mb-1">Analytics & Insights</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed performance metrics for your events
              </p>
            </div>

            {/* Event Selector */}
            <div className="mb-6 bg-card-background dark:bg-card-dark p-4 rounded-xl border border-light-gray-border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Select Event
              </label>
              <select
                value={selectedEvent || ""}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_name} ({event.event_code})
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">event_busy</span>
                <p className="text-gray-500 dark:text-gray-400 mt-2">No events created yet</p>
                <button
                  onClick={() => router.push("/event-manager/events/create")}
                  className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
                >
                  Create Your First Event
                </button>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Event Info Card */}
                {selectedEventData && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-2">
                      {selectedEventData.event_name}
                    </h2>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{selectedEventData.event_code}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedEventData.status)}`}>
                        {selectedEventData.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedEventData.event_type === "FREE" ? "Free Event" : `₹${selectedEventData.price}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div>
                  <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Key Metrics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title="Total Registrations"
                      value={analytics.stats?.total_registrations || 0}
                      icon="how_to_reg"
                      color="blue"
                    />
                    <MetricCard
                      title="Confirmed"
                      value={analytics.stats?.registrations?.confirmed || 0}
                      icon="check_circle"
                      color="green"
                    />
                    <MetricCard
                      title="Total Revenue"
                      value={`₹${analytics.stats?.total_revenue || 0}`}
                      icon="payments"
                      color="purple"
                    />
                    <MetricCard
                      title="Volunteers"
                      value={analytics.stats?.volunteers?.total_volunteers || 0}
                      icon="groups"
                      color="orange"
                    />
                  </div>
                </div>

                {/* Registration Breakdown */}
                {analytics.stats?.registrations && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Registration Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatusCard label="Confirmed" value={analytics.stats.registrations.confirmed || 0} color="green" />
                      <StatusCard label="Pending" value={analytics.stats.registrations.pending || 0} color="yellow" />
                      <StatusCard label="Cancelled" value={analytics.stats.registrations.cancelled || 0} color="red" />
                      <StatusCard label="Waitlisted" value={analytics.stats.registrations.waitlisted || 0} color="gray" />
                    </div>
                  </div>
                )}

                {/* Payment Breakdown */}
                {analytics.stats?.payment_breakdown && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Payment Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatusCard
                        label="Completed"
                        value={analytics.stats.payment_breakdown.completed || 0}
                        color="green"
                      />
                      <StatusCard
                        label="Pending"
                        value={analytics.stats.payment_breakdown.pending || 0}
                        color="yellow"
                      />
                      <StatusCard
                        label="Failed"
                        value={analytics.stats.payment_breakdown.failed || 0}
                        color="red"
                      />
                    </div>
                  </div>
                )}

                {/* Volunteer Performance */}
                {analytics.volunteer_performance && analytics.volunteer_performance.length > 0 && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Top Performing Volunteers</h2>
                    <div className="space-y-3">
                      {analytics.volunteer_performance.slice(0, 5).map((vol, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-dark-text dark:text-white">{vol.volunteer_name || "Unknown"}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{vol.assigned_location || "No location"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-dark-text dark:text-white">{vol.total_scans || 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">scans</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity Info */}
                {analytics.stats?.capacity_info && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Capacity Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Max Capacity</p>
                        <p className="text-2xl font-bold text-dark-text dark:text-white">
                          {analytics.stats.capacity_info.max_capacity || "Unlimited"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Registrations</p>
                        <p className="text-2xl font-bold text-primary">
                          {analytics.stats.capacity_info.current_registrations || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Spots</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.stats.capacity_info.available_spots === null
                            ? "Unlimited"
                            : analytics.stats.capacity_info.available_spots}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">analytics</span>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Analytics data not available for this event</p>
              </div>
            )}
          </div>
        </main>

        <EventManagerMobileNav />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-dark-text dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  const colorClasses = {
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    red: "text-red-600 dark:text-red-400",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "APPROVED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "ACTIVE": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "PENDING_APPROVAL": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "REJECTED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "CANCELLED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "DRAFT": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    case "COMPLETED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}
