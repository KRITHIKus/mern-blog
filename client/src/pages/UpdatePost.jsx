import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { Alert, Button, Container, EmptyState, Spinner } from '../components/ui'
import PostForm from '../components/publishing/PostForm'
import { requestJSON } from '../utils/http'
import { fetchPosts } from '../utils/posts'

// Loads the post by id, then PUT /api/post/updatepost/:postId/:userId — contract unchanged.
export default function UpdatePost() {
  const { postId } = useParams()
  const { currentUser } = useSelector(state => state.user)
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchPosts({ postId }, { signal: controller.signal })
      .then(({ posts }) => setState(posts[0] ? { status: 'ready', post: posts[0] } : { status: 'notfound' }))
      .catch(error => { if (error.name !== 'AbortError') setState({ status: 'error', error: error.message }) })
    return () => controller.abort()
  }, [postId])

  if (state.status === 'loading') {
    return <Container className="compose-state"><Spinner label="Loading article" /> <span>Loading article…</span></Container>
  }
  if (state.status !== 'ready') {
    return (
      <Container size="reading" className="compose-state">
        {state.status === 'error'
          ? <Alert variant="danger" title="Couldn’t load this article">{state.error}</Alert>
          : <EmptyState icon={<HiOutlineDocumentText />} title="Article not found" description="It may have been deleted." titleAs="h1"
              action={<Button as={Link} to="/dashboard?tab=posts" variant="secondary">Back to posts</Button>} />}
      </Container>
    )
  }

  const { post } = state
  return (
    <PostForm
      mode="edit"
      initial={post}
      existingSlug={post.slug}
      updatedAt={post.updatedAt}
      onSubmit={payload => requestJSON(`/api/post/updatepost/${post._id}/${currentUser._id}`, { method: 'PUT', body: payload })}
    />
  )
}
