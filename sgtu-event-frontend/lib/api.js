import axios from "axios";

// Determine API base URL based on environment
const getBaseURL = () => {
  // Check if we're in development mode
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // For local development, you can:
    // 1. Use local backend (if running): return "http://localhost:5000/api"
    // 2. Use production backend: return "https://sgtu-event-backend.vercel.app/api"

    // OPTION 1: Uncomment to use LOCAL backend (must be running on port 5000)
    // return "http://localhost:5000/api";

    // OPTION 2: Use production backend (requires backend CORS update)
    return "https://sgtu-event-backend.vercel.app/api";
  }

  // Production frontend always uses production backend
  return "https://sgtu-event-backend.vercel.app/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Check for admin_token, event_manager_token, or regular token
      const adminToken = localStorage.getItem("admin_token");
      const eventManagerToken = localStorage.getItem("event_manager_token");
      const token = localStorage.getItem("token");

      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.log("🔑 Using admin_token for request:", config.url);
      } else if (eventManagerToken) {
        config.headers.Authorization = `Bearer ${eventManagerToken}`;
        console.log("🔑 Using event_manager_token for request:", config.url);
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Using token for request:", config.url);
        console.log("🔑 Token (first 20 chars):", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No token found for request:", config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      // Handle 401 Unauthorized - Token missing or invalid
      if (error.response?.status === 401) {
        // Clear all auth data
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("event_manager_token");
        localStorage.removeItem("event_manager_name");
        localStorage.removeItem("event_manager_email");
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        // Redirect to login page
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/";
        } else if (window.location.pathname.startsWith("/event-manager")) {
          window.location.href = "/";
        } else if (window.location.pathname.startsWith("/student")) {
          window.location.href = "/";
        } else if (window.location.pathname.startsWith("/volunteer")) {
          window.location.href = "/";
        }
      }

      // Handle 403 Forbidden - Token expired or insufficient permissions
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || "Access denied";
        if (message.includes("expired") || message.includes("Invalid")) {
          // Token expired or invalid - clear and redirect
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_name");
          localStorage.removeItem("event_manager_token");
          localStorage.removeItem("event_manager_name");
          localStorage.removeItem("event_manager_email");
          localStorage.removeItem("token");
          localStorage.removeItem("role");

          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/";
          } else if (window.location.pathname.startsWith("/event-manager")) {
            window.location.href = "/";
          } else if (window.location.pathname.startsWith("/student")) {
            window.location.href = "/";
          } else if (window.location.pathname.startsWith("/volunteer")) {
            window.location.href = "/";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
