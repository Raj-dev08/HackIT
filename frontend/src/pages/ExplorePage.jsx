import { useRef, useEffect, useState } from "react";
import { useHackStore } from "../store/useHackStore";
import Masonry from "react-masonry-css";
import HackathonCard from "../components/HackathonCard";
import ExploreBackground from "../components/ExploreBackground";
import { themeColors } from "../constants/themeToRgb";

const ExplorePage = () => {
  const {
    hackathons,
    getHackathons,
    hasMoreHackathons,
    isLoading,
    searchFilter,
  } = useHackStore();

  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const limit = 2;
  const skip = hackathons?.length || 0;
  

  const color = themeColors["forest"] || "255,255,255";//TO-DO: add actual theme via store and localstorage and make a animated bg toggle


  useEffect(() => {
    getHackathons(limit, skip);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchFilter]);

  useEffect(() => {
    if (!hasMoreHackathons || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMoreHackathons) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.4 }
    );

    const current = observerRef.current;
    observer.observe(current);
    return () => observer.unobserve(current);
  }, [hasMoreHackathons, isLoading, hackathons]);

  const breakpointColumnsObj = {
    default: 2,
    768: 1,
  };


  return (   
    <div className="min-h-screen pt-10 container mx-auto max-w-5xl px-6 ">
      <ExploreBackground color={color}/>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {hackathons.length > 0 ? (
          hackathons?.map((hackathon) => (
            <HackathonCard key={hackathon._id} hackathon={hackathon} />
          ))
        ) : (
          !isLoading && (
            <p className="text-center text-base text-gray-400 mt-20">
              No hackathons found.
            </p>
          )
        )}
      </Masonry>

      {isLoading && (
        <p className="text-center text-gray-300 mt-6 animate-pulse">
          Loading hackathons...
        </p>
      )}

      {!hasMoreHackathons && hackathons.length > 0 && (
        <p className="text-center text-gray-500 mt-6">
          No more hackathons to load.
        </p>
      )}

      <div ref={observerRef} className="h-10"></div>
    </div>
  );
};

export default ExplorePage;
