import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { HiOutlinePhotograph, HiOutlineUpload } from 'react-icons/hi';
import PostEditor from '../components/PostEditor';

const MAX_SIZE = 5 * 1024 * 1024;

const inputStyle = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '10px 14px',
  color: 'var(--text)',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 6,
};

export default function UpdatePost() {
  const [formData, setFormData] = useState({ title: '', category: 'uncategorized', content: '' });
  const [publishError, setPublishError] = useState(null);
  const [contentReady, setContentReady] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const fileRef = useRef();
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) { setPublishError(data.message); return; }
        setFormData(data.posts[0]);
        setContentReady(true);
        setPublishError(null);
      } catch (e) { console.log(e.message); }
    };
    fetchPost();
  }, [postId]);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError(null);

    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setImageError('Image must be smaller than 5MB');
      e.target.value = '';
      return;
    }

    handleImageUpload(file);
    e.target.value = '';
  };

  const handleImageUpload = async file => {
    setImageUploading(true);
    setImageError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post('/api/post/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({
        ...prev,
        image: res.data.url,
        imagePublicId: res.data.publicId,
      }));
    } catch (err) {
      setImageError(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setPublishError(data.message); return; }
      setPublishError(null);
      navigate(`/dashboard/post/${data.slug}`);
    } catch {
      setPublishError('Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 60px', minHeight: '100vh' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 700,
          color: 'var(--text)', letterSpacing: '0.06em', marginBottom: 6,
        }}>
          Update Post
        </h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
          Edit and republish your article
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 260px' }}>
            <label style={labelStyle}>Title</label>
            <input
              type="text" placeholder="Post title..." required
              value={formData.title}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={labelStyle}>Category</label>
            <select
              value={formData.category}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
             <option value="uncategorized">Uncategorized</option>

<option value="software">Software Engineering</option>
<option value="javascript">JavaScript</option>
<option value="reactjs">React</option>
<option value="backend">Backend / APIs</option>
<option value="system-design">System Design</option>

<option value="ai-ml">AI & Machine Learning</option>
<option value="devops">DevOps & Cloud</option>

<option value="tech">Technology</option>
<option value="hardware">Hardware</option>
<option value="space-tech">Space Tech</option>

<option value="philosophy">Tech Philosophy</option>
<option value="history">Tech History</option>

<option value="career">Career & Learning</option>
<option value="projects">Projects & Builds</option> </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cover Image</label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '16px',
            border: '1px dashed var(--border2)', borderRadius: 6, background: 'var(--surface)',
          }}>
            <HiOutlinePhotograph style={{ fontSize: 20, color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={fileRef} type="file" accept="image/*"
              onChange={handleFileChange}
              style={{
                flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: 'var(--text-muted)', background: 'none', border: 'none',
                outline: 'none', cursor: 'pointer',
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              disabled={imageUploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, padding: '7px 14px', borderRadius: 4, cursor: 'pointer',
                flexShrink: 0, opacity: imageUploading ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              <HiOutlineUpload size={13} />
              {imageUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {imageError && (
            <p style={{
              marginTop: 6, fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, color: 'var(--red)',
            }}>{imageError}</p>
          )}

          {formData.image && !imageUploading && (
            <div style={{ marginTop: 10 }}>
              <img
                src={formData.image} alt="Cover"
                style={{ height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'var(--text-muted)', marginTop: 4,
              }}>
                Current image — upload a new one to replace
              </p>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Content</label>
          {contentReady && (
            <PostEditor
              content={formData.content}
              onChange={html => setFormData({ ...formData, content: html })}
            />
          )}
        </div>

        {publishError && (
          <div style={{
            padding: '10px 14px', background: 'var(--red-dim)',
            border: '1px solid rgba(255,68,102,0.22)', borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--red)',
          }}>
            {publishError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            background: 'transparent', border: '1px solid var(--border2)',
            color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Cancel
          </button>
          <button type="submit" style={{
            background: 'var(--accent)', color: 'var(--bg)',
            fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', padding: '11px 32px',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px var(--accent-glow)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            Update Post
          </button>
        </div>
      </form>
    </div>
  );
}