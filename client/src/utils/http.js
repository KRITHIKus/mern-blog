// Small JSON request helper with friendly error messages.
// The API returns { success:false, statusCode, message } on errors, and some
// messages are raw database errors — translate the common ones.

const friendly = (message = '', status) => {
  if (/E11000/.test(message)) {
    if (/email/i.test(message)) return 'An account with this email already exists.'
    if (/username/i.test(message)) return 'That username is taken. Try another one.'
    if (/title/i.test(message)) return 'A post with this title already exists. Choose a different title.'
    return 'That value is already in use.'
  }
  if (/request entity too large/i.test(message)) return 'This is too large to save. Try shortening it or using fewer embedded images.'
  if (status === 401 && !message) return 'Please sign in to continue.'
  return message || 'Something went wrong. Please try again.'
}

export class RequestError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function requestJSON(url, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new RequestError('Network error — check your connection and try again.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.success === false) {
    throw new RequestError(friendly(data?.message, res.status), res.status)
  }
  return data
}

export const friendlyError = friendly
