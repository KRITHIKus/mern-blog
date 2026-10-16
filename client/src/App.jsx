import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import SignIn from './pages/SignIn'
import Projects from './pages/Projects'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import AppShell from './components/shell/AppShell'
import PrivateRoute from './components/privateRoute'
import OnlyAdminPrivateRoute from './components/OnlyAdminprivateRoute'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost'
import PostPage from './pages/PostPage.jsx'
import Search from './pages/Search.jsx'

// Design-system reference page; only exists in the dev server build.
const UiPreview = import.meta.env.DEV ? lazy(() => import('./pages/dev/UiPreview.jsx')) : null

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/About' element={<About/>}/>
          <Route path='/SignIn' element={<SignIn/>}/>
          <Route path='/Projects' element={<Projects/>}/>
          <Route path='/SignUp' element={<SignUp/>}/>
          <Route path='/search' element={<Search />} />
          {UiPreview && (
            <Route path='/__ui' element={<Suspense fallback={null}><UiPreview /></Suspense>} />
          )}
          <Route path='/dashboard/post/:postSlug' element={<PostPage/>}/>
          <Route element={<PrivateRoute/>}>
            <Route path='/Dashboard' element={<Dashboard/>}/>
          </Route>
          <Route element={<OnlyAdminPrivateRoute/>}>
            <Route path='/createPost' element={<CreatePost/>}/>
            <Route path='/update-post/:postId' element={<UpdatePost/>}/>
          </Route>
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
