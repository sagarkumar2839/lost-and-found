import axios from "axios";

// Point this at your Express server. In development with CRA, you can also
// set REACT_APP_API_URL in a .env file instead of hardcoding it here.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request if the user is logged in
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("lf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central place to react to auth failures
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("lf_token");
      localStorage.removeItem("lf_user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
