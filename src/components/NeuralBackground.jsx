import { useEffect, useRef } from 'react'

export default function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let width = window.innerWidth
    let height = window.innerHeight

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark'

    const getSettings = () => {
      const mobile = window.innerWidth <= 768
      return {
        count: mobile ? 30 : 90,
        maxDist: mobile ? 120 : 150,
        opMul: mobile ? 0.5 : 1,
      }
    }
    let settings = getSettings()

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.8
        this.vy = (Math.random() - 0.5) * 0.8
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
        this.x = Math.max(0, Math.min(width, this.x))
        this.y = Math.max(0, Math.min(height, this.y))
      }
      draw() {
        const theme = getTheme()
        const col = theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      settings = getSettings()
      for (let i = 0; i < settings.count; i++) particles.push(new Particle())
    }

    const resize = () => {
      const ow = width, oh = height
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      particles.forEach(p => {
        p.x = (p.x / ow) * width
        p.y = (p.y / oh) * height
      })
      const ns = getSettings()
      if (ns.count !== settings.count) init()
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      const theme = getTheme()
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.update()
        p.draw()
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < settings.maxDist) {
            const op = (1 - d / settings.maxDist) * 0.45 * settings.opMul
            const lineCol = Math.random() > 0.92
              ? `rgba(227,6,19,${op})`
              : theme === 'light'
                ? `rgba(0,0,0,${op})`
                : `rgba(255,255,255,${op})`
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = lineCol
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    resize()
    init()
    animate()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="dashboard-background" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', opacity: 0.7 }} />
    </div>
  )
}
