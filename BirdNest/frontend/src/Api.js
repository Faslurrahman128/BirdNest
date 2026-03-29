import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8070/api", // Backend URL
});

// Add a request interceptor to dynamically add the token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const fetchRooms = async () => {
  try {
    const response = await api.get("/rooms");
    return response.data;
  } catch (err) {
    throw new Error("Error fetching rooms");
  }
};
