import axios from "axios";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
  baseURL:"http://localhost:3000/v1",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 429) {
      toast.error("Too many requests. Please try again later.");
    }
    return Promise.reject(error);
  }
);