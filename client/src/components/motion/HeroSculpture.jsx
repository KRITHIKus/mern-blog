import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * "The Lattice" — A2D's signature object.
 * A subdivided icosahedron drawn as a node-and-edge lattice, with a handful
 * of its faces split off as coloured planes. Scrolling the hero away
 * reassembles the fragments; the pointer tilts the whole sculpture.
 *
 * Performance: renders on demand (only while something is easing), pauses
 * off-screen / in background tabs, caps DPR, and uses a lighter build on
 * touch devices. Reduced motion → a single static frame.
 * Colours come from CSS tokens and follow the theme.
 */

const readColors = () => {
  const css = getComputedStyle(document.documentElement)
  const get = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    ink: new THREE.Color(get('--color-text-primary', '#eeeae1')),
    accent: new THREE.Color(get('--color-accent', '#8c93ff')),
    accent2: new THREE.Color(get('--color-accent-2', '#ff7352')),
    muted: new THREE.Color(get('--color-text-muted', '#8f8b83')),
    dark: document.documentElement.dataset.theme !== 'light',
  }
}

// Deterministic pseudo-random so the sculpture looks the same on every load.
const seeded = seed => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export default function HeroSculpture({ className }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const media = query => window.matchMedia?.(query).matches
    const reducedMotion = media('(prefers-reduced-motion: reduce)')
    const finePointer = media('(hover: hover) and (pointer: fine)')
    const lite = !finePointer || media('(max-width: 767px)')

    // ── Renderer / scene ─────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    const sculpture = new THREE.Group()
    scene.add(sculpture)

    // ── Lattice: nodes + edges of a subdivided icosahedron ────────
    const RADIUS = 2.25
    const base = new THREE.IcosahedronGeometry(RADIUS, lite ? 1 : 2)
    const edges = new THREE.EdgesGeometry(base, 1)
    const edgeMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.32 })
    const lattice = new THREE.LineSegments(edges, edgeMaterial)
    sculpture.add(lattice)

    // unique vertices → nodes
    const pos = base.getAttribute('position')
    const seen = new Map()
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`
      if (!seen.has(key)) seen.set(key, new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)))
    }
    const nodePositions = new Float32Array([...seen.values()].flatMap(v => [v.x, v.y, v.z]))
    const nodeGeometry = new THREE.BufferGeometry()
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
    const nodeMaterial = new THREE.PointsMaterial({ size: lite ? 0.07 : 0.06, transparent: true, opacity: 0.95, sizeAttenuation: true })
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial)
    sculpture.add(nodes)

    // ── Fragments: selected faces lifted off the surface ──────────
    const random = seeded(2024)
    const faceCount = pos.count / 3
    const fragmentCount = lite ? 7 : 10
    const fragments = []
    const fragmentMaterials = []
    const used = new Set()
    while (fragments.length < fragmentCount) {
      const face = Math.floor(random() * faceCount)
      if (used.has(face)) continue
      used.add(face)
      const a = new THREE.Vector3().fromBufferAttribute(pos, face * 3)
      const b = new THREE.Vector3().fromBufferAttribute(pos, face * 3 + 1)
      const c = new THREE.Vector3().fromBufferAttribute(pos, face * 3 + 2)
      const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3)
      const shard = 0.8 // fragments are slightly smaller than the faces they left
      const geometry = new THREE.BufferGeometry().setFromPoints([a.sub(center).multiplyScalar(shard), b.sub(center).multiplyScalar(shard), c.sub(center).multiplyScalar(shard)])
      geometry.setIndex([0, 1, 2])
      const isWarm = fragments.length % 7 === 3
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: isWarm ? 0.8 : 0.42,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      material.userData.warm = isWarm
      const mesh = new THREE.Mesh(geometry, material)
      const normal = center.clone().normalize()
      mesh.userData = { home: center.clone(), normal, distance: 0.35 + random() * 0.75, spin: (random() - 0.5) * 1.2 }
      mesh.position.copy(center)
      sculpture.add(mesh)
      fragments.push(mesh)
      fragmentMaterials.push(material)
    }

    // ── Core + orbit: architectural counterpoint ──────────────────
    const coreMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 })
    const core = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.8)), coreMaterial)
    sculpture.add(core)

    const orbitPoints = new THREE.EllipseCurve(0, 0, 3.35, 3.35).getPoints(160).map(p => new THREE.Vector3(p.x, p.y, 0))
    const orbitMaterial = new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.12, transparent: true, opacity: 0.45 })
    const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial)
    orbit.computeLineDistances()
    orbit.rotation.set(Math.PI / 2.35, 0.25, 0)
    scene.add(orbit)

    const applyColors = () => {
      const c = readColors()
      edgeMaterial.color.copy(c.ink)
      edgeMaterial.opacity = c.dark ? 0.26 : 0.3
      nodeMaterial.color.copy(c.ink)
      coreMaterial.color.copy(c.accent2)
      orbitMaterial.color.copy(c.muted)
      fragmentMaterials.forEach(m => m.color.copy(m.userData.warm ? c.accent2 : c.accent))
    }
    applyColors()

    // ── State ─────────────────────────────────────────────────────
    const state = {
      rotX: 0.35, rotY: -0.5,           // current
      targetX: 0.35, targetY: -0.5,     // pointer target
      explode: 1, targetExplode: 1,     // 1 = fragments out, 0 = assembled
      drift: 0,
      visible: true,
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // keep the sculpture comfortably inside narrow/tall frames, and set it
      // off to the right of wide frames so the headline has room
      camera.position.z = w / h < 1 ? 9 / Math.max(w / h, 0.62) : 9
      sculpture.position.x = orbit.position.x = w / h > 1.15 ? 0.85 : 0
      camera.updateProjectionMatrix()
      requestRender()
    }

    const place = () => {
      sculpture.rotation.set(state.rotX, state.rotY + state.drift, 0)
      fragments.forEach(mesh => {
        const { home, normal, distance, spin } = mesh.userData
        mesh.position.copy(home).addScaledVector(normal, distance * state.explode)
        mesh.rotation.set(spin * state.explode, spin * 0.6 * state.explode, 0)
      })
      core.rotation.set(-state.rotX * 1.4, -(state.rotY + state.drift) * 1.8, 0)
      orbit.rotation.z = (state.rotY + state.drift) * 0.35
      renderer.render(scene, camera)
    }

    // ── On-demand render loop ─────────────────────────────────────
    let frame = 0
    let last = performance.now()
    const animate = now => {
      frame = 0
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const ease = 1 - Math.pow(0.0015, dt) // frame-rate independent smoothing
      state.rotX += (state.targetX - state.rotX) * ease
      state.rotY += (state.targetY - state.rotY) * ease
      state.explode += (state.targetExplode - state.explode) * ease
      const drifting = !reducedMotion && !lite && state.visible
      if (drifting) state.drift += dt * 0.05 // very slow ambient turn
      place()
      const settling =
        Math.abs(state.targetX - state.rotX) > 0.0005 ||
        Math.abs(state.targetY - state.rotY) > 0.0005 ||
        Math.abs(state.targetExplode - state.explode) > 0.001
      if ((settling || drifting) && state.visible && !document.hidden) frame = requestAnimationFrame(animate)
    }
    function requestRender() {
      if (reducedMotion) { place(); return }
      if (!frame && state.visible && !document.hidden) {
        last = performance.now()
        frame = requestAnimationFrame(animate)
      }
    }

    // ── Inputs ────────────────────────────────────────────────────
    const onPointerMove = event => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      state.targetY = -0.5 + nx * 0.9
      state.targetX = 0.35 + ny * 0.6
      requestRender()
    }
    const onScroll = () => {
      const rect = mount.getBoundingClientRect()
      const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1)
      state.targetExplode = 1 - Math.min(progress * 1.6, 1)
      requestRender()
    }

    const visibility = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting
      if (state.visible) requestRender()
    })
    visibility.observe(mount)

    const themeObserver = new MutationObserver(() => { applyColors(); requestRender(); if (reducedMotion) place() })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    const onVisibilityChange = () => { if (!document.hidden) requestRender() }

    if (reducedMotion) {
      state.explode = state.targetExplode = 0.55
    } else {
      if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      document.addEventListener('visibilitychange', onVisibilityChange)
      // entrance: fragments settle in from further out
      state.explode = 1.35
    }
    resize()
    onScroll()
    requestRender()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      visibility.disconnect()
      themeObserver.disconnect()
      resizeObserver.disconnect()
      scene.traverse(obj => {
        obj.geometry?.dispose()
        obj.material?.dispose()
      })
      base.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}
