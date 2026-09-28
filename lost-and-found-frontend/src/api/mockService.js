import axiosInstance from "./axiosInstance";

function currentUser() {
  const raw = localStorage.getItem("lf_user");
  return raw ? JSON.parse(raw) : null;
}

export const itemService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.category && filters.category !== "all") params.category = filters.category;
    if (filters.query) params.q = filters.query;

    const { data } = await axiosInstance.get("/items", { params });
    return data;
  },

  async getById(id) {
    const { data } = await axiosInstance.get(`/items/${id}`);
    return data;
  },

  async getMine() {
    const { data } = await axiosInstance.get("/items/mine");
    return data;
  },

  async create(payload) {
    // payload: { type, title, category, description, location, date, image, imageFile }
    const formData = new FormData();
    formData.append("type", payload.type);
    formData.append("title", payload.title);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    formData.append("location", payload.location);
    formData.append("date", payload.date);

    if (payload.imageFile) {
      // Preferred: an actual File object from <input type="file">
      formData.append("image", payload.imageFile);
    } else if (payload.image && payload.image.startsWith("http")) {
      // Fallback external URL (e.g. no photo uploaded)
      formData.append("imageUrl", payload.image);
    }

    const { data } = await axiosInstance.post("/items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await axiosInstance.patch(`/items/${id}/status`, { status });
    return data;
  },

  async remove(id) {
    const { data } = await axiosInstance.delete(`/items/${id}`);
    return data;
  },

  async submitClaim(itemId, message) {
    const { data } = await axiosInstance.post(`/items/${itemId}/claim`, { message });
    return data;
  },

  categories: [
    "Electronics",
    "Bags & Wallets",
    "Keys",
    "Documents & Cards",
    "Jewelry",
    "Pets",
    "Clothing",
    "Books",
    "Other",
  ],
};

export const authService = {
  async register({ name, email, password }) {
    const { data } = await axiosInstance.post("/auth/register", { name, email, password });
    localStorage.setItem("lf_token", data.token);
    localStorage.setItem("lf_user", JSON.stringify(data.user));
    return data;
  },

  async login({ email, password }) {
    const { data } = await axiosInstance.post("/auth/login", { email, password });
    localStorage.setItem("lf_token", data.token);
    localStorage.setItem("lf_user", JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem("lf_token");
    localStorage.removeItem("lf_user");
  },

  getCurrentUser() {
    return currentUser();
  },
};
