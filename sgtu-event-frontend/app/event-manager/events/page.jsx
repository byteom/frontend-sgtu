"use client";

import { useEffect, useState } from "react";
import EventManagerSidebar from "@/components/event-manager/EventManagerSidebar";
import EventManagerHeader from "@/components/event-manager/EventManagerHeader";
import EventManagerMobileNav from "@/components/event-manager/EventManagerMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEventManagerAuth } from "@/hooks/useAuth";

export default function EventsListPage() {
  const { isAuthenticated, isChecking } = useEventManagerAuth();
  const [managerName, setManagerName] = useState("Event Manager");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      setManagerName(localStorage.getItem("event_manager_name") || "Event Manager");
      fetchEvents();
    }
  }, [isChecking, isAuthenticated, statusFilter]);

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
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const response = await api.get("/event-manager/events", { params });

      if (response.data?.success) {
        // Backend returns { data: { data: [...events...], pagination: {...} } }
        const eventsData = response.data.data.data || response.data.data.events || [];
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
      <EventManagerSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <EventManagerHeader managerName={managerName} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 text-dark-text dark:text-white">My Events</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and track all your events
              </p>
            </div>
            <button
              onClick={() => router.push("/event-manager/events/create")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Create Event</span>
            </button>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">info</span>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> All events created require admin approval before becoming active. Events with "PENDING APPROVAL" status are awaiting admin review.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Search events by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Rejected/Cancelled</option>
            </select>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-xl border border-gray-200 bg-white dark:bg-card-dark shadow-sm animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => router.push(`/event-manager/events/${event.id}`)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-8xl text-gray-300 dark:text-gray-600">event_busy</span>
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mt-4">
                {searchQuery ? "No events found matching your search" : "No events created yet"}
              </p>
              <button
                onClick={() => router.push("/event-manager/events/create")}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
              >
                Create Your First Event
              </button>
            </div>
          )}
        </main>

        <EventManagerMobileNav />
      </div>
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
      case "COMPLETED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <button
      onClick={onClick}
      className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark shadow-sm hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-dark-text dark:text-white truncate group-hover:text-primary transition">
            {event.event_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.event_code}</p>
        </div>
        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition">arrow_forward</span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="material-symbols-outlined text-base">calendar_today</span>
          <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="material-symbols-outlined text-base">
            {event.event_type === "FREE" ? "money_off" : "payments"}
          </span>
          <span>{event.event_type === "FREE" ? "Free Event" : `₹${event.price}`}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusColor(event.status)}`}>
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
        {event.max_capacity && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Capacity: {event.max_capacity}
          </span>
        )}
      </div>
    </button>
  );
}
