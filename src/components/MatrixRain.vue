<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <canvas ref="matrixCanvas" class="opacity-20"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const matrixCanvas = ref<HTMLCanvasElement>()
let animationId: number | undefined
let observer: MutationObserver | undefined
let resizeCleanup: (() => void) | undefined
let visibilityCleanup: (() => void) | undefined

onMounted(() => {
  const canvas = matrixCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Matrix characters
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789"
  const drops: number[] = []
  const fontSize = 16

  // Set canvas size to match viewport and recompute columns
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const newColumns = Math.floor(canvas.width / fontSize)
    for (let i = drops.length; i < newColumns; i++) drops[i] = 1
    drops.length = newColumns
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  resizeCleanup = () => window.removeEventListener('resize', resizeCanvas)

  // Get theme color based on dark mode
  const getThemeColor = () => {
    return document.documentElement.classList.contains('dark') ? 
      'rgba(168, 85, 247, 0.8)' : // Purple in dark mode
      'rgba(147, 51, 234, 0.9)'   // Darker purple in light mode
  }

  let themeColor = getThemeColor()

  // Drawing animation throttled to ~24fps
  const frameInterval = 1000 / 24
  let lastFrameTime = 0

  function draw(timestamp: number = 0) {
    if (!ctx || !canvas) return

    animationId = requestAnimationFrame(draw)

    const elapsed = timestamp - lastFrameTime
    if (elapsed < frameInterval) return
    lastFrameTime = timestamp - (elapsed % frameInterval)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = themeColor
    ctx.font = fontSize + 'px monospace'

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)

      // ~2.5% chance per frame to reset the drop, producing staggered column resets
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
        drops[i] = 0

      drops[i]++
    }
  }

  // Start animation
  draw()

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId)
      animationId = undefined
    } else {
      draw()
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  visibilityCleanup = () => document.removeEventListener('visibilitychange', onVisibilityChange)

  // Update color when theme changes
  observer = new MutationObserver(() => {
    themeColor = getThemeColor()
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

})

onUnmounted(() => {
  if (resizeCleanup) resizeCleanup()
  if (visibilityCleanup) visibilityCleanup()
  if (observer) observer.disconnect()
  if (animationId) cancelAnimationFrame(animationId)
})
</script>
