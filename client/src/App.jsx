import React from 'react'
import {BrowserRouter, Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import SignIn from './pages/SignIn'
import Projects from './pages/Projects'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/About' element={<About/>}/>
      <Route path='/SignIn' element={<SignIn/>}/>
      <Route path='/Projects' element={<Projects/>}/>
      <Route path='/SignUp' element={<SignUp/>}/>
      <Route path='/Dashboard' element={<Dashboard/>}/>

    </Routes>
    
    </BrowserRouter>
  )
}
