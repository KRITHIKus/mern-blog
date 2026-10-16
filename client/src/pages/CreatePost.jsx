import PostForm from '../components/publishing/PostForm'
import { requestJSON } from '../utils/http'

// POST /api/post/create (admin) — contract unchanged.
export default function CreatePost() {
  return (
    <PostForm
      mode="create"
      onSubmit={payload => requestJSON('/api/post/create', { method: 'POST', body: payload })}
    />
  )
}
