import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import sodium from "libsodium-wrappers"
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket:null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/api/check");
      set({ authUser: res.data });
      get().connectSocket();

    } catch (error) {
      console.log("Error in checkAuth:", error.response?.data?.message," from ",error.response?.data?.service);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await sodium.ready;

      const challengeRes=await axiosInstance.get("/auth/api/signup-challenge");
      const {nonce,nonceId}=challengeRes.data;

      const keyPair = sodium.crypto_box_keypair();
      const publicKey = sodium.to_base64(keyPair.publicKey, sodium.base64_variants.ORIGINAL);
      const privateKey = sodium.to_base64(keyPair.privateKey, sodium.base64_variants.ORIGINAL);



      const payload = {
        ...data,
        publicKey,
        nonceId,
      };


      const res = await axiosInstance.post("/auth/api/signup", payload);

      // console.log(res)

      set({ authUser: res.data });
      get().connectSocket();
      
      localStorage.setItem(`${get().authUser._id}:privateKey`, privateKey);
      localStorage.setItem(`${get().authUser._id}:publicKey`, publicKey);

      toast.success("Account created successfully");

    } catch (error) {
       toast.error(error.response?.data?.message||"something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/api/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully");


    } catch (error) {
       toast.error(error.response?.data?.message||"something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/api/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
       toast.error(error.response?.data?.message||"something went wrong");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/api/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
       toast.error(error.response?.data?.message||"something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  beAdmin: async (data) => {
    try {
      await axiosInstance.post("/auth/api/be-admin", { password: data });
      toast.success("You are now an admin");
      get().checkAuth();
    } catch (error) {
      console.log("error in be admin:", error);
      toast.error(error.response?.data?.message || "something went wrong");
    }
  },

  cancelAdmin: async () => {
    try {
      await axiosInstance.post("/auth/api/cancel-admin");
      toast.success("You are now a user");
      get().checkAuth();
    } catch (error) {
      console.log("error in be admin:", error);
      toast.error(error.response?.data?.message||"something went wrong");
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  callHandler:async()=>{
    try {
      const response = await axiosInstance.get("/auth/api/get-stream-token");
      // set({callToken:response.data})
      // console.log(get().callToken)
      return response.data;
    } catch (error) {
      console.log("something wrong in stream videocall");
      toast.error(error.response?.data?.message||"something went wrong");
    }
  },
}));