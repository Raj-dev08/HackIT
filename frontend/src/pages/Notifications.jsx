import { useFriendStore } from "../store/useFriendStore";
import { useState , useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X , ChevronDown , ChevronUp } from "lucide-react";
import ParticleBackground from "../components/ParticleBackground";

const Notifications = () => {
  const { notifications, clearAllNotifications ,clearNotification } = useFriendStore();
  const [bgEffects,setBgEffects] = useState({
    particleCount:20,
    maxDistance:0,
    limit:80
  })

  const [showBg , setShowBg] = useState(true)
  const [showFilterSelector , setShowFilterSelector] = useState(true)  
  const [showFilter , setShowFilter] = useState(true)

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1052) {
            setShowBg(false)
            setShowFilterSelector(false)
            setShowFilter(false)
        } else {
            setShowBg(true)
            setShowFilterSelector(true)
            setShowFilter(true)
        }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); 

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-6">
        { showBg && 
            <ParticleBackground
            particleCount={bgEffects.particleCount} 
            maxDistance={bgEffects.maxDistance} 
            limit={bgEffects.limit} /> 
        }
        <AnimatePresence>
            {showFilterSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 m-10 bg-backdrop-blur-xl bg-base-300 border border-primary/30 rounded-xl p-4 shadow-lg z-0"
              >
                <div className="flex justify-between gap-4">
                    <h3 className="font-semibold text-base">🎛️ Background Controls</h3>
                    <button onClick={() => setShowFilter(!showFilter)} className="btn btn-sm btn-circle btn-ghost hover:bg-error hover:text-error-content">
                        {showFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
                { showFilter && 
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label text-xs opacity-70">Particle Count</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={bgEffects.particleCount}
                      onChange={(e) =>
                        setBgEffects({ ...bgEffects, particleCount: +e.target.value })
                      }
                      className="range range-primary range-sm"
                    />
                    <p className="text-xs text-center">{bgEffects.particleCount}</p>
                  </div>

                  <div>
                    <label className="label text-xs opacity-70">Max Distance</label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={bgEffects.maxDistance}
                      onChange={(e) =>
                        setBgEffects({ ...bgEffects, maxDistance: +e.target.value })
                      }
                      className="range range-secondary range-sm"
                    />
                    <p className="text-xs text-center">{bgEffects.maxDistance}</p>
                  </div>

                  <div>
                    <label className="label text-xs opacity-70">Particle Limit</label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={bgEffects.limit}
                      onChange={(e) =>
                        setBgEffects({ ...bgEffects, limit: +e.target.value })
                      }
                      className="range range-accent range-sm"
                    />
                    <p className="text-xs text-center">{bgEffects.limit}</p>
                  </div>

                  <div className="flex justify-between">
                    <label className="label text-xs opacity-70">Show Bg</label>
                    <input
                      type="checkbox"
                      checked={showBg}
                      onChange={(e) =>
                        setShowBg(e.target.checked)
                      }
                      className="toggle toggle-primary"
                    />
                  </div>
                  
                </div> 
                }   
              </motion.div>
            )}
        </AnimatePresence>

        
        <div className="card bg-base-100 shadow-xl w-full max-w-md xl:max-w-2xl rounded-2xl border border-base-300">
            <div className="card-body p-3 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-md md:text-2xl font-bold flex items-center gap-2">
                    <Bell className="size-4 md:size-6 text-primary" />
                    Notifications
                    </h2>
                    {notifications.length > 0 && (
                    <button
                        onClick={clearAllNotifications}
                        className="btn btn-sm btn-error text-error-content rounded-xl text-sm md:text-md"
                    >
                        Clear All
                    </button>
                    )}
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar border border-primary/20 rounded-xl p-3 md:p-6">
                    <AnimatePresence>
                    {notifications.length > 0 ? (
                        notifications.map((notif,idx) => (
                        <motion.div
                            key={ notif.text + "_" + (notif.type || "")  + "_" + idx }
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center justify-between bg-base-200 border border-base-300 rounded-xl p-3 shadow-sm"
                        >
                            <div>
                            <p className="font-medium text-sm">{notif.text}</p>
                            {notif.type && (
                                <p className="text-xs text-base-content/60 mt-1">
                                Type: {notif.type.replaceAll("_", " ")}
                                </p>
                            )}
                            </div>
                            <button onClick={() => clearNotification(idx)} className="btn bg-transparent hover:bg-error hover:text-error-content">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                        ))
                    ) : (
                        <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-base-content/70 text-sm py-4"
                        >
                        No notifications yet.
                        </motion.p>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Notifications;
