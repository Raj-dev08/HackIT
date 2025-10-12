import { Loader2, Calendar, MapPin, Gift, Globe, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HackathonHandler = ({
  hackathonData,
  setHackathonData,
  isCreatingHackathon,
  createHackathon,
  mode,
}) => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      if(await createHackathon(hackathonData)){
        navigate(-1)
      }
    }
  };

  const validateForm = () => {
    //name
    if (!hackathonData.name.trim()) return toast.error("Name is required");

    //description
    if (!hackathonData.description.trim()) return toast.error("Description is required");

    //lat&lng
    if (!hackathonData.lat.trim() || !hackathonData.lng.trim()) return toast.error("Location coordinates are required");
    
    //date
    if (!hackathonData.date.trim()) return toast.error("Date is required");
    
    //image
    if (!hackathonData.image.trim()) return toast.error("Hackathon image is required");
    
    //url
    if (hackathonData.websiteUrl && !/^https?:\/\//.test(hackathonData.websiteUrl)) return toast.error("Invalid website URL");

    //check date
    // if ( new Date(hackathonData.date) < Date.now()) return toast.error("Invalid Date")

    return true;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setHackathonData({ ...hackathonData, image: base64Image });
    };
  };

  return (
     <div className="min-h-screen w-full flex justify-center items-center bg-base-200 py-10">
      <div className="card w-full max-w-3xl shadow-xl bg-base-100/80 backdrop-blur-xl border border-primary/20">
        <div className="relative">
          <img
            src={
              hackathonData.image ||
              "https://img.freepik.com/free-vector/gradient-tech-background_23-2148884155.jpg"
            }
            alt="Hackathon Banner"
            className="w-full h-48 object-cover rounded-t-2xl"
          />
          <label className="absolute bottom-2 right-2 btn btn-sm btn-outline btn-accent cursor-pointer">
            Upload Banner
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isCreatingHackathon}
            />
          </label>
        </div>

       
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <h2 className="card-title text-3xl font-bold text-primary">
            {mode === "create" ? "Create Hackathon" : "Update Hackathon"}
          </h2>
          <p className="text-sm opacity-70">
            Host your event for developers worldwide.
          </p>

          <div className="divider my-2" />

          
          <div className="form-control">
            <label className="label font-semibold">
              <FileText className="w-4 h-4 mr-1" />
              Hackathon Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full rounded-md"
              placeholder="Enter hackathon title"
              value={hackathonData.name}
              onChange={(e) =>
                setHackathonData({ ...hackathonData, name: e.target.value })
              }
            />
          </div>


          <div className="form-control">
            <label className="label font-semibold">
              <FileText className="w-4 h-4 mr-1" />
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-28 rounded-md"
              placeholder="Describe what this hackathon is about (supports md)"
              value={hackathonData.description}
              onChange={(e) =>
                setHackathonData({
                  ...hackathonData,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="form-control">
            <label className="label font-semibold">
              <Calendar className="w-4 h-4 mr-1" />
              Event Date
            </label>
            <input
              type="date"
              className="input input-bordered w-full rounded-md"
              value={hackathonData.date}
              onChange={(e) =>
                setHackathonData({ ...hackathonData, date: e.target.value })
              }
            />
          </div>

        
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-semibold">
                <MapPin className="w-4 h-4 mr-1" />
                Latitude
              </label>
              <input
                type="text"
                className="input input-bordered w-full rounded-md"
                placeholder="e.g. 17.3850"
                value={hackathonData.lat}
                onChange={(e) =>
                  setHackathonData({ ...hackathonData, lat: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label font-semibold">
                <MapPin className="w-4 h-4 mr-1" />
                Longitude
              </label>
              <input
                type="text"
                className="input input-bordered w-full rounded-md"
                placeholder="e.g. 78.4867"
                value={hackathonData.lng}
                onChange={(e) =>
                  setHackathonData({ ...hackathonData, lng: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-semibold">
                <Globe className="w-4 h-4 mr-1" />
                Website (optional)
              </label>
              <input
                type="text"
                className="input input-bordered w-full rounded-md"
                placeholder="https://event.com"
                value={hackathonData.websiteUrl}
                onChange={(e) =>
                  setHackathonData({
                    ...hackathonData,
                    websiteUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-control">
              <label className="label font-semibold">
                <Gift className="w-4 h-4 mr-1" />
                Prize (optional)
              </label>
              <input
                type="text"
                className="input input-bordered w-full rounded-md"
                placeholder="₹50,000 or Gift pack"
                value={hackathonData.prize}
                onChange={(e) =>
                  setHackathonData({ ...hackathonData, prize: e.target.value })
                }
              />
            </div>
          </div>

          <div className="divider my-2" />

          <button
            type="submit"
            className="btn btn-accent w-full mt-4 text-white font-semibold"
            disabled={isCreatingHackathon}
          >
            {isCreatingHackathon ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Hackathon"
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HackathonHandler;
