import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OAuth from '../components/OAuth'

// reuse same thermal canvas
function ThermalCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, animId
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const blobs = Array.from({ length: 30 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.0004, vy: (Math.random()-0.5)*0.0004,
      r: 50 + Math.random()*100, heat: Math.random(),
      a: 0.04 + Math.random()*0.07,
    }))
    const heatColor = (t, a) => {
      if (t < 0.33) return `rgba(0,${Math.floor((t/0.33)*100)+80},255,${a})`
      if (t < 0.66) return `rgba(0,255,${255-Math.floor(((t-0.33)/0.33)*255)},${a})`
      return `rgba(255,${255-Math.floor(((t-0.66)/0.34)*255)},0,${a})`
    }
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      blobs.forEach(b => {
        b.x+=b.vx; b.y+=b.vy
        if(b.x<0)b.x=1; if(b.x>1)b.x=0; if(b.y<0)b.y=1; if(b.y>1)b.y=0
        b.heat+=(Math.random()-0.5)*0.004
        b.heat=Math.max(0,Math.min(1,b.heat))
        const px=b.x*W, py=b.y*H
        const g=ctx.createRadialGradient(px,py,0,px,py,b.r)
        g.addColorStop(0, heatColor(b.heat,b.a*1.4))
        g.addColorStop(0.5, heatColor(b.heat,b.a*0.5))
        g.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=g
        ctx.beginPath(); ctx.arc(px,py,b.r,0,Math.PI*2); ctx.fill()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize) }
  }, [])
  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.5,pointerEvents:'none'}}/>
}

