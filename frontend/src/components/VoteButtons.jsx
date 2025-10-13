import { useHackStore } from "../store/useHackStore";
import { useState , useEffect} from "react";
import toast from "react-hot-toast";
import {ThumbsUp,ThumbsDown} from 'lucide-react'
import { useAuthStore } from "../store/useAuthStore";


const VoteButtons = ({ hackathon }) => {
  const { voteHackathon, hackathons } = useHackStore();
  const { checkAuth,authUser} = useAuthStore()
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    checkAuth();
  },[])

  const handleVote = async (voteType) => {
    if (loading) return;
    setLoading(true);
    try {
      console.log("voting", voteType);
      await voteHackathon(hackathon._id, voteType);
    } catch {
      toast.error("Failed to vote. Try again.");
    } finally {
      setLoading(false);
    }
  };


  const upvotes = hackathon?.upvotes?.length || 0;
  const downvotes = hackathon?.downvotes?.length || 0;

  return (
    <div className="flex justify-between items-center mt-3">
      <button
        className={`btn btn-sm ${hackathon?.upvotes?.includes(authUser._id)?"":"btn-outline"} btn-success flex items-center gap-2 rounded-full`}
        onClick={() => handleVote("like")}
        disabled={loading}
      >
        <ThumbsUp className="w-4 h-4" />
        {upvotes}
      </button>

      <button
        className={`btn btn-sm ${hackathon?.downvotes?.includes(authUser._id)?"":"btn-outline"} btn-error flex items-center gap-2 rounded-full`}
        onClick={() => handleVote("dislike")}
        disabled={loading}
      >
        <ThumbsDown className="w-4 h-4" />
        {downvotes}
      </button>
    </div>
  );
};

export default VoteButtons;
