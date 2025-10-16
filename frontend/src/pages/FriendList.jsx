import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search , Loader2 } from 'lucide-react';

const FriendsList = () => {
  const { friends, getFriends, searchUsers, sendFriendRequest , searchResults , isLoading , isSendingRequest } = useFriendStore();
  const { checkAuth , authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    checkAuth();
    getFriends();
  }, []);


  const handleSendRequest = (userId) => {
    sendFriendRequest(userId);
    // Optionally show a toast or update searchResults to reflect sent request
  };

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return 
    await searchUsers(searchTerm)
  }

  const displayList = searchTerm.trim() ? searchResults : friends;

  console.log(displayList)


  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-6 flex flex-col items-center overflow-hidden">
        {isLoading || isSendingRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="animate-spin"/>
                </div>
        )}
        <h2 className="text-3xl font-bold mb-6 text-center">Your Friends</h2>
        <form onSubmit={handleSearch} className="relative flex w-full max-w-md mb-6">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search friends or users..."
                className="input w-full max-w-full rounded-xl focus:outline-none border border-primary/20 shadow-sm h-12"
            />
            <button type="submit" className="bg-transparent p-2 absolute bottom-0 right-0 rounded-full h-12">
                <Search/>
            </button>
        </form>

     

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl overflow-y-scroll max-h-[50%] md:max-h-screen no-scrollbar">
            <AnimatePresence>
            {displayList?.length > 0 ? (
                displayList?.map((user) => (
                <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-base-100 border border-base-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-5 flex flex-col items-start gap-4"
                >
                    <div className="flex items-center gap-4 w-full">
                    <img
                        src={user.profilePic || "https://i.pravatar.cc/150"}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex flex-col flex-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        {user.description && 
                        <h3 className="text-sm text-base-content/70 truncate">{user.description}</h3>
                        }
                    </div>

                    {/* Unread badge for friends */}
                    {user?.friends?.includes(authUser._id) && user.unreadCount > 0 && (
                        <span className="absolute top-3 right-3 bg-error text-white text-xs font-semibold rounded-full px-2 py-1">
                        {user.unreadCount}
                        </span>
                    )}
                    </div>

                    {/* Friend Request button for non-friends */}
                    {!user?.friends?.includes(authUser._id) && (
                    <button
                        onClick={() => handleSendRequest(user._id)}
                        className="btn btn-sm btn-primary w-full mt-2 rounded-xl"
                        disabled={isSendingRequest}
                    >
                        Send Friend Request
                    </button>
                    )}
                </motion.div>
                ))
            ) : (
                <motion.div
                className="text-center col-span-full text-base-content/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                >
                {searchTerm.trim() ? "No users found." : "No friends yet."}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default FriendsList;
