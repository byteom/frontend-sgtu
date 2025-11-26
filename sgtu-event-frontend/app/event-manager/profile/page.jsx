"use client";

import { useEffect, useState } from "react";
import EventManagerSidebar from "@/components/event-manager/EventManagerSidebar";
import EventManagerHeader from "@/components/event-manager/EventManagerHeader";
import EventManagerMobileNav from "@/components/event-manager/EventManagerMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEventManagerAuth } from "@/hooks/useAuth";

export default function EventManagerProfile() {
  const { isAuthenticated, isChecking } = useEventManagerAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    organization: "",
    password: "",
  });

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      fetchProfile();
    }
  }, [isChecking, isAuthenticated]);

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/event-manager/profile");

      if (response.data?.success) {
        const manager = response.data.data.manager;
        setProfile(response.data.data);
        setFormData({
          full_name: manager.full_name || "",
          phone: manager.phone || "",
          organization: manager.organization || "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {};
      if (formData.full_name !== profile.manager.full_name) payload.full_name = formData.full_name;
      if (formData.phone !== profile.manager.phone) payload.phone = formData.phone;
      if (formData.organization !== profile.manager.organization) payload.organization = formData.organization;
      if (formData.password) payload.password = formData.password;

      if (Object.keys(payload).length === 0) {
        alert("No changes to update");
        setUpdating(false);
        return;
      }

      const response = await api.put("/event-manager/profile", payload);

      if (response.data?.success) {
        alert("Profile updated successfully!");
        // Update localStorage
        if (payload.full_name) {
          localStorage.setItem("event_manager_name", payload.full_name);
        }
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
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
        <EventManagerHeader managerName={profile?.manager?.full_name || "Event Manager"} onLogout={handleLogout} />

        <main className="p-4 sm:p-6 md:ml-64 pt-16 sm:pt-20 pb-20 sm:pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-dark-text dark:text-white">Profile & Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account information
              </p>
            </div>

            {loading ? (
              <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft">
                  <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Account Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Approval Status</p>
                      <div className="mt-1">
                        {profile?.manager?.is_approved_by_admin ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium">
                            <span className="material-symbols-outlined text-base">pending</span>
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                      <div className="mt-1">
                        {profile?.manager?.is_active ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
                            <span className="material-symbols-outlined text-base">cancel</span>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile?.manager?.approved_at && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Approved on {new Date(profile.manager.approved_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                      {profile.manager.approved_by_admin_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Approved by: {profile.manager.approved_by_admin_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Statistics */}
                {profile?.stats && (
                  <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">{profile.stats.total_events_created || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{profile.stats.active_events || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Events</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{profile.stats.total_registrations_across_events || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Registrations</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{profile.stats.total_volunteers_assigned || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Volunteers</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Information */}
                <div className="bg-card-background dark:bg-card-dark p-6 rounded-xl border border-light-gray-border shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-dark-text dark:text-white">Profile Information</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.manager?.email || ""}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          New Password (leave empty to keep current)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={updating}
                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating ? "Updating..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              full_name: profile?.manager?.full_name || "",
                              phone: profile?.manager?.phone || "",
                              organization: profile?.manager?.organization || "",
                              password: "",
                            });
                          }}
                          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="text-base text-dark-text dark:text-white font-medium">{profile?.manager?.full_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-base text-dark-text dark:text-white font-medium">{profile?.manager?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-base text-dark-text dark:text-white font-medium">{profile?.manager?.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
                        <p className="text-base text-dark-text dark:text-white font-medium">{profile?.manager?.organization || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <EventManagerMobileNav />
      </div>
    </div>
  );
}
