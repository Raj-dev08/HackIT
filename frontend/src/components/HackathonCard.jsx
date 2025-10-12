import VoteButtons from "./VoteButtons";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useNavigate , Link } from "react-router-dom";

const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate()
  const encodedName = btoa(hackathon?.name);
  return (
    <div
      className="card bg-base-300 border border-primary/25 shadow-md hover:shadow-xl rounded-2xl transition-all duration-200 overflow-hidden"
    >

        <figure>
          <img
            src={hackathon?.image||"https://images.prismic.io/ebayevo/ZzKy-K8jQArT0t1z_skeleton-loader_I1643-2796068-4778-26593-3626-51326-4330-49738.png?auto=format%2Ccompress&fit=max&w=3840&q=100"}
            alt={hackathon?.name||"loading"}
            className="w-full object-cover"
          />
        </figure>
   

    
      <div className="card-body p-5 flex flex-col justify-between ">
        
          <div className="cursor-pointer" onClick={()=>navigate(`/hackathon/${hackathon._id}`)}>
            <h2 className="card-title text-lg font-semibold mb-1 hover:underline">
              {hackathon.name}
            </h2>
            <span className="text-sm text-gray-400 line-clamp-3 mb-3 hover:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{hackathon.description}</ReactMarkdown>
            </span>
          </div>
        

        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>📅 {new Date(hackathon.date).toLocaleDateString()}</span>
          
           <Link to={`/map?lat=${hackathon?.lat}&lng=${hackathon?.lng}&name=${encodedName}`}>
              <span className="cursor-pointer hover:text-blue-400 hover:underline">📍 view in map</span>
            </Link>
        </div>

       <VoteButtons hackathonId={hackathon._id} />
      </div>
    </div>
  );
};

export default HackathonCard;
