import React from 'react'
import {BrowserRouter, Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import SignIn from './pages/SignIn'
import Projects from './pages/Projects'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import  Footer  from './components/footer'
import PrivateRoute from './components/privateRoute'
import OnlyAdminPrivateRoute from './components/OnlyAdminprivateRoute'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost'
import PostPage from './pages/PostPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Header/>
      
    <Routes>
    
      <Route path='/' element={<Home/>}/>
      <Route path='/About' element={<About/>}/>
      <Route path='/SignIn' element={<SignIn/>}/>
      <Route path='/Projects' element={<Projects/>}/>
      <Route path='/SignUp' element={<SignUp/>}/>
      <Route path='/dashboard/post/:postSlug' element={<PostPage/>}/>
      <Route element={<PrivateRoute/>}>
      <Route path='/Dashboard' element={<Dashboard/>}/>
      </Route>
      <Route element={<OnlyAdminPrivateRoute/>}>
      <Route path='/createPost' element={<CreatePost/>}/>
      <Route path='/update-post/:postId' element={<UpdatePost/>}/>
      </Route>
     
    </Routes>
    <Footer/>
    </BrowserRouter>
  )
}
