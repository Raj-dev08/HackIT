import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useFriendStore } from "./useFriendStore";

export const useChatStore = create((set, get) => ({
    messages:[],
    selectedUser: null,
    isMessagesLoading:false,
    isSendingMessages:false,
    hasMoreMessages:true,
    isEditing:false,
    messageNotification:null,
    typingUsers:[],

    refreshMessages: () => {
        set({ messages: [], hasMoreMessages: true });
    },

    setSelectedUser: (user) => {
        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser;
        const friendStore = useFriendStore.getState();

        friendStore.resetUnreadCount(user._id);

        if(socket && authUser){
            socket.emit("join-chat", { userId: authUser._id, chatUserId: user._id });
        }

        set({selectedUser:user})
    },
    setSelectedUserToNull: (selectedUser) => {
        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser;

        if(socket && authUser && selectedUser){
            socket.emit("leave-chat", { userId: authUser._id, chatUserId: selectedUser._id });
        }

        set({selectedUser:null})
    },
    getMessages: async (id,limit=100,before = null) => {
       set({isMessagesLoading:true});
       try {
            const res = await axiosInstance.get(`/message/api/get/messages/${id}?limit=${limit}&before=${before}` );

            const existingMessages = new Set(get().messages.map((m) => m._id));
            const newMessages = res.data.messages.filter((m) => !existingMessages.has(m._id));

            set((state) => ({
                messages: [...newMessages, ...state.messages],
                hasMoreMessages: res.data.hasMore,
            }));
       } catch (error) {
            console.error("Error in getMessages:", error);
            toast.error(error.response?.data?.message || "Failed to load messages");
       } finally {
           set({isMessagesLoading:false});
       }
    },
    sendMessage: async (data) => {
        set({isSendingMessages:true});
        try {
            const authUser = useAuthStore.getState().authUser;
            const { selectedUser, messages } = get();
            const res = await axiosInstance.post(`/message/api/send/messages/${selectedUser._id}`, data);

            const payload = {
                _id: res.data.tempId,
                senderId: authUser._id,
                receiverId: selectedUser._id,
                text: res.data.previewMsg.text || "",
                textForSender: res.data.previewMsg.senderText || "",
                image: res.data.previewMsg.image || null,
                createdAt: new Date().toISOString(),
                isTemp: true,
                status: res.data.state,
            };

            set({ messages: [...messages, payload] });
        } catch (error) {
            console.error("Error in sendMessage:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            set({isSendingMessages:false});
        }
    },
    deleteMessage: async (id) => {
        try {
            const { messages } = get();
            const res = await axiosInstance.delete(`/message/api/delete/messages/${id}`);
            const updatedMessages = messages.filter((m) => m._id !== id);
            set({ messages: updatedMessages });
            toast.success(res.data.message || "Message deleted successfully");
        } catch (error) {
            console.error("Error in deleteMessage:", error);
            toast.error(error.response?.data?.message || "Failed to delete message");
        }
    },
    editMessage : async (id, data) => {
        set({isEditing:true});
        try {
            const { messages } = get();
            const res = await axiosInstance.put(`/message/api/edit/messages/${id}`, data);
            
            const updatedMessages = messages.map((m) =>
                m._id === res.data.messageId ? { ...m, status: res.data.state } : m
            );

            set({ messages: updatedMessages });

        } catch (error) {
            console.error("Error in editMessage:", error);
            toast.error(error.response?.data?.message || "Failed to edit message");
        } finally {
            set({isEditing:false});
        }
    },
    getUnreadMessagesCount: async () => {
        try {
            const res = await axiosInstance.get("/message/api/get/unread/messages/count");
            return res.data.unreadCount;
        } catch (error) {
            console.error("Error in getUnreadMessagesCount:", error);
            toast.error(error.response?.data?.message || "Failed to get unread messages count");
        }
    },

    subscribeToMessageEvents: () => {
        const socket = useAuthStore.getState().socket;

        if(!socket) return;

        socket.off("new_message")
        socket.off("message_deleted")
        socket.off("message_edited")
        socket.off("message_sent")
        socket.off("message_edited_successfully")
        socket.off("message_seen_byReceiever")


        const friendStore = useFriendStore.getState();

        //new message received
        socket.on("new_message", ({sender,message}) => {
            const { selectedUser } = get();
            

            if (!selectedUser || selectedUser._id !== sender._id) {
                const notification = {
                    text: `New message from ${sender.name}`,
                    type: "new_message_received"
                };
                friendStore.addNotification(notification);
                friendStore.incrementUnreadCount(sender._id);
                return;
            }

            socket.emit("message_seen",{
                message
            })

            set((state) => ({
                messages: [...state.messages, message],
            }));
        });

        //message sent confirmation
        socket.on("message_sent",({ receiverId, tempId, realId, stateOfMsg }) => {
            const { selectedUser } = get();

            if (!selectedUser) return;

            if (selectedUser._id !== receiverId) return;

            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === tempId ? { ...m, _id: realId, isTemp:false, status:stateOfMsg } : m
                ),
            }));
        });

        //message seen update
        socket.on("message_seen_byReceiever", ({ message }) => {
            const { selectedUser } = get();

            if ( message.receiverId !== selectedUser._id ) return;

            set((state) => ({
                messages: state.messages.map((m) => 
                    m._id === message._id ? message : m
                )
            }));
        });

        //message edited by sender
        socket.on("message_edited", (message) => {
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === message._id ? message : m
                ),
            }));
        });

        //message edit confirmed by server
        socket.on("message_edited_successfully", ({ message, stateOfMsg }) => {
            const { selectedUser } = get();

            if (!selectedUser) return;
            if (selectedUser._id !== message.receiverId) return;

            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === message._id ? { ...message, status:null } : m
                ),
            }));
        });

        //message deleted by sender
        socket.on("message_deleted",(messageId) => {
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId),
            }));
        });
    }, //TO-DO make the notifications 
    setTypingIndicator: () => {
        const socket = useAuthStore.getState().socket;
        const { selectedUser } = get();

        if (!socket || !selectedUser) return;

        socket.off("userTypingToUser")
        socket.off("userStoppedTypingToUser")

        socket.on("userTypingToUser", ({ from }) => {
            if (from !== selectedUser._id) return;
            set({ typingUsers: [from] });
        });

        socket.on("userStoppedTypingToUser", () => {
            set({ typingUsers: [] });
        });
    },
}))