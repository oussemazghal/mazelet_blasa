import Home from './pages/Home.jsx'
import Games from './pages/Games.jsx'
import New from './pages/new.jsx'
import Aboutus from './pages/Aboutus.jsx'
import Signup from './pages/Signup.jsx'
import Header from './components/Header.jsx'
import Signin from './pages/Signin.jsx'
import Add from './pages/Add.jsx'
import Profile from './pages/Profile.jsx'
import MyGames from './pages/MyGames.jsx'
import UserProfile from "./pages/UserProfile";


import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MyOrganizedGames from './pages/MyOrganizedGames.jsx'

import { ToastProvider } from './context/ToastContext';

export default function MyApp() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Header />

                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/games' element={<Games />} />
                    <Route path='/signup' element={<Signup />} />
                    <Route path='/aboutus' element={<Aboutus />} />
                    <Route path="/new" element={<New />} />
                    <Route path="/login" element={<Signin />} />
                    <Route path="/add" element={<Add />} />
                    <Route path="/game" element={<Games />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<UserProfile />} />
                    <Route path="/my-games" element={<MyGames />} />
                    <Route path="/my-organized-games" element={<MyOrganizedGames />} />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    )
}
