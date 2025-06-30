import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUp from './pages/SignUp'
import LogIn from './pages/LogIn'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import { useAuthStore } from './store/useAuthStore.js'
import {Loader} from "lucide-react"
import {Toaster} from "react-hot-toast"
import { useThemeStore } from './store/useThemeStore.js'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth,onlineUsers} = useAuthStore()
  const {theme} = useThemeStore()
  console.log({onlineUsers})
  useEffect(()=>{
    checkAuth();
  },[checkAuth])
  console.log({authUser})
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if(isCheckingAuth && !authUser) {return(
    <div className='flex items-center justify-center h-screen'>
      <Loader className="size-10 animate-spin"></Loader>
    </div>
  )}
  return (
    <div>
      <Navbar/>
       <Routes>
        <Route path="/" element={authUser?<HomePage/>:<Navigate to="/login"/>}/>
        <Route path="/signup" element={!authUser?<SignUp/>:<Navigate to="/"/>}/>
        <Route path="/login" element={!authUser?<LogIn/>:<Navigate to="/"/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/profile" element={authUser?<Profile/>:<Navigate to="/login"/>}/>
      </Routes>
    <Toaster/>
    </div>
  )
}

export default App
