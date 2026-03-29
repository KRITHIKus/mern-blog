import { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  updateStart, updateSuccess, updateFailure,
  deleteUserStart, deleteUserSuccess, deleteUserFailure,
  siginOutSuccess,
} from '../redux/user/userSlice'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector(state => state.user)
  const dispatch    = useDispatch()
  const filePickRef = useRef()

  const [imageUrl,          setImageUrl]          = useState(null)
  const [formData,          setFormData]          = useState({})
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
  const [updateUserError,   setUpdateUserError]   = useState(null)
  const [showModal,         setShowModal]         = useState(false)
  const [avatarUploading,   setAvatarUploading]   = useState(false)
  const [avatarError,       setAvatarError]       = useState(null)

  const handleImageChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarError(null)

    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed (jpg, png, webp, etc.)')
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setAvatarError('Image must be smaller than 5MB')
      e.target.value = ''
      return
    }

    const localPreview = URL.createObjectURL(file)
    setImageUrl(localPreview)
    setAvatarUploading(true)

    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await axios.put(
        `/api/user/upload-avatar/${currentUser._id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      dispatch(updateSuccess(res.data))
      setImageUrl(res.data.profilePicture)
    } catch (err) {
      setAvatarError(err?.response?.data?.message || 'Avatar upload failed')
      setImageUrl(null)
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleChange = e => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setUpdateUserError(null)
    setUpdateUserSuccess(null)
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made')
      return
    }
    try {
      dispatch(updateStart())
      const res  = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        dispatch(updateFailure(data.message))
        setUpdateUserError(data.message)
      } else {
        dispatch(updateSuccess(data))
        setUpdateUserSuccess('Profile updated successfully')
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
      setUpdateUserError(error.message)
    }
  }

  const handleDeleteUser = async () => {
    setShowModal(false)
    try {
      dispatch(deleteUserStart())
      const res  = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { dispatch(deleteUserFailure(data.message)) }
      else          { dispatch(deleteUserSuccess(data)) }
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignout = async () => {
    try {
      const res  = await fetch('/api/user/sign-out', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { console.log(data.message) }
      else          { dispatch(siginOutSuccess()) }
    } catch (error) { console.log(error.message) }
  }

  return (
    <>
      <style>{`
        .dp-wrap {
          padding: 28px 24px 48px;
          max-width: 640px;
        }
        @media(max-width:560px){ .dp-wrap { padding: 20px 16px 40px; } }

        /* ── HEADER CARD ── */
        .dp-header-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px; padding: 22px;
          display: flex; align-items: center; gap: 18px;
          margin-bottom: 16px; position: relative; overflow: hidden;
        }
        .dp-header-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0.3;
        }
        .dp-avatar-wrap {
          position: relative; flex-shrink: 0; cursor: pointer;
        }
        .dp-avatar {
          width: 68px; height: 68px; border-radius: 50%;
          border: 2px solid var(--border2); object-fit: cover; display: block;
          transition: border-color 0.2s;
        }
        .dp-avatar-wrap:hover .dp-avatar { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-dim); }
        .dp-avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(0,229,255,0.12);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          font-family: 'JetBrains Mono', monospace; font-size: 7px;
          color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase;
        }
        .dp-avatar-wrap:hover .dp-avatar-overlay { opacity: 1; }

        .dp-header-name {
          font-family: 'Orbitron', monospace; font-size: 16px;
          font-weight: 700; color: var(--text);
          letter-spacing: -0.01em; margin-bottom: 3px;
        }
        .dp-header-email {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: var(--text-muted); margin-bottom: 7px;
        }
        .dp-role-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--accent-dim);
          border: 1px solid rgba(0,229,255,0.2);
          color: var(--accent); padding: 3px 8px; border-radius: 2px;
        }
        .dp-role-badge.user {
          background: rgba(82,82,110,0.15);
          border-color: var(--border); color: var(--text-muted);
        }

        .dp-upload-alert {
          padding: 9px 12px; border-radius: 2px; margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.03em;
          background: rgba(255,209,102,0.08);
          border: 1px solid rgba(255,209,102,0.22);
          color: var(--yellow);
          display: flex; align-items: center; gap: 7px;
          animation: alertIn 0.3s ease;
        }
        .dp-upload-alert::before { content: '⟳'; }
        @keyframes alertIn { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:none} }

        /* sections */
        .dp-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px; margin-bottom: 12px; overflow: hidden;
        }
        .dp-section-header {
          padding: 9px 16px; background: var(--surface2);
          border-bottom: 1px solid var(--border);
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--text-muted);
          display: flex; align-items: center; gap: 6px;
        }
        .dp-section-header::before { content: '//'; color: var(--accent); opacity: 0.4; }
        .dp-section-body { padding: 16px; }

        /* fields */
        .dp-field { margin-bottom: 13px; }
        .dp-field:last-child { margin-bottom: 0; }
        .dp-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 5px;
        }
        .dp-input {
          width: 100%; background: var(--surface2);
          border: 1px solid var(--border); border-radius: 2px;
          padding: 10px 12px; color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; outline: none; letter-spacing: 0.04em;
          transition: border-color 0.15s, box-shadow 0.15s;
          caret-color: var(--accent);
        }
        .dp-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .dp-input::placeholder { color: var(--text-faint); font-size: 11px; }

        /* buttons */
        .dp-btn-primary {
          width: 100%; background: var(--accent); color: var(--bg);
          font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 11px; border: none; border-radius: 2px; cursor: pointer;
          transition: box-shadow 0.15s, transform 0.1s; margin-top: 4px;
        }
        .dp-btn-primary:hover { box-shadow: 0 0 18px var(--accent-glow); transform: translateY(-1px); }
        .dp-btn-primary:active { transform: translateY(0); }
        .dp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .dp-btn-outline {
          width: 100%; background: transparent;
          border: 1px solid var(--accent); color: var(--accent);
          font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 11px; border-radius: 2px; cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s; text-decoration: none;
          display: block; text-align: center;
        }
        .dp-btn-outline:hover { background: var(--accent-dim); box-shadow: 0 0 12px var(--accent-glow); }

        /* danger zone */
        .dp-danger-section {
          background: var(--surface);
          border: 1px solid rgba(255,68,102,0.2);
          border-radius: 4px; overflow: hidden; margin-bottom: 12px;
        }
        .dp-danger-header {
          padding: 9px 16px; background: rgba(255,68,102,0.06);
          border-bottom: 1px solid rgba(255,68,102,0.15);
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--red); opacity: 0.85;
          display: flex; align-items: center; gap: 6px;
        }
        .dp-danger-header::before { content: '//'; opacity: 0.5; }
        .dp-danger-body { padding: 16px; display: flex; gap: 10px; flex-wrap: wrap; }
        .dp-btn-danger {
          flex: 1; background: transparent;
          border: 1px solid rgba(255,68,102,0.3); color: var(--red);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 10px 16px; border-radius: 2px; cursor: pointer;
          transition: background 0.15s, border-color 0.15s; white-space: nowrap;
        }
        .dp-btn-danger:hover { background: var(--red-dim); border-color: var(--red); }

        /* alerts */
        .dp-alert-success {
          padding: 10px 12px; border-radius: 2px; margin-top: 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.03em;
          background: rgba(57,255,138,0.08);
          border: 1px solid rgba(57,255,138,0.22);
          color: var(--green);
          display: flex; align-items: center; gap: 7px;
        }
        .dp-alert-success::before { content: '✓'; }
        .dp-alert-error {
          padding: 10px 12px; border-radius: 2px; margin-top: 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.03em;
          background: var(--red-dim);
          border: 1px solid rgba(255,68,102,0.22);
          color: var(--red);
          display: flex; align-items: center; gap: 7px;
        }
        .dp-alert-error::before { content: '⚠'; }

        /* delete modal */
        .dp-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(7,7,9,0.78);
          backdrop-filter: blur(4px); z-index: 999;
          display: flex; align-items: center; justify-content: center;
        }
        .dp-modal {
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 4px; padding: 28px;
          max-width: 360px; width: 90%; text-align: center;
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
        .dp-modal-icon {
          font-family: 'Orbitron', monospace; font-size: 24px;
          color: var(--text-muted); margin-bottom: 14px;
        }
        .dp-modal-title {
          font-family: 'Orbitron', monospace; font-size: 11px;
          font-weight: 700; letter-spacing: 0.16em;
          color: var(--text); margin-bottom: 6px;
        }
        .dp-modal-sub {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: var(--text-muted); margin-bottom: 22px; line-height: 1.6;
        }
        .dp-modal-btns { display: flex; justify-content: center; gap: 10px; }
        .dp-modal-del {
          background: var(--red); color: #fff;
          font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; padding: 9px 20px;
          border: none; border-radius: 2px; cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .dp-modal-del:hover { box-shadow: 0 0 12px rgba(255,68,102,0.35); }
        .dp-modal-cancel {
          background: transparent; border: 1px solid var(--border2);
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; padding: 8px 18px; border-radius: 2px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .dp-modal-cancel:hover { border-color: var(--text); color: var(--text); }
      `}</style>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={filePickRef}
        style={{ display: 'none' }}
      />

      <div className="dp-wrap">

        {/* ── PROFILE HEADER ── */}
        <div className="dp-header-card">
          <div
            className="dp-avatar-wrap"
            onClick={() => !avatarUploading && filePickRef.current.click()}
          >
            <img
              className="dp-avatar"
              src={imageUrl || currentUser.profilePicture}
              alt={currentUser.username}
            />
            <div className="dp-avatar-overlay">
              {avatarUploading ? '...' : 'CHANGE'}
            </div>
          </div>
          <div>
            <div className="dp-header-name">{currentUser.username}</div>
            <div className="dp-header-email">{currentUser.email}</div>
            <div className={`dp-role-badge ${currentUser.isAdmin ? '' : 'user'}`}>
              {currentUser.isAdmin ? '◈ Admin' : '◈ User'}
            </div>
          </div>
        </div>

        {avatarUploading && (
          <div className="dp-upload-alert">Uploading avatar...</div>
        )}
        {avatarError && (
          <div className="dp-alert-error" style={{ marginBottom: 14, marginTop: 0 }}>
            {avatarError}
          </div>
        )}

        {/* ── EDIT PROFILE ── */}
        <div className="dp-section">
          <div className="dp-section-header">edit_profile</div>
          <div className="dp-section-body">
            <form onSubmit={handleSubmit}>
              <div className="dp-field">
                <label className="dp-label">Username</label>
                <input
                  className="dp-input"
                  type="text"
                  id="username"
                  placeholder="username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                />
              </div>
              <div className="dp-field">
                <label className="dp-label">Email Address</label>
                <input
                  className="dp-input"
                  type="email"
                  id="email"
                  placeholder="email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                />
              </div>
              <div className="dp-field">
                <label className="dp-label">New Password</label>
                <input
                  className="dp-input"
                  type="password"
                  id="password"
                  placeholder="leave blank to keep current"
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="dp-btn-primary"
                disabled={loading}
                style={{ marginTop: '16px' }}
              >
                {loading ? '⟳ UPDATING...' : '▶ UPDATE PROFILE'}
              </button>
            </form>

            {updateUserSuccess && (
              <div className="dp-alert-success">{updateUserSuccess}</div>
            )}
            {updateUserError && (
              <div className="dp-alert-error">{updateUserError}</div>
            )}
            {error && (
              <div className="dp-alert-error">{error}</div>
            )}
          </div>
        </div>

        {/* ── ADMIN ACTIONS ── */}
        {currentUser.isAdmin && (
          <div className="dp-section">
            <div className="dp-section-header">admin_actions</div>
            <div className="dp-section-body">
              <Link to="/createPost" className="dp-btn-outline">
                ▶ CREATE NEW POST
              </Link>
            </div>
          </div>
        )}

        {/* ── DANGER ZONE ── */}
        <div className="dp-danger-section">
          <div className="dp-danger-header">danger_zone</div>
          <div className="dp-danger-body">
            <button className="dp-btn-danger" onClick={() => setShowModal(true)}>
              Delete Account
            </button>
            <button className="dp-btn-danger" onClick={handleSignout}>
              Sign Out
            </button>
          </div>
        </div>

      </div>

      {showModal && (
        <div className="dp-modal-overlay">
          <div className="dp-modal">
            <div className="dp-modal-icon">◈</div>
            <div className="dp-modal-title">DELETE ACCOUNT</div>
            <div className="dp-modal-sub">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </div>
            <div className="dp-modal-btns">
              <button className="dp-modal-del" onClick={handleDeleteUser}>DELETE</button>
              <button className="dp-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}