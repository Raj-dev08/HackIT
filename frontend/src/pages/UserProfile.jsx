import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useHackStore } from "../store/useHackStore";
import toast from "react-hot-toast";
import Masonry from "react-masonry-css";
import { Camera, Mail, Eye , EyeOff ,Loader } from "lucide-react";
import HackathonCard from "../components/HackathonCard";
import ParticleBackground from "../components/ParticleBackground";

const UserProfile = () => {
  const {
    authUser,
    checkAuth,
    isUpdatingProfile,
    updateProfile,
    beAdmin,
    cancelAdmin,
  } = useAuthStore();

  const { userHackathons, getUserHackathons, deleteHackathon , isLoading } = useHackStore();
  const inputRef = useRef();

  const [profileData, setProfileData] = useState({
    name: authUser?.name || "",
    description: authUser?.description || "",
    profilePic: authUser?.profilePic || "",
  });

  const [adminPassword, setAdminPassword] = useState("");
  const [showBg,setShowBg]=useState(true)
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await checkAuth();
      await getUserHackathons();
    };
    fetchData();
  }, []);


  const handleAdmin = (e) => {
    e.preventDefault();
    if (authUser?.isAdmin) return toast.error("You are already an admin");
    if (!adminPassword.trim()) return toast.error("Please enter admin password");
    beAdmin(adminPassword);
    setAdminPassword("");
  };

  const handleCancelAdmin = () => {
    if (!authUser?.isAdmin) return toast.error("You are not an admin");
    cancelAdmin();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      setProfileData((prev) => ({ ...prev, profilePic: base64Image }));
    };
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (isUpdatingProfile) return;

    if (!profileData.name.trim()) return toast.error("Name is required");
    if (!profileData.description.trim())
      return toast.error("Description is required");

    updateProfile(profileData);
  };

  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1,
  };
  

  return (
    <div className="min-h-screen bg-base-200 py-12">
        {isLoading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <Loader className="animate-spin"/>
            </div>
        )}
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="bg-base-300 rounded-3xl shadow-xl p-8 md:p-12 flex flex-col items-center gap-8 transition-all duration-300 hover:shadow-2xl">
          <div className="relative flex-shrink-0 w-full flex justify-center items-center">
            {showBg ? <ParticleBackground particleCount={15} maxDistance={100} limit={40}/> : ""}
            <img
              src={profileData.profilePic || "https://via.placeholder.com/150"}
              alt={profileData.name}
              className="w-64 h-64 md:rounded-none rounded-full object-cover border-4 border-primary shadow-lg z-10"
            />

            <div className="absolute bottom-0 left-0 bg-primary text-primary-content p-2 rounded-full
             cursor-pointer hover:scale-110 transition-all"
             onClick={()=>setShowBg(!showBg)}>
                {showBg ? <Eye className="h-5 w-5"/> : <EyeOff className="h-5 w-5"/>}
            </div>

            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:scale-110 transition-all ${
                isUpdatingProfile ? "pointer-events-none animate-pulse" : ""
              }`}
            >
              <Camera className="w-5 h-5 md:w-8 md:h-8" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>


          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex gap-1">
                <label className="label font-mono font-semibold max-w-[100px] md:mr-20">Email</label>
                <div className="flex items-center gap-2 text-gray-400 input  rounded-xl p-3 bg-base-100 w-full text-center">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">{authUser?.email}</span>
                </div>
            </div>
           

            <form onSubmit={handleProfileUpdate} className="space-y-3">
                <div className="flex gap-1">
                    <label className="label font-mono font-semibold max-w-[100px] md:mr-20">Name</label>
                     <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                        }
                        placeholder="Full Name"
                        className="input w-full rounded-xl focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <label className="label font-mono font-semibold md:mr-20">About</label>
                    <textarea
                        value={profileData.description}
                        onChange={(e) =>
                        setProfileData({
                            ...profileData,
                            description: e.target.value,
                        })
                        }
                        placeholder="About you"
                        className="textarea w-full rounded-xl focus:outline-none"
                    />
                </div>      
                <button
                    type="submit"
                    className="btn btn-primary w-full mt-3 rounded-xl"
                    disabled={isUpdatingProfile}
                >
                    {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
            </form>

            <div className="bg-base-100 p-4 rounded-xl border border-primary/20">
              <div className="flex justify-between items-center font-medium text-gray-600">
                <span>Account Status</span>
                {authUser?.isAdmin ? (
                  <button
                    onClick={handleCancelAdmin}
                    className="btn btn-sm btn-warning rounded-xl"
                  >
                    Admin
                  </button>
                ) : (
                  <span
                    className="text-green-500 cursor-pointer"
                    onClick={() => inputRef.current.focus()}
                  >
                    User
                  </span>
                )}
              </div>
              <form onSubmit={handleAdmin} className="flex gap-2 mt-2 justify-between">
                <div className="flex w-[60%] md:max-w-full relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        ref={inputRef}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="input focus:outline-none border-1 border-primary/20 flex-1 rounded-xl h-12 w-full overflow-scroll no-scrollbar"
                        />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <Eye className="h-5 w-5 text-base-content/40" /> : <EyeOff className="h-5 w-5 text-base-content/40" />}
                    </button>
                </div>
               
                <button type="submit" className="btn btn-sm btn-primary rounded-xl h-12 max-w-[40%]">
                  Submit
                </button>
              </form>
            </div>

            <div className="text-sm text-gray-500 mt-3">
              Member Since: {authUser?.createdAt?.split("T")[0]}
            </div>
          </div>
        </div>

       
        <div className="bg-base-300 rounded-3xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl font-semibold mb-6">Your Hackathons</h2>
          {userHackathons?.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto gap-6"
              columnClassName="flex flex-col gap-6"
            >
              {userHackathons?.map((hackathon) => (
                <div key={hackathon._id} className="relative">
                  <HackathonCard hackathon={hackathon} />
                  <button
                    onClick={() => deleteHackathon(hackathon._id)}
                    className="btn btn-sm btn-error absolute top-2 right-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </Masonry>
          ) : (
            <p className="text-gray-500 text-center mt-4">
              You haven't created any hackathons yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
