"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EventManagerSidebar from "@/components/event-manager/EventManagerSidebar";
import EventManagerHeader from "@/components/event-manager/EventManagerHeader";
import EventManagerMobileNav from "@/components/event-manager/EventManagerMobileNav";
import api from "@/lib/api";
import { useEventManagerAuth } from "@/hooks/useAuth";

export default function EventDetailPage() {
  const { isAuthenticated, isChecking } = useEventManagerAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isChecking && isAuthenticated && eventId) {
      fetchEventDetails();
    }
  }, [isChecking, isAuthenticated, eventId, activeTab]);

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

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const [eventRes, volunteersRes, registrationsRes, stallsRes, analyticsRes] = await Promise.all([
        api.get(`/event-manager/events/${eventId}`),
        api.get(`/event-manager/events/${eventId}/volunteers`).catch(() => ({ data: { data: { volunteers: [] } } })),
        api.get(`/event-manager/events/${eventId}/registrations`).catch(() => ({ data: { data: { registrations: [] } } })),
        api.get(`/event-manager/events/${eventId}/stalls`).catch(() => ({ data: { data: { stalls: [] } } })),
        api.get(`/event-manager/events/${eventId}/analytics`).catch(() => ({ data: null }))
      ]);

      if (eventRes.data?.success) {
        setEvent(eventRes.data.data.event);
        setStats(eventRes.data.data.stats);
      }

      if (volunteersRes.data?.success) {
        setVolunteers(volunteersRes.data.data.volunteers || []);
      }

      if (registrationsRes.data?.success) {
        setRegistrations(registrationsRes.data.data.registrations || []);
      }

      if (stallsRes.data?.success) {
        setStalls(stallsRes.data.data.stalls || []);
      }

      if (analyticsRes.data?.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        alert("Event not found or access denied");
        router.push("/event-manager/events");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/event-manager/events/${eventId}`);
      if (response.data?.success) {
        alert("Event deleted successfully");
        router.push("/event-manager/events");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.message || "Failed to delete event");
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading || !event) {
    return (
      <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
        <EventManagerSidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <EventManagerHeader managerName={localStorage.getItem("event_manager_name") || "Event Manager"} onLogout={handleLogout} />
          <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-soft-background dark:bg-dark-background">
      <EventManagerSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <EventManagerHeader managerName={localStorage.getItem("event_manager_name") || "Event Manager"} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary mb-4"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Back to Events</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-dark-text dark:text-white mb-2">{event.event_name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(event.status)}`}>
                      {event.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{event.event_code}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {event.event_type === "FREE" ? "Free Event" : `₹${event.price}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {['DRAFT', 'PENDING_APPROVAL'].includes(event.status) && (
                    <button
                      onClick={() => router.push(`/event-manager/events/${eventId}/edit`)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                      <span>Edit</span>
                    </button>
                  )}
                  {!['APPROVED', 'ACTIVE', 'COMPLETED'].includes(event.status) && (
                    <button
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4 overflow-x-auto">
                <TabButton label="Overview" icon="info" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                <TabButton label="Volunteers" icon="groups" count={volunteers.length} active={activeTab === "volunteers"} onClick={() => setActiveTab("volunteers")} />
                <TabButton label="Registrations" icon="how_to_reg" count={registrations.length} active={activeTab === "registrations"} onClick={() => setActiveTab("registrations")} />
                <TabButton label="Stalls" icon="store" count={stalls.length} active={activeTab === "stalls"} onClick={() => setActiveTab("stalls")} />
                <TabButton label="Analytics" icon="analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab event={event} stats={stats} />
            )}

            {activeTab === "volunteers" && (
              <VolunteersTab volunteers={volunteers} eventId={eventId} onUpdate={fetchEventDetails} />
            )}

            {activeTab === "registrations" && (
              <RegistrationsTab registrations={registrations} />
            )}

            {activeTab === "stalls" && (
              <StallsTab stalls={stalls} eventId={eventId} onUpdate={fetchEventDetails} />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab analytics={analytics} stats={stats} />
            )}
          </div>
        </main>

        <EventManagerMobileNav />
      </div>
    </div>
  );
}

function TabButton({ label, icon, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-primary text-primary font-medium"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          active ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function OverviewTab({ event, stats }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Registrations" value={stats.total_registrations || 0} icon="how_to_reg" />
          <StatCard title="Confirmed" value={stats.confirmed_registrations || 0} icon="check_circle" positive />
          <StatCard title="Volunteers Assigned" value={stats.total_volunteers || 0} icon="groups" />
          <StatCard title="Stalls Assigned" value={stats.total_stalls || 0} icon="store" />
        </div>
      )}

      {/* Event Details */}
      <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft">
        <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Event Name" value={event.event_name} />
          <DetailRow label="Event Code" value={event.event_code} />
          <DetailRow label="Event Type" value={event.event_type} />
          {event.price && <DetailRow label="Price" value={`₹${event.price}`} />}
          <DetailRow label="Category" value={event.event_category || "N/A"} />
          <DetailRow label="Venue" value={event.venue || "N/A"} />
          <DetailRow label="Max Capacity" value={event.max_capacity || "Unlimited"} />
          <DetailRow label="Status" value={event.status.replace(/_/g, " ")} />
        </div>

        {event.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
            <p className="text-dark-text dark:text-white">{event.description}</p>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft">
        <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Important Dates</h2>
        <div className="space-y-3">
          <DateRow label="Event Start" value={formatDate(event.start_date)} icon="event" />
          <DateRow label="Event End" value={formatDate(event.end_date)} icon="event" />
          <DateRow label="Registration Start" value={formatDate(event.registration_start_date)} icon="app_registration" />
          <DateRow label="Registration End" value={formatDate(event.registration_end_date)} icon="app_registration" />
        </div>
      </div>
    </div>
  );
}

function VolunteersTab({ volunteers, eventId, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [volunteerId, setVolunteerId] = useState("");
  const [location, setLocation] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddVolunteer = async () => {
    if (!volunteerId) {
      alert("Please enter volunteer ID");
      return;
    }

    try {
      setAdding(true);
      const response = await api.post(`/event-manager/events/${eventId}/volunteers`, {
        volunteer_id: volunteerId,
        assigned_location: location
      });

      if (response.data?.success) {
        alert("Volunteer added successfully");
        setShowAddModal(false);
        setVolunteerId("");
        setLocation("");
        onUpdate();
      }
    } catch (error) {
      console.error("Error adding volunteer:", error);
      alert(error.response?.data?.message || "Failed to add volunteer");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveVolunteer = async (volId) => {
    if (!confirm("Remove this volunteer from the event?")) return;

    try {
      const response = await api.delete(`/event-manager/events/${eventId}/volunteers/${volId}`);
      if (response.data?.success) {
        alert("Volunteer removed successfully");
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing volunteer:", error);
      alert(error.response?.data?.message || "Failed to remove volunteer");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-dark-text dark:text-white">Assigned Volunteers</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Add Volunteer</span>
        </button>
      </div>

      {volunteers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {volunteers.map((vol) => (
            <div key={vol.id} className="bg-card-background dark:bg-card-dark p-4 rounded-lg border border-light-gray-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-dark-text dark:text-white">{vol.full_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vol.email}</p>
                  {vol.assigned_location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="material-symbols-outlined text-sm align-middle">location_on</span>
                      {vol.assigned_location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveVolunteer(vol.volunteer_id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">groups</span>
          <p className="text-gray-500 dark:text-gray-400 mt-2">No volunteers assigned yet</p>
        </div>
      )}

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Add Volunteer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Volunteer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter volunteer ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Assigned Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., Main Gate, Registration Desk"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVolunteer}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationsTab({ registrations }) {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "FAILED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Event Registrations</h2>

      {registrations.length > 0 ? (
        <div className="bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-dark-text dark:text-white">{reg.student_name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{reg.student_email || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusColor(reg.registration_status)}`}>
                        {reg.registration_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusColor(reg.payment_status)}`}>
                        {reg.payment_status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(reg.registration_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">how_to_reg</span>
          <p className="text-gray-500 dark:text-gray-400 mt-2">No registrations yet</p>
        </div>
      )}
    </div>
  );
}

function StallsTab({ stalls, eventId, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stallId, setStallId] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddStall = async () => {
    if (!stallId) {
      alert("Please enter stall ID");
      return;
    }

    try {
      setAdding(true);
      const response = await api.post(`/event-manager/events/${eventId}/stalls`, {
        stall_id: stallId
      });

      if (response.data?.success) {
        alert("Stall assigned successfully");
        setShowAddModal(false);
        setStallId("");
        onUpdate();
      }
    } catch (error) {
      console.error("Error assigning stall:", error);
      alert(error.response?.data?.message || "Failed to assign stall");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStall = async (stId) => {
    if (!confirm("Remove this stall from the event?")) return;

    try {
      const response = await api.delete(`/event-manager/events/${eventId}/stalls/${stId}`);
      if (response.data?.success) {
        alert("Stall removed successfully");
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing stall:", error);
      alert(error.response?.data?.message || "Failed to remove stall");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-dark-text dark:text-white">Assigned Stalls</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Assign Stall</span>
        </button>
      </div>

      {stalls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stalls.map((stall) => (
            <div key={stall.id} className="bg-card-background dark:bg-card-dark p-4 rounded-lg border border-light-gray-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-dark-text dark:text-white">Stall #{stall.stall_number}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stall.school_name || "N/A"}</p>
                  {stall.stall_name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stall.stall_name}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveStall(stall.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">store</span>
          <p className="text-gray-500 dark:text-gray-400 mt-2">No stalls assigned yet</p>
        </div>
      )}

      {/* Add Stall Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Assign Stall</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Stall ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stallId}
                  onChange={(e) => setStallId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter stall ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStall}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {adding ? "Assigning..." : "Assign"}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ analytics, stats }) {
  if (!analytics) {
    return (
      <div className="text-center py-12 bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">analytics</span>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Analytics data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-dark-text dark:text-white">Event Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registrations" value={analytics.stats?.total_registrations || 0} icon="how_to_reg" />
        <StatCard title="Total Revenue" value={`₹${analytics.stats?.total_revenue || 0}`} icon="payments" positive />
        <StatCard title="Volunteers" value={analytics.stats?.volunteers?.total_volunteers || 0} icon="groups" />
        <StatCard title="Avg Scans/Volunteer" value={analytics.volunteer_performance?.length || 0} icon="qr_code_scanner" />
      </div>

      {/* Registration Stats */}
      {analytics.stats?.registrations && (
        <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border">
          <h3 className="text-base font-semibold text-dark-text dark:text-white mb-4">Registration Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{analytics.stats.registrations.confirmed || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{analytics.stats.registrations.pending || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{analytics.stats.registrations.cancelled || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{analytics.stats.registrations.waitlisted || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Waitlisted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, positive }) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark shadow-sm">
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
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base text-dark-text dark:text-white font-medium">{value}</p>
    </div>
  );
}

function DateRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base text-dark-text dark:text-white font-medium">{value}</p>
      </div>
    </div>
  );
}
