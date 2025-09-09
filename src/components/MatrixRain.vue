<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <canvas ref="matrixCanvas" class="opacity-20"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const matrixCanvas = ref<HTMLCanvasElement>()
let animationId: number

onMounted(() => {
  const canvas = matrixCanvas.value
  if (!canvas) throw new Error('Canvas element not found')
  
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context not supported')

  // Set canvas size to match viewport
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Matrix characters
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789"
  const drops: number[] = []
  const fontSize = 16
  const columns = canvas.width / fontSize

  // Initialize drops
  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }

  // Get theme color based on dark mode
  const getThemeColor = () => {
    return document.documentElement.classList.contains('dark') ? 
      'rgba(168, 85, 247, 0.8)' : // Purple in dark mode
      'rgba(147, 51, 234, 0.9)'   // Darker purple in light mode
  }

  // Drawing animation
  function draw() {
    if (!ctx || !canvas) return
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = getThemeColor()
    ctx.font = fontSize + 'px monospace'

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
        drops[i] = 0
      
      drops[i]++
    }

    animationId = requestAnimationFrame(draw)
  }

  // Start animation
  draw()

  // Update color when theme changes
  const observer = new MutationObserver(() => {
    if (ctx) {
      ctx.fillStyle = getThemeColor()
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  // Cleanup function
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
    observer.disconnect()
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  })
})
</script>
