import { useState , useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, KeyboardIcon, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Globe from "react-globe.gl";
import ParticleBackground from "../components/ParticleBackground";


import { motion } from "framer-motion";

const imageVariants = {
  initial: { opacity: 0,scale:0.2 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.2 },
};
const SignUpPage = () => {
  const [points, setPoints] = useState([]);
  const [showBg , setShowBg] = useState(true)

  const globeEl = useRef();

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;  
      controls.autoRotateSpeed = 1; 
    }
  }, []);
 

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const { signup, isSigningUp } = useAuthStore();


  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 4) return toast.error("Password must be at least 4 characters");
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };
 return (
  <div className={`min-h-screen flex items-center justify-center w-full relative overflow-hidden ${showBg?"bg-black":"bg-base-100"}`}>
    { showBg ? <ParticleBackground /> : ""} 
    <div className="w-full max-w-lg sm:max-w-5xl py-4 mx-4 sm:py-6 md:py-8
     space-y-8 bg-base-300 rounded-xl
     backdrop-blur-sm flex flex-col lg:flex-row items-center justify-center">

      <form onSubmit={handleSubmit} className="w-full lg:w-1/2 border-hidden p-6 rounded-lg mx-4 sm:mx-14">
         <div className="flex flex-col items-center gap-2 group ">
          <div
            className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
          group-hover:bg-primary/20 transition-colors"
          >
            <KeyboardIcon className="size-6 text-primary" />
          </div>
          
           <motion.h1 
            className="text-2xl font-bold mt-2 text-center"
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            >
            Create Account
        </motion.h1>

        </div>
       
      
        <div className="form-control my-6">
          <label className="label">
            <span className="label-text font-medium">Full Name</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="size-5 text-base-content/40" />
            </div>
            <input
              type="text"
              className={`input input-bordered w-full pl-10`}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        
        <div className="form-control my-6">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="size-5 text-base-content/40" />
            </div>
            <input
              type="email"
              className={`input input-bordered w-full pl-10`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

       
        <div className="form-control my-6">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="size-5 text-base-content/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className={`input input-bordered w-full pl-10`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-5 text-base-content/40" />
              ) : (
                <Eye className="size-5 text-base-content/40" />
              )}
            </button>
          </div>
        </div>

       
        <button type="submit" className="btn my-6 bg-gradient-to-l from-primary to-secondary hover:bg-gradient-to-l hover:from-primary/40 hover:to-secondary/40 w-full  border-hidden" disabled={isSigningUp}>
          {isSigningUp ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center flex justify-between mx-10 flex-col space-y-3 sm:space-y-0 sm:flex-row">
          <p className="text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
          <div className="flex space-x-2">
            <p className="text-base-content/60">
              Have animated Background?
            </p>
            <input 
            type="checkbox"
            defaultChecked={showBg}
            onClick={()=>setShowBg(!showBg)}
            />
          </div>
          
        </div>
        

      </form>

      
      <motion.div
          className="hidden lg:flex w-full lg:w-1/2 items-center justify-center"
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md p-8 w-full">
            <Globe
              ref={globeEl}
              width={400}
              height={400}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // realistic land/sea
              showAtmosphere={true}
              atmosphereColor="rgba(0, 153, 255)" // light blue glow
              atmosphereAltitude={0.2}
              pointsData={points}
              pointLat="lat"
              pointLng="lng"
              pointColor="color"
              pointRadius="size"
              animateIn={true}
              pointsMerge={false}
              pointAltitude={(d) => d.alt ?? 0.02}
              onGlobeClick={(event) => {
              const { lat, lng } = event;
                setPoints((prev) => [
                  ...prev,
                  {
                    lat,
                    lng,
                    size: 0.3,
                    color: ["#ff6b6b", "#fbc531", "#1dd1a1", "#5f27cd"][Math.floor(Math.random() * 4)], 
                    alt: Math.abs(Math.random()-0.5)
                  }
                ]);
              }}
            />
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with devs worldwide</h2>
              <p className="opacity-70">
                Help others and also upskill yourself
              </p>
            </div>
          </div>
        </motion.div>
    </div>
  </div>
);
};
export default SignUpPage;