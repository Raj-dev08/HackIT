import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Check, X } from "lucide-react";

const IncomingFriendRequests = () => {
  const {
    friendRequestsToMe,
    getFriendRequestToMe,
    acceptFriendRequest,
    rejectFriendRequest,
    isLoading,
  } = useFriendStore();

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    getFriendRequestToMe();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Incoming Friend Requests</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl overflow-y-auto max-h-[70vh] no-scrollbar">
        <AnimatePresence>
          {friendRequestsToMe.length > 0 ? (
            friendRequestsToMe.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative bg-base-100 border border-base-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col items-start gap-4"
              >
                <div className="flex items-center gap-4 w-full">
                  <img
                    src={req.sender.profilePic || "https://i.pravatar.cc/150"}
                    alt={req.sender.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex flex-col flex-1">
                    <h3 className="font-semibold text-lg">{req.sender.name}</h3>
                    {req.sender.description && (
                      <p className="text-sm text-base-content/70 truncate">
                        {req.sender.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <button
                    onClick={() => acceptFriendRequest(req._id)}
                    className="btn btn-sm btn-success flex-1 gap-2 rounded-xl"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(req._id)}
                    className="btn btn-sm btn-error flex-1 gap-2 rounded-xl"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center col-span-full text-base-content/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No incoming requests.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IncomingFriendRequests;
