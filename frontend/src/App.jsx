import { Routes,Route,Navigate } from "react-router-dom"
import { useEffect,useState } from "react"

import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"

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
            <Route path="/signup" element={!authUser?<SignUpPage />:<Navigate to="/"/>} />
            <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/"/>} />
        </Routes>
    </div>
  )
}

export default App
