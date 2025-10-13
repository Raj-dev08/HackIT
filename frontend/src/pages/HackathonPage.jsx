import { useState, useEffect } from "react";
import { useHackStore } from '../store/useHackStore'
import { useAuthStore } from "../store/useAuthStore";
import { useParams , Link } from 'react-router-dom'
import VoteButtons from '../components/VoteButtons'
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Popover } from "@headlessui/react";
import { EllipsisVertical, Trash2, Copy ,Loader } from "lucide-react";
import toast from "react-hot-toast";


const HackathonPage = () => {
    const { getHackathonDetail, isLoading, clickedHackathon , giveReview , isGivingReview , deleteReview } = useHackStore()
    const { checkAuth , authUser } = useAuthStore();
    const { id } = useParams()
    const encodedName = btoa(clickedHackathon?.name)
    const [reviewText, setReviewText] = useState("");

    useEffect(()=>{
        checkAuth();
        getHackathonDetail(id);
    },[])


    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return toast.error("Please write a review!");
        await giveReview(clickedHackathon?._id, reviewText, authUser);
        setReviewText("");
    }
    // console.log(clickedHackathon)

    if ( isLoading ){
        return(
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-base-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg cursor-pointer">
                    <Link to={clickedHackathon?.image}>
                        <img
                            src={clickedHackathon?.image}
                            alt={clickedHackathon?.name}
                            className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                            <h1 className="text-3xl md:text-5xl font-bold text-white">
                                {clickedHackathon?.name}
                            </h1>
                        </div>
                    </Link>
                </div>

                
                <div className="flex items-center gap-3 mt-6">
                <img
                    src={clickedHackathon?.Host?.profilePic}
                    alt={clickedHackathon?.Host?.name}
                    className="w-10 h-10 rounded-full border border-primary/40"
                />
                <div>
                    <h3 className="font-bold text-md">{clickedHackathon?.Host?.name?.toUpperCase()}</h3>
                    <p className="text-xs text-gray-400">Organizer</p>
                </div>
                </div>

          
                <div className="prose prose-invert max-w-none leading-relaxed tracking-wide
                                [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:mt-5 [&>h3]:mb-2
                                [&>p]:my-4 [&>ul]:my-4 [&>ol]:my-4 [&>li]:my-1
                                [&>hr]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-primary/60
                                [&>blockquote]:pl-4 [&>blockquote]:text-gray-300 [&>strong]:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {clickedHackathon?.description}
                    </ReactMarkdown>
                </div>

               
                <div className="flex flex-wrap justify-between mt-8 text-sm text-gray-400 border-t border-base-300 pt-4">
                    <span>📅 {new Date(clickedHackathon?.date).toLocaleDateString()}</span>
                    <Link to={`/map?lat=${clickedHackathon?.lat}&lng=${clickedHackathon?.lng}&name=${encodedName}`}>
                        <span className="cursor-pointer hover:text-blue-400 hover:underline">
                            📍 View in map
                        </span>
                    </Link>
                </div>

             
                <div className="mt-10 border-t border-base-300 pt-6">
                    <div className="text-xl font-bold mb-4 text-primary flex justify-between">
                       <h1>💬 Reviews</h1>
                       <span className="text-sm text-gray-400 italic">{clickedHackathon?.reviews?.length || 0} review(s)</span>
                    </div>

                    
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2 no-scrollbar border border-secondary/50 p-5 rounded-lg bg-base-300/50">
                        { clickedHackathon?.reviews?.length > 0 ? clickedHackathon?.reviews?.map((review, index) => (
                        <div key={index} className="relative bg-base-300/40 rounded-lg p-3 border border-primary/20">
                           
                            <div className="flex items-center gap-3 mb-2">
                            <img
                                src={review?.reviewer?.profilePic}
                                alt={review?.reviewer?.name}
                                className="w-12 h-12 rounded-full border border-primary/40"
                            />
                            <div className="flex flex-col w-full">
                                <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm">
                                    {review?.reviewer?.name?.toUpperCase()}
                                </h3>

                                
                                <Popover className="relative">
                                    <Popover.Button className="p-1 hover:bg-base-200 rounded">
                                    <EllipsisVertical className="size-4" />
                                    </Popover.Button>

                                    <Popover.Panel className="absolute right-0 mt-1 w-28 z-50 bg-base-100 border rounded-md shadow-md p-1 text-sm">
                                    
                                    <Popover.Button
                                        as="button"
                                        onClick={() => {
                                        navigator.clipboard.writeText(review.review);
                                        toast.success("Review copied!");
                                        }}
                                        className="block w-full text-left px-2 py-1 hover:bg-base-300 rounded"
                                    >
                                        📋 Copy
                                    </Popover.Button>

                                    
                                    {(review.reviewer._id === authUser?._id ||
                                        clickedHackathon?.Host?._id === authUser?._id) && (
                                        <Popover.Button
                                        as="button"
                                        onClick={() => deleteReview(review._id, clickedHackathon._id)}
                                        className="block w-full text-left px-2 py-1 hover:bg-base-300 text-red-500 rounded"
                                        >
                                        🗑 Delete
                                        </Popover.Button>
                                    )}
                                    </Popover.Panel>
                                </Popover>
                                </div>

                                <p className="italic rounded-md p-2 text-gray-300 bg-base-100 font-mono">
                                "{review?.review}"
                                </p>
                            </div>
                            </div>
                        </div>
                        )):(
                            <p className="text-gray-400 italic">No reviews yet. Be the first to review!</p>
                        )}
                    </div>

                    
                    <form className="mt-6 flex gap-3 items-center" onSubmit={submitReview}>
                        <input
                            type="text"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review..."
                            className="flex-1 input input-bordered bg-base-300 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isGivingReview}
                            >
                            Submit
                        </button>
                    </form>
                </div>


               
                <div className="mt-8">
                    <VoteButtons hackathonId={clickedHackathon?._id} />
                </div>
            </div>
        </div>
    )
}

export default HackathonPage