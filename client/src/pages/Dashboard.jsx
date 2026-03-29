import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashSidebar from '../components/DashSidebar'
import DashProfile from '../components/DashProfile'
import DashPosts from '../components/DashPosts'
import DashUsers from '../components/DashUsers'
import DashComments from '../components/DashComments'
import DashboardComp from '../components/DashboardComp'

export default function Dashboard() {
  const location      = useLocation()
  const [tab, setTab] = useState('')

  useEffect(() => {
    const urlParams  = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')
    if (tabFromUrl) setTab(tabFromUrl)
  }, [location.search])

  return (
    <>
      <style>{`
        .dash-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          overflow: hidden;
        }
        .dash-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dash-panel {
          flex: 1;
          overflow-y: auto;
        }
        .dash-panel::-webkit-scrollbar { width: 5px; }
        .dash-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>

      <div className="dash-shell">
        <DashSidebar />
        <div className="dash-content">
          <div className="dash-panel">
            {tab === 'profile'  && <DashProfile />}
            {tab === 'posts'    && <DashPosts />}
            {tab === 'users'    && <DashUsers />}
            {tab === 'comments' && <DashComments />}
            {tab === 'dash'     && <DashboardComp />}
          </div>
        </div>
      </div>
    </>
  )
}