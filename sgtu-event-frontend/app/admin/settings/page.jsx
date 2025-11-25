"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAuth";

export default function AdminSettingsPage() {
  const { isAuthenticated, isChecking } = useAdminAuth();
  const [adminProfile, setAdminProfile] = useState({
    email: "",
    full_name: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const router = useRouter();

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      setAdminName(localStorage.getItem("admin_name") || "Admin");
      fetchProfile();
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/profile");
      if (res.data?.success) {
        const profile = res.data.data;
        setAdminProfile(profile);
        setFormData({
          email: profile.email || "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        email: formData.email
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await api.put("/admin/profile", updateData);
      if (res.data?.success) {
        alert("Profile updated successfully");
        if (formData.email !== adminProfile.email) {
          localStorage.setItem("admin_name", res.data.data.full_name || formData.email.split("@")[0]);
        }
        fetchProfile();
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-dark-text dark:text-white">Profile & Settings</h1>
          </div>

          {loading ? (
            <div className="bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border shadow-soft p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="bg-card-background dark:bg-card-dark rounded-xl border border-light-gray-border shadow-soft p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Section */}
                <div>
                  <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-text dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={adminProfile.full_name || ""}
                        disabled
                        className="w-full px-4 py-2 border border-light-gray-border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Name cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-text dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-light-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark-text dark:text-white bg-card-background dark:bg-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-text dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={adminProfile.role || "ADMIN"}
                        disabled
                        className="w-full px-4 py-2 border border-light-gray-border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="pt-6 border-t border-light-gray-border">
                  <h2 className="text-lg font-semibold text-dark-text dark:text-white mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-text dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-light-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark-text dark:text-white bg-card-background dark:bg-gray-800"
                        placeholder="Leave empty to keep current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-text dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-light-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark-text dark:text-white bg-card-background dark:bg-gray-800"
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        email: adminProfile.email || "",
                        password: "",
                        confirmPassword: ""
                      });
                    }}
                    className="px-6 py-2 border border-light-gray-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-dark-text dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}

