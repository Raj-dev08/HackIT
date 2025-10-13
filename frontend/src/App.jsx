import { Routes,Route,Navigate } from "react-router-dom"
import { useEffect,useState } from "react"
import 'leaflet/dist/leaflet.css';


import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import ExplorePage from "./pages/ExplorePage"
import CreateHackathon from "./pages/CreateHackathon"
import HackathonPage from "./pages/HackathonPage"
import HackathonMap from "./pages/HackathonMap"
import UserProfile from "./pages/UserProfile";

import { useAuthStore } from "./store/useAuthStore"

import { Toaster } from "react-hot-toast"
import { Loader } from "lucide-react"

function App() {
  const { authUser, isCheckingAuth ,checkAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
   if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );


    // console.log(authUser)
  return (
    <div data-theme="forest">
      <Toaster position="top-right" reverseOrder={false} />
       <Routes>
            <Route path="/" element={authUser?<ExplorePage/>:<Navigate to="/login"/>}/>
            <Route path="/signup" element={!authUser?<SignUpPage />:<Navigate to="/"/>} />
            <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/"/>} />
            <Route path="/create" element={authUser?<CreateHackathon/>:<Navigate to="/login"/>}/>
            <Route path="/hackathon/:id"  element={authUser?<HackathonPage/>:<Navigate to="/login"/>}/>
            <Route path="/map" element={authUser?<HackathonMap/>:<Navigate to="/login"/>}/>
            <Route path="/profile" element={authUser?<UserProfile/>:<Navigate to="/login"/>}/>
        </Routes>
    </div>
  )
}

export default App
