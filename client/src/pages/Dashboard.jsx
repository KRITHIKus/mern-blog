import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminConsole from '../components/workspace/AdminConsole'
import ReaderSpace from '../components/workspace/ReaderSpace'

// Older links used ?tab=profile / ?tab=dash.
const LEGACY_TABS = { profile: 'account', dash: 'overview' }

export default function Dashboard() {
  const { currentUser } = useSelector(state => state.user)
  const raw = new URLSearchParams(useLocation().search).get('tab') || 'overview'
  const tab = LEGACY_TABS[raw] || raw
  return currentUser?.isAdmin ? <AdminConsole tab={tab} /> : <ReaderSpace tab={tab} />
}
