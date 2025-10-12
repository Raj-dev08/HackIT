import { useState } from "react";
import { useHackStore } from "../store/useHackStore";
import HackathonHandler from "../components/HackathonHandler";

const CreateHackathon = () => {
  const [hackathonData, setHackathonData] = useState({
    image: "",
    name: "",
    description: "",
    lat: "",
    lng: "",
    date: "",
    websiteUrl: "",
    prize: "",
  });

  const { createHackathon, isLoading } = useHackStore();

  return (
    <div>
      <HackathonHandler
        hackathonData={hackathonData}
        setHackathonData={setHackathonData}
        isCreatingHackathon={isLoading}
        createHackathon={createHackathon}
        mode="create"
      />
    </div>
  );
};

export default CreateHackathon;
