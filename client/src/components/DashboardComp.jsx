import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineAnnotation,
  HiArrowSmUp,
  HiArrowSmDown,
} from 'react-icons/hi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
);

function StatCard({ label, value, delta, icon: Icon, color }) {
  const positive = delta >= 0;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '20px 24px',
      flex: '1 1 200px',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>{label}</p>
          <p style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1,
          }}>{value.toLocaleString()}</p>
        </div>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: color + '18',
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
      }}>
        {positive
          ? <HiArrowSmUp style={{ color: 'var(--green)', fontSize: 14 }} />
          : <HiArrowSmDown style={{ color: 'var(--red)', fontSize: 14 }} />}
        <span style={{ color: positive ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
          {Math.abs(delta)}
        </span>
        <span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>last 30 days</span>
      </div>
    </div>
  );
}

function SectionTable({ title, linkTo, headers, rows }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      overflow: 'hidden',
      flex: '1 1 300px',
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>{title}</span>
        <Link to={linkTo} style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: 'var(--accent)',
          textDecoration: 'none',
          letterSpacing: '0.06em',
          opacity: 0.8,
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.target.style.opacity = 1}
          onMouseLeave={e => e.target.style.opacity = 0.8}
        >
          View all →
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: '8px 20px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: 'var(--text-muted)',
                textAlign: 'left',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                background: 'var(--surface2)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '10px 20px',
                  fontFamily: j === 0 ? 'inherit' : 'JetBrains Mono, monospace',
                  fontSize: 12,
                  color: 'var(--text)',
                  verticalAlign: 'middle',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (!currentUser.isAdmin) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/getusers?limit=5');
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
          setLastMonthUsers(data.lastMonthUsers || 0);
        }
      } catch (e) { console.log(e.message); }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts?limit=5');
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts || 0);
        }
      } catch (e) { console.log(e.message); }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comment/getcomments?limit=5');
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (e) { console.log(e.message); }
    };

    fetchUsers();
    fetchPosts();
    fetchComments();
  }, [currentUser]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date().getMonth();
  const lineLabels = months.slice(Math.max(0, now - 5), now + 1);

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Users',
        data: lineLabels.map((_, i) => Math.max(0, totalUsers - (lineLabels.length - 1 - i) * lastMonthUsers)),
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0,229,255,0.06)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#00e5ff',
      },
      {
        label: 'Posts',
        data: lineLabels.map((_, i) => Math.max(0, totalPosts - (lineLabels.length - 1 - i) * lastMonthPosts)),
        borderColor: '#39ff8a',
        backgroundColor: 'rgba(57,255,138,0.04)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#39ff8a',
      },
      {
        label: 'Comments',
        data: lineLabels.map((_, i) => Math.max(0, totalComments - (lineLabels.length - 1 - i) * lastMonthComments)),
        borderColor: '#ffd166',
        backgroundColor: 'rgba(255,209,102,0.04)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#ffd166',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#52526e',
          font: { family: 'JetBrains Mono', size: 10 },
          boxWidth: 10,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0e0e12',
        borderColor: '#1f1f2e',
        borderWidth: 1,
        titleColor: '#00e5ff',
        bodyColor: '#dddde8',
        titleFont: { family: 'Orbitron', size: 10 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,229,255,0.04)' },
        ticks: { color: '#52526e', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0,229,255,0.04)' },
        ticks: { color: '#52526e', font: { family: 'JetBrains Mono', size: 10 } },
        beginAtZero: true,
      },
    },
  };

  const doughnutData = {
    labels: ['Users', 'Posts', 'Comments'],
    datasets: [{
      data: [totalUsers || 1, totalPosts || 1, totalComments || 1],
      backgroundColor: ['rgba(0,229,255,0.75)', 'rgba(57,255,138,0.75)', 'rgba(255,209,102,0.75)'],
      borderColor: ['#00e5ff', '#39ff8a', '#ffd166'],
      borderWidth: 1,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#52526e',
          font: { family: 'JetBrains Mono', size: 10 },
          boxWidth: 10,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: '#0e0e12',
        borderColor: '#1f1f2e',
        borderWidth: 1,
        titleColor: '#00e5ff',
        bodyColor: '#dddde8',
        titleFont: { family: 'Orbitron', size: 10 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
      },
    },
  };

  const userRows = users.map(u => [
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={u.profilePicture} alt={u.username}
        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>@{u.username}</span>
    </div>,
    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
      {new Date(u.createdAt).toLocaleDateString()}
    </span>,
  ]);

  const commentRows = comments.map(c => [
    <p style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
      {c.content}
    </p>,
    <span style={{ color: 'var(--accent)', fontFamily: 'Orbitron, monospace', fontSize: 11 }}>
      {c.numberOfLikes}
    </span>,
  ]);

  const postRows = posts.map(p => [
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={p.image} alt={p.title}
        style={{ width: 40, height: 28, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--border2)' }} />
      <span style={{
        maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', fontSize: 12,
      }}>{p.title}</span>
    </div>,
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{p.category}</span>,
  ]);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Stats Row ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total Users" value={totalUsers} delta={lastMonthUsers}
          icon={HiOutlineUsers} color="var(--accent)" />
        <StatCard label="Total Posts" value={totalPosts} delta={lastMonthPosts}
          icon={HiOutlineDocumentText} color="var(--green)" />
        <StatCard label="Total Comments" value={totalComments} delta={lastMonthComments}
          icon={HiOutlineAnnotation} color="var(--yellow)" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{
          flex: '2 1 440px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '20px 24px',
          minWidth: 0,
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}>Activity — 6 Months</p>
          <div style={{ height: 220 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div style={{
          flex: '1 1 220px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '20px 24px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}>Distribution</p>
          <div style={{ flex: 1, minHeight: 200 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SectionTable
          title="Recent Users"
          linkTo="/dashboard?tab=users"
          headers={['User', 'Joined']}
          rows={userRows}
        />
        <SectionTable
          title="Recent Comments"
          linkTo="/dashboard?tab=comments"
          headers={['Content', 'Likes']}
          rows={commentRows}
        />
        <SectionTable
          title="Recent Posts"
          linkTo="/dashboard?tab=posts"
          headers={['Post', 'Category']}
          rows={postRows}
        />
      </div>
    </div>
  );
}