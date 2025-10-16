import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";
import { useState ,useEffect} from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUserToNull} = useChatStore();
  const { onlineUsers ,authUser} = useAuthStore();
  const navigate = useNavigate();
  const [roomId,setRoomId]=useState();

  useEffect(() => {
    if (selectedUser && authUser) {
      const id = [selectedUser._id, authUser._id].sort().join("-");
      setRoomId(id);
    }
  }, [selectedUser, authUser]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.name} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex space-x-9">
    
        <button onClick={()=>navigate(`/call/${roomId}`)}>
          <Video />
        </button>

        {/* Close button */}

        <button onClick={()=>setSelectedUserToNull(selectedUser,authUser)}>
          <X />
        </button>

        </div>
      </div>
    </div>
  );
};
export default ChatHeader;