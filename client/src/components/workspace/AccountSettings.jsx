import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HiOutlineCamera, HiOutlineLogout } from 'react-icons/hi'
import { Alert, Button, Field, Input, Modal, Spinner } from '../ui'
import { PasswordInput } from '../auth/AuthLayout'
import { updateSuccess, deleteUserSuccess } from '../../redux/user/userSlice'
import { useSignOut } from '../shell/useSignOut'
import { friendlyError, requestJSON } from '../../utils/http'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME = /^[a-z0-9]{7,20}$/
const MAX_AVATAR = 5 * 1024 * 1024

export const memberSince = user =>
  user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null

/**
 * Profile + account management for readers and the publisher.
 * Contracts unchanged: PUT /api/user/upload-avatar/:id (multipart "avatar"),
 * PUT /api/user/update/:id (changed fields only), DELETE /api/user/delete/:id.
 */
export default function AccountSettings() {
  const { currentUser } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const signOut = useSignOut()
  const fileRef = useRef(null)

  const [values, setValues] = useState({ username: currentUser.username, email: currentUser.email, password: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // { type, message }

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const changed = {
    ...(values.username.trim() !== currentUser.username && { username: values.username.trim() }),
    ...(values.email.trim() !== currentUser.email && { email: values.email.trim() }),
    ...(values.password && { password: values.password }),
  }
  const dirty = Object.keys(changed).length > 0

  const update = field => event => {
    const value = field === 'username' ? event.target.value.toLowerCase() : event.target.value
    setValues(v => ({ ...v, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setResult(null)
  }

  const save = async event => {
    event.preventDefault()
    const next = {}
    if (changed.username !== undefined && !USERNAME.test(changed.username)) next.username = 'Use 7–20 lowercase letters or numbers.'
    if (changed.email !== undefined && !EMAIL.test(changed.email)) next.email = 'Enter a valid email address.'
    if (changed.password !== undefined && changed.password.length < 6) next.password = 'Use at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length || !dirty) return
    setSaving(true)
    setResult(null)
    try {
      const user = await requestJSON(`/api/user/update/${currentUser._id}`, { method: 'PUT', body: changed })
      dispatch(updateSuccess({ ...currentUser, ...user }))
      setValues(v => ({ ...v, password: '' }))
      setResult({ type: 'success', message: 'Profile saved.' })
    } catch (error) {
      setResult({ type: 'danger', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setAvatarError(null)
    if (!file.type.startsWith('image/')) return setAvatarError('Choose an image file (JPG, PNG, WebP…).')
    if (file.size > MAX_AVATAR) return setAvatarError('Images must be smaller than 5 MB.')
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarBusy(true)
    try {
      const body = new FormData()
      body.append('avatar', file)
      const res = await fetch(`/api/user/upload-avatar/${currentUser._id}`, { method: 'PUT', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(friendlyError(data.message, res.status))
      dispatch(updateSuccess({ ...currentUser, ...data }))
    } catch (error) {
      setAvatarError(error.message || 'Upload failed. Please try again.')
    } finally {
      setAvatarPreview(null)
      setAvatarBusy(false)
    }
  }

  const deleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await requestJSON(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' })
      dispatch(deleteUserSuccess())
    } catch (error) {
      setDeleteError(error.message)
      setDeleting(false)
    }
  }

  const since = memberSince(currentUser)

  return (
    <div className="settings">
      <section className="settings-block" aria-labelledby="profile-heading">
        <div className="settings-block__intro">
          <h2 id="profile-heading" className="settings-block__title">Profile</h2>
          <p>How you appear next to your comments.</p>
        </div>

        <div className="settings-block__body">
          <div className="avatar-editor">
            <div className="avatar-editor__image">
              <img src={avatarPreview || currentUser.profilePicture} alt="" />
              {avatarBusy && <span className="avatar-editor__busy"><Spinner label="Uploading photo" /></span>}
            </div>
            <div>
              <p className="avatar-editor__name">{currentUser.username}</p>
              {since && <p className="avatar-editor__since">{currentUser.isAdmin ? 'Publisher' : 'Reader'} since {since}</p>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={avatarBusy}>
                {!avatarBusy && <HiOutlineCamera aria-hidden="true" />}
                {avatarBusy ? 'Uploading…' : 'Change photo'}
              </Button>
            </div>
          </div>
          {avatarError && <Alert variant="danger">{avatarError}</Alert>}

          <form className="settings-form" onSubmit={save} noValidate>
            <Field label="Username" hint="7–20 lowercase letters or numbers." error={errors.username}>
              <Input autoComplete="username" autoCapitalize="none" spellCheck={false} value={values.username} onChange={update('username')} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" autoComplete="email" value={values.email} onChange={update('email')} />
            </Field>
            <Field label="New password" hint="Leave blank to keep your current password." error={errors.password}>
              <PasswordInput autoComplete="new-password" value={values.password} onChange={update('password')} />
            </Field>
            {result && <Alert variant={result.type}>{result.message}</Alert>}
            <div className="settings-form__actions">
              <Button type="submit" loading={saving} disabled={!dirty}>{saving ? 'Saving…' : 'Save changes'}</Button>
              {dirty && !saving && (
                <Button variant="ghost" onClick={() => { setValues({ username: currentUser.username, email: currentUser.email, password: '' }); setErrors({}) }}>
                  Discard
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="settings-block" aria-labelledby="session-heading">
        <div className="settings-block__intro">
          <h2 id="session-heading" className="settings-block__title">Session</h2>
          <p>Signed in as {currentUser.email}.</p>
        </div>
        <div className="settings-block__body">
          <Button variant="secondary" onClick={signOut}><HiOutlineLogout aria-hidden="true" /> Sign out</Button>
        </div>
      </section>

      <section className="settings-block settings-block--danger" aria-labelledby="danger-heading">
        <div className="settings-block__intro">
          <h2 id="danger-heading" className="settings-block__title">Delete account</h2>
          <p>Permanently removes your account. This can’t be undone.</p>
        </div>
        <div className="settings-block__body">
          <Button variant="danger" onClick={() => { setConfirmText(''); setDeleteError(null); setDeleteOpen(true) }}>Delete account…</Button>
        </div>
      </section>

      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete your account?"
        description="Your account will be removed permanently. Comments you’ve written may remain without your name."
        size="sm"
        dismissible={!deleting}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" loading={deleting} disabled={confirmText !== currentUser.username} onClick={deleteAccount}>
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </>
        }
      >
        <Field label={<>Type <strong>{currentUser.username}</strong> to confirm</>}>
          <Input autoComplete="off" autoCapitalize="none" spellCheck={false} value={confirmText} onChange={e => setConfirmText(e.target.value)} />
        </Field>
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      </Modal>
    </div>
  )
}
