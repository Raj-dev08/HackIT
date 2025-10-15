import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
    friends: [],
    isLoading: false,
    userUnseenMap: {}, // key -> unread count
    friendRequestsToMe: [],
    friendRequestsFromMe: [],
    searchResults: [],
    clickedProfile: null,
    notifications: localStorage.getItem("notifications") ? JSON.parse(localStorage.getItem("notifications")) : [],
    isSendingRequest:false,


    // public methods
    getFriends: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friend/api/friends");
            // backend returns { friends, unreadCounts }
            set({ friends: res.data.friends || [], userUnseenMap: res.data.unreadCounts || {} });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    searchUsers: async (search) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/friend/api/search?search=${encodeURIComponent(search)}`);
            set({ searchResults: res.data.profile || [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    getFriendRequestToMe: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friend/api/friend-requests/to-me");
            set({ friendRequestsToMe: res.data.friendRequests || [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    getFriendRequestFromMe: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friend/api/friend-requests/from-me");
            set({ friendRequestsFromMe: res.data.friendRequests || [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoading: false });
        }
    },

    sendFriendRequest: async (receiverId) => {
        set({ isSendingRequest: true })
        try {
            const res = await axiosInstance.post(`/friend/api/send-request/${receiverId}`);
            toast.success(res.data.message);
        } catch (error) {
            console.log("Error sending friend request", error);
            toast.error(error?.response?.data?.message || "Failed to send request");
        } finally {
            set({ isSendingRequest: false})
        }
    },

    acceptFriendRequest: async (requestId) => {
        try {
            const res = await axiosInstance.post(`/friend/api/accept-request/${requestId}`);
            toast.success(res.data.message);

        
            set((state) => ({
                friendRequestsToMe: (state.friendRequestsToMe || []).filter((req) => req._id !== requestId),
            }));
        } catch (error) {
            console.log("Error accepting request", error);
            toast.error(error?.response?.data?.message || "Failed to accept request");
        }
    },

    rejectFriendRequest: async (requestId) => {
        try {
            const res = await axiosInstance.post(`/friend/api/reject-request/${requestId}`);
            toast.success(res.data.message);
            set((state) => ({
                friendRequestsToMe: (state.friendRequestsToMe || []).filter((req) => req._id !== requestId),
            }));
        } catch (error) {
            console.log("Error rejecting request", error);
            toast.error(error?.response?.data?.message || "Failed to reject request");
        }
    },

    viewProfile: async (userId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/friend/api/view-profile/${userId}`);
            set({ clickedProfile: res.data.friend || null });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to view profile");
        } finally {
            set({ isLoading: false})
        }
    },
    setSocketListenerForNotifications: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        socket.off("friend-request-received");
        socket.off("friend-request-accepted");

        socket.on("friend-request-received", ({ sender , request}) => {
            const text = `You received a new friend request from ${sender.name}`;
            toast.success(text);
            set((state) => ({
                friendRequestsToMe: [ ...(state.friendRequestsToMe || []), request ],
                notifications: [...(state.notifications || []), { type: "friend_request", text }]
            }));
            localStorage.setItem("notifications", JSON.stringify(get().notifications));
        });   
        
        
        socket.on("friend-request-accepted", ({ acceptedBy, requestId }) => {
            const text = `${acceptedBy.name} accepted your friend request`;
            toast.success(text);
            set((state) => ({
                notifications: [...(state.notifications || []), { type: "friend_request_accepted", text }],
                friendRequestsFromMe: (state.friendRequestsFromMe || []).filter(req => req._id !== requestId)
            }));
            localStorage.setItem("notifications", JSON.stringify(get().notifications));
        });

                
    },
    clearAllNotifications: () => {
        set({ notifications: [] });
        localStorage.removeItem("notifications");
    },
    clearNotification: (index) => {
        const updated = get().notifications.filter((_, i) => i !== index);
        set({ notifications: updated });
        localStorage.setItem("notifications", JSON.stringify(updated));
    }
}));