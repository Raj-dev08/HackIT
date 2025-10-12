import { useEffect } from 'react'
import { useHackStore } from '../store/useHackStore'
import { useParams , Link } from 'react-router-dom'
import VoteButtons from '../components/VoteButtons'
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Loader } from 'lucide-react'

const HackathonPage = () => {
    const { getHackathonDetail, isLoading, clickedHackathon } = useHackStore()
    const { id } = useParams()
    const encodedName = btoa(clickedHackathon?.name)

    useEffect(()=>{
        getHackathonDetail(id);
    },[])

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

               
                <div className="mt-8">
                    <VoteButtons hackathonId={clickedHackathon?._id} />
                </div>
            </div>
        </div>
    )
}

export default HackathonPage