export default function SignUp() {
  const [formData,    setFormData]    = useState({})
  const [errorMessage,setErrorMessage]= useState(null)
  const [loading,     setLoading]     = useState(false)
  const [pwdVisible,  setPwdVisible]  = useState(false)
  const [btnState,    setBtnState]    = useState('idle')
  const [flashActive, setFlashActive] = useState(false)
  const [thermalTemp, setThermalTemp] = useState('37.2°C')
  const [uptime,      setUptime]      = useState('00:00:00')
  const [termLines,   setTermLines]   = useState([false,false,false,false,false])

  const navigate = useNavigate()
  const startRef = useRef(Date.now())

  useEffect(() => {
    termLines.forEach((_, i) => {
      setTimeout(() => {
        setTermLines(prev => { const n=[...prev]; n[i]=true; return n })
      }, 300 + i * 450)
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor((Date.now()-startRef.current)/1000)
      const f = n => String(n).padStart(2,'0')
      setUptime(`${f(Math.floor(s/3600))}:${f(Math.floor((s%3600)/60))}:${f(s%60)}`)
      setThermalTemp((36.8+Math.sin(Date.now()/2000)*0.6).toFixed(1)+'°C')
    },1000)
    return () => clearInterval(id)
  }, [])

  const handleChange = e => setFormData({...formData,[e.target.id]:e.target.value.trim()})

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('All fields required. Bio-registration failed.')
    }
    setFlashActive(false)
    setTimeout(() => setFlashActive(true), 10)
    setTimeout(() => setFlashActive(false), 1000)

    try {
      setLoading(true)
      setBtnState('loading')
      setErrorMessage(null)
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success === false) {
        setErrorMessage(data.message)
        setBtnState('idle')
        setLoading(false)
        return
      }
      setLoading(false)
      if (res.ok) {
        setBtnState('success')
        setTimeout(() => navigate('/signin'), 1200)
      }
    } catch (error) {
      setErrorMessage(error.message)
      setBtnState('idle')
      setLoading(false)
    }
  }

  const btnLabel = () => {
    if (btnState === 'loading') return '⟳ REGISTERING BIO-SIGNATURE...'
    if (btnState === 'success') return '✓ ENLISTMENT CONFIRMED'
    return '▶ INITIATE ENLISTMENT'
  }

  return (
    <>
      {/* all styles identical to SignIn — reuse same CSS classes */}
      <style>{`
        .auth-page{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#050300;position:relative;}
        .auth-page::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.1) 2px,rgba(0,0,0,0.1) 4px);}
        .auth-left{position:relative;overflow:hidden;border-right:1px solid #2a1a00;padding:40px 36px;display:flex;flex-direction:column;background:rgba(5,3,0,0.75);}
        .hud-corner{position:absolute;width:22px;height:22px;}
        .hud-corner.tl{top:12px;left:12px;border-top:2px solid #ffaa00;border-left:2px solid #ffaa00;}
        .hud-corner.tr{top:12px;right:12px;border-top:2px solid #ffaa00;border-right:2px solid #ffaa00;}
        .hud-corner.bl{bottom:12px;left:12px;border-bottom:2px solid #ffaa00;border-left:2px solid #ffaa00;}
        .hud-corner.br{bottom:12px;right:12px;border-bottom:2px solid #ffaa00;border-right:2px solid #ffaa00;}
        .pred-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,170,0,0.65),rgba(255,51,0,0.4),transparent);filter:blur(0.5px);animation:predScan 4.5s linear infinite;pointer-events:none;z-index:2;}
        @keyframes predScan{0%{top:-2px;opacity:0}5%{opacity:1}95%{opacity:0.7}100%{top:100%;opacity:0}}
        .crosshair-wrap{position:absolute;top:48%;left:62%;transform:translate(-50%,-50%);pointer-events:none;animation:chDrift 7s ease-in-out infinite;}
        @keyframes chDrift{0%,100%{transform:translate(-50%,-50%)}30%{transform:translate(-53%,-47%)}60%{transform:translate(-47%,-53%)}}
        .ch{position:relative;width:56px;height:56px;}
        .ch::before,.ch::after{content:'';position:absolute;background:rgba(255,170,0,0.65);}
        .ch::before{top:50%;left:0;right:0;height:1px;transform:translateY(-50%);}
        .ch::after{left:50%;top:0;bottom:0;width:1px;transform:translateX(-50%);}
        .ch-ring{position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(255,170,0,0.45);animation:ringPulse 2.2s ease-in-out infinite;}
        .ch-ring-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,170,0,0.2);animation:ringPulse 2.2s ease-in-out infinite 0.4s;}
        @keyframes ringPulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.8;transform:scale(1.06)}}
        .pulse-cell{position:absolute;border:1px solid transparent;animation:cellPulse var(--cd,3s) var(--cdelay,0s) ease-in-out infinite;}
        @keyframes cellPulse{0%,100%{border-color:rgba(255,170,0,0.05);background:transparent}50%{border-color:rgba(255,170,0,0.3);background:rgba(255,170,0,0.02);box-shadow:0 0 8px rgba(255,170,0,0.08)}}
        .auth-vignette{position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,transparent 40%,rgba(5,3,0,0.65) 100%);}
        .hud-data{position:absolute;font-size:7px;letter-spacing:0.12em;color:#ffaa00;font-family:'Orbitron',monospace;z-index:3;}
        .hud-data.tr{top:20px;right:40px;text-align:right}.hud-data.bl{bottom:56px;left:20px}.hud-data.br{bottom:56px;right:20px;text-align:right}
        .hud-val{color:#ffaa00;opacity:0.9;font-size:8px}.hud-lbl{opacity:0.4;font-size:6px;letter-spacing:0.14em}.hud-hot{color:#ff3300!important}.hud-ok{color:#00ff88!important}
        .auth-left-content{position:relative;z-index:3;display:flex;flex-direction:column;height:100%;gap:20px;}
        .auth-pred-logo{font-family:'Orbitron',monospace;font-size:11px;font-weight:900;letter-spacing:0.22em;color:#ffaa00;display:flex;align-items:center;gap:4px;}
        .auth-pred-logo-b{color:#664400;font-size:9px;}
        .auth-pred-title{font-family:'Orbitron',monospace;font-size:clamp(18px,2vw,26px);font-weight:900;line-height:1.2;color:#ffcc66;flex:1;display:flex;flex-direction:column;justify-content:center;}
        .auth-pred-hl{color:#ffaa00;display:block;text-shadow:0 0 18px rgba(255,170,0,0.5),0 0 36px rgba(255,170,0,0.2);}
        .auth-pred-sub{font-size:10px;color:#664400;letter-spacing:0.08em;display:block;margin-top:8px;font-weight:400;font-family:'JetBrains Mono',monospace;}
        .thermal-legend{display:flex;align-items:center;gap:10px;}
        .tl-item{display:flex;align-items:center;gap:4px;font-size:7px;letter-spacing:0.1em;color:#664400;}
        .tl-swatch{width:16px;height:3px;border-radius:1px;}
        .bio-terminal{border:1px solid #2a1a00;border-radius:2px;background:rgba(5,3,0,0.9);overflow:hidden;}
        .bio-term-header{background:rgba(42,26,0,0.8);padding:5px 10px;display:flex;align-items:center;gap:5px;border-bottom:1px solid #2a1a00;}
        .bio-term-dot{width:6px;height:6px;border-radius:50%;}
        .bio-term-title{font-size:7px;color:#664400;margin-left:auto;letter-spacing:0.1em;}
        .bio-term-body{padding:10px 12px;font-size:9px;line-height:1.9;}
        .bio-line{display:flex;align-items:center;gap:7px;opacity:0;transition:opacity 0.3s,transform 0.3s;transform:translateX(-4px);}
        .bio-line.show{opacity:1;transform:none;}
        .bio-p{color:#ffaa00;opacity:0.4}.bio-out{color:#ffcc66}.bio-out.ok{color:#00ff88}.bio-out.warn{color:#ffaa00}.bio-out.hot{color:#ff3300}
        .bio-cursor{display:inline-block;width:6px;height:10px;background:#ffaa00;opacity:0.8;animation:blink 1s step-end infinite;vertical-align:middle;}
        @keyframes blink{0%,100%{opacity:0.8}50%{opacity:0}}
        .auth-status{display:flex;align-items:center;gap:10px;font-size:7px;color:#664400;letter-spacing:0.1em;}
        .status-dot{width:5px;height:5px;border-radius:50%;background:#00ff88;box-shadow:0 0 5px #00ff88;animation:sdotPulse 2s ease-in-out infinite;}
        @keyframes sdotPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .s-ok{color:#00ff88}
        .auth-right{background:#050300;padding:40px 44px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
        .auth-right-corner{position:absolute;width:14px;height:14px;}
        .auth-right-corner.tl{top:8px;left:8px;border-top:1px solid rgba(255,170,0,0.25);border-left:1px solid rgba(255,170,0,0.25);}
        .auth-right-corner.br{bottom:8px;right:8px;border-bottom:1px solid rgba(255,170,0,0.25);border-right:1px solid rgba(255,170,0,0.25);}
        .auth-flash{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:10;}
        .auth-flash.active{animation:thermalFlash 1s ease forwards;}
        @keyframes thermalFlash{0%{opacity:0}15%{opacity:1;background:rgba(255,170,0,0.05)}30%{opacity:0.6;background:rgba(255,51,0,0.03)}100%{opacity:0}}
        .auth-flash-scan{position:absolute;left:0;right:0;height:2px;top:0;opacity:0;background:linear-gradient(90deg,transparent,rgba(255,170,0,0.7),rgba(255,51,0,0.5),transparent);filter:blur(0.5px);}
        .auth-flash.active .auth-flash-scan{animation:flashScan 1s ease forwards;}
        @keyframes flashScan{0%{top:0;opacity:0}8%{opacity:1}92%{opacity:0.4}100%{top:100%;opacity:0}}
        .auth-success{position:absolute;inset:0;background:rgba(5,3,0,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:20;opacity:0;pointer-events:none;transition:opacity 0.3s;}
        .auth-success.show{opacity:1;pointer-events:auto;}
        .auth-success-icon{width:56px;height:56px;border-radius:50%;border:2px solid #00ff88;display:flex;align-items:center;justify-content:center;color:#00ff88;font-size:22px;box-shadow:0 0 20px rgba(0,255,136,0.3);animation:successPop 0.5s ease;}
        @keyframes successPop{0%{transform:scale(0)}70%{transform:scale(1.1)}100%{transform:scale(1)}}
        .auth-success-text{font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#00ff88;text-shadow:0 0 12px rgba(0,255,136,0.4);}
        .auth-success-sub{font-size:8px;color:#664400;letter-spacing:0.12em;}
        .auth-eyebrow{font-size:7px;letter-spacing:0.2em;text-transform:uppercase;color:#664400;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
        .auth-eyebrow::before{content:'◈';color:rgba(255,170,0,0.4);font-size:7px;}
        .auth-form-title{font-family:'Orbitron',monospace;font-size:13px;font-weight:900;letter-spacing:0.2em;color:#ffaa00;margin-bottom:24px;text-shadow:0 0 12px rgba(255,170,0,0.25);display:flex;align-items:center;gap:8px;}
        .auth-form-title::before{content:'//';color:#664400;font-size:10px;font-weight:400;}
        .auth-fld{margin-bottom:14px;}
        .auth-fld-label{display:flex;align-items:center;gap:5px;font-size:7px;letter-spacing:0.16em;text-transform:uppercase;color:#664400;margin-bottom:6px;}
        .auth-fld-icon{color:rgba(255,170,0,0.35);font-size:8px;}
        .auth-input-wrap{position:relative;}
        .auth-input{width:100%;background:#0a0700;border:1px solid #2a1a00;border-radius:2px;padding:11px 44px 11px 14px;color:#ffcc66;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;letter-spacing:0.06em;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;caret-color:#ffaa00;}
        .auth-input:focus{border-color:#ffaa00;background:rgba(30,15,0,0.9);box-shadow:0 0 0 2px rgba(255,170,0,0.06),0 0 14px rgba(255,170,0,0.07);}
        .auth-input::placeholder{color:rgba(102,68,0,0.45);font-size:11px;}
        .auth-field-bar{position:absolute;bottom:0;left:0;height:1px;width:0%;background:linear-gradient(90deg,#ffaa00,#ff3300);transition:width 0.3s ease;border-radius:0 0 2px 2px;}
        .auth-input-wrap:focus-within .auth-field-bar{width:100%;}
        .auth-pwd-toggle{position:absolute;right:0;top:0;bottom:0;width:42px;background:none;border:none;border-left:1px solid #2a1a00;border-radius:0 2px 2px 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#664400;transition:color 0.15s,background 0.15s;}
        .auth-pwd-toggle:hover{color:#ffaa00;background:rgba(255,170,0,0.04);}
        .auth-pwd-toggle-lbl{font-size:6px;letter-spacing:0.1em;text-transform:uppercase;line-height:1;}
        .auth-submit{width:100%;margin-top:6px;background:linear-gradient(135deg,rgba(255,170,0,0.92),rgba(255,100,0,0.88));color:#050300;font-family:'Orbitron',monospace;font-size:10px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;padding:13px;border:none;border-radius:2px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 0 18px rgba(255,170,0,0.12);transition:box-shadow 0.15s,transform 0.1s,background 0.3s;}
        .auth-submit:hover{box-shadow:0 0 28px rgba(255,170,0,0.35);transform:translateY(-1px);}
        .auth-submit.loading{background:linear-gradient(135deg,rgba(255,170,0,0.5),rgba(255,100,0,0.5));}
        .auth-submit.success{background:linear-gradient(135deg,rgba(0,255,136,0.85),rgba(0,180,80,0.85));}
        .auth-btn-shimmer{position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);transform:skewX(-20deg);animation:shimmerLoop 3s ease-in-out infinite;}
        @keyframes shimmerLoop{0%{left:-100%}100%{left:200%}}
        .auth-or{display:flex;align-items:center;gap:10px;font-size:7px;color:#2a1a00;letter-spacing:0.14em;margin:14px 0;}
        .auth-or::before,.auth-or::after{content:'';flex:1;height:1px;background:#2a1a00;}
        .auth-google{width:100%;background:transparent;border:1px solid #2a1a00;border-radius:2px;padding:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;color:#ffcc66;font-size:11px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em;transition:border-color 0.15s,background 0.15s;}
        .auth-google:hover{border-color:#664400;background:rgba(10,7,0,0.8);}
        .auth-foot{font-size:9px;color:#664400;margin-top:16px;display:flex;align-items:center;gap:6px;}
        .auth-foot a{color:#ffaa00;text-decoration:none;opacity:0.8;}
        .auth-foot a:hover{opacity:1;text-shadow:0 0 6px rgba(255,170,0,0.4);}
        .auth-alert{margin-top:12px;padding:9px 12px;border-radius:2px;font-size:10px;letter-spacing:0.03em;background:rgba(255,51,0,0.08);border:1px solid rgba(255,51,0,0.2);color:#ff3300;display:flex;align-items:center;gap:7px;animation:alertIn 0.3s ease;}
        @keyframes alertIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
        .auth-alert::before{content:'⚠';}
        @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-left{min-height:220px;padding:24px;}.auth-right{padding:28px 24px;}.auth-pred-title{font-size:16px;}.bio-terminal{display:none;}.thermal-legend{display:none;}}
      `}</style>

      <div className="auth-page " >

        {/* LEFT */}
        <div className="auth-left">
          <ThermalCanvas />
          <div className="hud-corner tl"/><div className="hud-corner tr"/>
          <div className="hud-corner bl"/><div className="hud-corner br"/>
          <div className="pred-scan"/>
          {[
            {top:'14%',left:'8%', w:52,cd:'2.8s',d:'0s'},
            {top:'40%',left:'44%',w:52,cd:'3.5s',d:'0.9s'},
            {top:'64%',left:'16%',w:52,cd:'2.3s',d:'1.6s'},
            {top:'78%',left:'56%',w:52,cd:'4s',  d:'0.4s'},
            {top:'26%',left:'68%',w:26,cd:'3.1s',d:'2.1s'},
          ].map((c,i) => (
            <div key={i} className="pulse-cell" style={{top:c.top,left:c.left,width:c.w,height:c.w,'--cd':c.cd,'--cdelay':c.d}}/>
          ))}
          <div className="crosshair-wrap">
            <div className="ch"><div className="ch-ring-outer"/><div className="ch-ring"/></div>
          </div>
          <div className="auth-vignette"/>
          <div className="hud-data tr">
            <div className="hud-lbl">THERMAL SCAN</div>
            <div className="hud-val">{thermalTemp}</div>
            <div className="hud-lbl" style={{marginTop:4}}>STATUS</div>
            <div className="hud-val hud-ok">NEW RECRUIT</div>
          </div>
          <div className="hud-data bl">
            <div className="hud-lbl">SYS UPTIME</div>
            <div className="hud-val">{uptime}</div>
          </div>
          <div className="hud-data br">
            <div className="hud-lbl">PROTOCOL</div>
            <div className="hud-val hud-ok">ENLIST</div>
          </div>

          <div className="auth-left-content">
            <div className="auth-pred-logo">
              <span className="auth-pred-logo-b">[</span>A2D<span className="auth-pred-logo-b">]</span>
            </div>
            <div className="auth-pred-title">
              Join the<br/>
              <span className="auth-pred-hl">hunt.</span>
              <span className="auth-pred-sub">// Register your bio-signature.</span>
            </div>
            <div className="thermal-legend">
              {[
                {label:'COLD',bg:'linear-gradient(90deg,#0044ff,#0088ff)'},
                {label:'NEUTRAL',bg:'linear-gradient(90deg,#00aa44,#00ff88)'},
                {label:'HOT',bg:'linear-gradient(90deg,#ffaa00,#ff3300)'},
              ].map(({label,bg}) => (
                <div key={label} className="tl-item">
                  <div className="tl-swatch" style={{background:bg}}/>{label}
                </div>
              ))}
            </div>
            <div className="bio-terminal">
              <div className="bio-term-header">
                <div className="bio-term-dot" style={{background:'#ff5f57'}}/>
                <div className="bio-term-dot" style={{background:'#febc2e'}}/>
                <div className="bio-term-dot" style={{background:'#28c840'}}/>
                <div className="bio-term-title">BIO-MASK OS v7.3 — ENLIST</div>
              </div>
              <div className="bio-term-body">
                {termLines.map((vis,i) => (
                  <div key={i} className={`bio-line ${vis?'show':''}`}>
                    <span className="bio-p">{['▶','→','→','→','_'][i]}</span>
                    {i===4
                      ? <span className="bio-cursor"/>
                      : <span className={`bio-out ${[,'ok','ok','warn',''][i]}`}>
                          {['enlist.init()','bio-scan: ready','slot: available',
                            loading?'registering...':'awaiting recruit data',''][i]}
                        </span>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="auth-status">
              <span className="status-dot"/>
              <span className="s-ok">ONLINE</span>&nbsp;·&nbsp;
              {uptime}&nbsp;·&nbsp;<span>ENLIST PROTOCOL</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-right-corner tl"/>
          <div className="auth-right-corner br"/>
          <div className={`auth-flash ${flashActive?'active':''}`}>
            <div className="auth-flash-scan"/>
          </div>
          <div className={`auth-success ${btnState==='success'?'show':''}`}>
            <div className="auth-success-icon">✓</div>
            <div className="auth-success-text">ENLISTMENT CONFIRMED</div>
            <div className="auth-success-sub">REDIRECTING TO AUTH...</div>
          </div>

          <div className="auth-eyebrow">BIO-MASK ENLISTMENT PROTOCOL</div>
          <div className="auth-form-title">ENLIST</div>

          <form onSubmit={handleSubmit}>
            <div className="auth-fld">
              <div className="auth-fld-label"><span className="auth-fld-icon">◈</span> Operative Handle / Username</div>
              <div className="auth-input-wrap">
                <input className="auth-input" type="text" id="username" placeholder="operative_name" onChange={handleChange}/>
                <div className="auth-field-bar"/>
              </div>
            </div>
            <div className="auth-fld">
              <div className="auth-fld-label"><span className="auth-fld-icon">◈</span> Neural ID / Email</div>
              <div className="auth-input-wrap">
                <input className="auth-input" type="email" id="email" placeholder="agent@domain.com" onChange={handleChange}/>
                <div className="auth-field-bar"/>
              </div>
            </div>
            <div className="auth-fld">
              <div className="auth-fld-label"><span className="auth-fld-icon">◈</span> Bio-Key / Password</div>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={pwdVisible?'text':'password'}
                  id="password" placeholder="••••••••••••"
                  onChange={handleChange}
                />
                <button type="button" className="auth-pwd-toggle" onClick={() => setPwdVisible(v => !v)}>
                  {pwdVisible ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                  <span className="auth-pwd-toggle-lbl">{pwdVisible?'HIDE':'SHOW'}</span>
                </button>
                <div className="auth-field-bar"/>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || btnState==='loading'}
              className={`auth-submit ${btnState==='loading'?'loading':''} ${btnState==='success'?'success':''}`}
            >
              <div className="auth-btn-shimmer"/>
              {btnLabel()}
            </button>
          </form>

          <div className="auth-or">SECTOR DIVIDE</div>
          <OAuth />

          <p className="auth-foot">
            Already enlisted? <Link to="/signin">AUTHENTICATE →</Link>
          </p>

          {errorMessage && (
            <div className="auth-alert">{errorMessage}</div>
          )}
        </div>
      </div>
    </>
  )
}