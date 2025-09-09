<template>
  <div :class="[fontSize, 'mb-8 leading-relaxed animate-fade-in-delay font-mono', { 'crt-effect': crt, 'crt-light-mode': crt && isLightMode }, crt ? '' : color]">
    <span ref="textElement"></span><span ref="cursorElement" class="typewriter-cursor">█</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TextItem {
  text: string
  duration?: number // duration in seconds, defaults to 3 if not specified
}

interface Props {
  texts?: TextItem[] | string // array of text objects or single string for backwards compatibility
  speed?: number
  delay?: number
  fontSize?: string
  color?: string
  cursorType?: 'blinking' | 'breathing' | 'breathing-alt'
  crt?: boolean
  startDelay?: number
  backspaceSpeed?: number // speed for backspacing animation
}

const props = withDefaults(defineProps<Props>(), {
  texts: 'TYPEWRITER TEXT',
  speed: 100,
  delay: 800,
  fontSize: 'text-xl md:text-2xl',
  color: 'text-gray-600 dark:text-gray-300',
  cursorType: 'blinking',
  crt: false,
  startDelay: 0,
  backspaceSpeed: 50
})

const textElement = ref<HTMLSpanElement>()
const cursorElement = ref<HTMLSpanElement>()
const isLightMode = ref(false)

// State management for cycling through texts
const currentTextIndex = ref(0)
const currentCharIndex = ref(0)
const isTyping = ref(false)
const isBackspacing = ref(false)
const timeoutId = ref<number | null>(null)

// Convert texts prop to consistent format
const textItems = ref<TextItem[]>([])

// Initialize textItems based on props
const initializeTexts = () => {
  if (Array.isArray(props.texts)) {
    textItems.value = props.texts.map(item => ({
      text: item.text,
      duration: item.duration || 3 // default 3 seconds
    }))
  } else {
    textItems.value = [{
      text: props.texts || 'TYPEWRITER TEXT',
      duration: 3
    }]
  }
}

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
  
  // Initialize texts array
  initializeTexts()
  
  // Initially show cursor in finished state (blinking)
  setCursorToFinished()
  
  // Start the typing cycle after delays
  const totalDelay = props.delay + (props.startDelay * 1000)
  setTimeout(startTypingCycle, totalDelay)
})

// Set cursor to finished state
const setCursorToFinished = () => {
  if (!cursorElement.value) return
  
  cursorElement.value.classList.remove('typing', 'breathing', 'breathing-alt')
  if (props.cursorType === 'breathing') {
    cursorElement.value.classList.add('finished-breathing')
  } else if (props.cursorType === 'breathing-alt') {
    cursorElement.value.classList.add('finished-breathing-alt')
  } else {
    cursorElement.value.classList.add('finished')
  }
}

// Set cursor to typing state
const setCursorToTyping = () => {
  if (!cursorElement.value) return
  
  cursorElement.value.classList.remove('finished', 'finished-breathing', 'finished-breathing-alt')
  cursorElement.value.classList.add('typing')
  if (props.cursorType === 'breathing') {
    cursorElement.value.classList.add('breathing')
  } else if (props.cursorType === 'breathing-alt') {
    cursorElement.value.classList.add('breathing-alt')
  }
}

// Start the main typing cycle
const startTypingCycle = () => {
  if (textItems.value.length === 0) return
  typeCurrentText()
}

// Type the current text
const typeCurrentText = () => {
  if (!textElement.value || isBackspacing.value) return
  
  isTyping.value = true
  setCursorToTyping()
  currentCharIndex.value = 0
  textElement.value.textContent = ''
  
  typeNextCharacter()
}

// Type next character
const typeNextCharacter = () => {
  if (!textElement.value || !isTyping.value) return
  
  const currentText = textItems.value[currentTextIndex.value]?.text || ''
  
  if (currentCharIndex.value < currentText.length) {
    textElement.value.textContent += currentText.charAt(currentCharIndex.value)
    currentCharIndex.value++
    timeoutId.value = setTimeout(typeNextCharacter, props.speed) as unknown as number
  } else {
    // Finished typing current text
    isTyping.value = false
    setCursorToFinished()
    
    // Wait for duration before starting backspace
    const duration = textItems.value[currentTextIndex.value]?.duration || 3
    timeoutId.value = setTimeout(startBackspace, duration * 1000) as unknown as number
  }
}

// Start backspace animation
const startBackspace = () => {
  if (!textElement.value || isTyping.value) return
  
  isBackspacing.value = true
  setCursorToTyping()
  
  backspaceNextCharacter()
}

// Backspace next character
const backspaceNextCharacter = () => {
  if (!textElement.value || !isBackspacing.value) return
  
  const currentText = textElement.value.textContent || ''
  
  if (currentText.length > 0) {
    textElement.value.textContent = currentText.slice(0, -1)
    timeoutId.value = setTimeout(backspaceNextCharacter, props.backspaceSpeed) as unknown as number
  } else {
    // Finished backspacing
    isBackspacing.value = false
    
    // Move to next text (cycle back to beginning if at end)
    currentTextIndex.value = (currentTextIndex.value + 1) % textItems.value.length
    
    // Start typing next text after a brief pause
    timeoutId.value = setTimeout(typeCurrentText, 200) as unknown as number
  }
}

onUnmounted(() => {
  // Cleanup timeouts
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  
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
