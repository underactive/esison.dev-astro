<template>
  <div :class="[fontSize, 'mb-8 leading-relaxed animate-fade-in-delay font-mono', { 'crt-effect': crt, 'crt-light-mode': crt && isLightMode }, crt ? '' : color]">
    <span ref="textElement"></span><span ref="cursorElement" class="typewriter-cursor">█</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  text?: string
  speed?: number
  delay?: number
  fontSize?: string
  color?: string
  cursorType?: 'blinking' | 'breathing' | 'breathing-alt'
  crt?: boolean
  startDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: 'TYPEWRITER TEXT',
  speed: 100,
  delay: 800,
  fontSize: 'text-xl md:text-2xl',
  color: 'text-gray-600 dark:text-gray-300',
  cursorType: 'blinking',
  crt: false,
  startDelay: 0
})

const textElement = ref<HTMLSpanElement>()
const cursorElement = ref<HTMLSpanElement>()
const isLightMode = ref(false)

// Function to check theme
const checkTheme = () => {
  if (typeof window !== 'undefined') {
    isLightMode.value = !document.documentElement.classList.contains('dark')
  }
}

onMounted(() => {
  // Initial theme check
  checkTheme()
  
  // Listen for theme changes
  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  
  // Store observer for cleanup
  ;(window as any).__themeObserver = observer
  
  if (!textElement.value || !cursorElement.value) return
  
  let i = 0
  
  // Initially show cursor in finished state (blinking)
  if (props.cursorType === 'breathing') {
    cursorElement.value.classList.add('finished-breathing')
  } else if (props.cursorType === 'breathing-alt') {
    cursorElement.value.classList.add('finished-breathing-alt')
  } else {
    cursorElement.value.classList.add('finished')
  }
  
  function startTyping() {
    if (!cursorElement.value) return
    
    // Switch to typing animation
    cursorElement.value.classList.remove('finished', 'finished-breathing', 'finished-breathing-alt')
    cursorElement.value.classList.add('typing')
    if (props.cursorType === 'breathing') {
      cursorElement.value.classList.add('breathing')
    } else if (props.cursorType === 'breathing-alt') {
      cursorElement.value.classList.add('breathing-alt')
    }
    
    // Start typing
    typeWriter()
  }
  
  function typeWriter() {
    if (!textElement.value || !cursorElement.value) return
    
    if (i < props.text.length) {
      textElement.value.textContent += props.text.charAt(i)
      i++
      setTimeout(typeWriter, props.speed)
    } else {
      // Finished typing, switch cursor animation
      cursorElement.value.classList.remove('typing', 'breathing', 'breathing-alt')
      if (props.cursorType === 'breathing') {
        cursorElement.value.classList.add('finished-breathing')
      } else if (props.cursorType === 'breathing-alt') {
        cursorElement.value.classList.add('finished-breathing-alt')
      } else {
        cursorElement.value.classList.add('finished')
      }
    }
  }
  
  // Start typing after delays (fade-in + startDelay)
  const totalDelay = props.delay + (props.startDelay * 1000)
  setTimeout(startTyping, totalDelay)
})

onUnmounted(() => {
  // Cleanup theme observer
  if (typeof window !== 'undefined' && (window as any).__themeObserver) {
    ;(window as any).__themeObserver.disconnect()
    delete (window as any).__themeObserver
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-delay {
  animation: fade-in 1s ease-out 0.3s both;
}

.typewriter-cursor {
  animation: cursor-fade 1.5s ease-in-out infinite;
  padding-left: 2px;
}

.typewriter-cursor.typing {
  animation: cursor-fade-typing 1s ease-in-out infinite;
}

.typewriter-cursor.typing.breathing {
  animation: cursor-breathing-typing 1.5s ease-in-out infinite;
}

.typewriter-cursor.typing.breathing-alt {
  animation: cursor-breathing-alt-typing 0.75s ease-in-out infinite;
}

.typewriter-cursor.finished {
  animation: cursor-blink 1s ease-in-out infinite;
}

.typewriter-cursor.finished-breathing {
  animation: cursor-breathing 2s ease-in-out infinite;
}

.typewriter-cursor.finished-breathing-alt {
  animation: cursor-breathing-alt 1s ease-in-out infinite;
}

@keyframes cursor-fade {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes cursor-fade-typing {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes cursor-breathing {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}

@keyframes cursor-breathing-typing {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

@keyframes cursor-breathing-alt {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}

@keyframes cursor-breathing-alt-typing {
  0% { opacity: 1; }
  100% { opacity: 0.4; }
}

/* CRT Effect Styles */
.crt-effect {
  position: relative;
  display: inline-block;
  overflow: hidden;
  color: #00ff41;
  text-shadow: 
    0 0 3px #00ff41,
    0 0 6px #00ff41;
  animation: vhold-instability 8s infinite;
}

/* Light mode CRT background and scanlines */
.crt-light-mode {
  background: #0a0a0a;
  padding: 20px;
  border-radius: 8px;
}

.crt-light-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 65, 0.03) 2px,
    rgba(0, 255, 65, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.crt-effect span {
  position: relative;
  z-index: 3;
}

@keyframes vhold-instability {
  0% { transform: translateY(0); }
  98% { transform: translateY(0); }
  98.5% { transform: translateY(-2px); }
  99% { transform: translateY(1px); }
  99.5% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}

</style>
