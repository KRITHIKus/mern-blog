// Thin wrapper over GET /api/post/getposts (contract unchanged).
// Supported params: searchTerm, category, order (asc|desc), slug, postId,
// userId, startIndex, limit (server default 9). Sorted by updatedAt.
export const PAGE_SIZE = 9

export async function fetchPosts(params = {}, { signal } = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const res = await fetch(`/api/post/getposts?${query}`, { signal })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Could not load posts')
  return { posts: data.posts || [], totalPosts: data.totalPosts ?? 0 }
}

export const postPath = post => `/dashboard/post/${post.slug}`
