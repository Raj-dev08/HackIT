import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { Users, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MessageBar = () => {
  const { getFriends, friends, isLoading, userUnseenMap } = useFriendStore();
  const { selectedUser, setSelectedUser, setSelectedUserNull, subscribeToMessageEvents } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getFriends();
  }, []);

  useEffect(() => {
    subscribeToMessageEvents();
  }, [subscribeToMessageEvents]);

  const filteredUsers = showOnlineOnly
    ? friends.filter((u) => onlineUsers.includes(u._id))
    : friends;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full w-screen">
        <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
      </div>
    );

  return (
    <div
      className={`flex flex-col bg-base-100 text-base-content w-full h-screen absolute lg:static top-0 left-0 transition-all duration-300 ${
        selectedUser ? "translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-lg">Chats</h2>
        </div>
        <div className="flex justify-between items-center gap-2"> 
            <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) =>
                setShowOnlineOnly(e.target.checked)
                }
                className="toggle toggle-primary toggle-sm"
            />
            <label className="label text-xs opacity-170 font-bold">Show Online Only</label>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll no-scrollbar p-3">
        <AnimatePresence>
          {filteredUsers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <p>No friends found</p>
            </motion.div>
          ) : (
            filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const unseen = userUnseenMap?.[user._id] || 0;

              return (
                <motion.div
                  key={user._id}
                  layout
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-3 px-4 py-2 m-2 rounded-md cursor-pointer transition hover:bg-base-300"
                >
                  <div className="relative">
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-sm text-gray-400">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>

                  { unseen > 0 && ( <div className="font-semibold text-primary">
                    {unseen}
                  </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageBar;
