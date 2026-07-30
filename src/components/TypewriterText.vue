<template>
  <div class="term-typewriter" :data-cursor="cursorType">
    <span ref="textElement"></span><span ref="cursorElement" class="term-caret">█</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface TextItem {
  text: string
  /** Seconds to hold the completed line before backspacing it. */
  duration?: number
}

interface Props {
  texts?: TextItem[] | string
  speed?: number
  delay?: number
  cursorType?: 'blinking' | 'breathing' | 'breathing-alt'
  startDelay?: number
  backspaceSpeed?: number
}

const props = withDefaults(defineProps<Props>(), {
  texts: 'TYPEWRITER TEXT',
  speed: 100,
  delay: 800,
  cursorType: 'blinking',
  startDelay: 0,
  backspaceSpeed: 50,
})

const DEFAULT_HOLD_SECONDS = 3

const textElement = ref<HTMLSpanElement>()
const cursorElement = ref<HTMLSpanElement>()

const currentTextIndex = ref(0)
const currentCharIndex = ref(0)
const isTyping = ref(false)
const isBackspacing = ref(false)
const pendingTimeouts = new Set<number>()

const scheduleTimeout = (cb: () => void, delay: number) => {
  const id = setTimeout(() => {
    pendingTimeouts.delete(id as unknown as number)
    cb()
  }, delay) as unknown as number
  pendingTimeouts.add(id)
}

const textItems = ref<TextItem[]>([])

const initializeTexts = () => {
  textItems.value = Array.isArray(props.texts)
    ? props.texts.map((item) => ({ text: item.text, duration: item.duration || DEFAULT_HOLD_SECONDS }))
    : [{ text: props.texts || 'TYPEWRITER TEXT', duration: DEFAULT_HOLD_SECONDS }]
}

const setCursorState = (state: 'typing' | 'idle') => {
  cursorElement.value?.setAttribute('data-state', state)
}

const typeNextCharacter = () => {
  if (!textElement.value || !isTyping.value) return

  const currentText = textItems.value[currentTextIndex.value]?.text || ''

  if (currentCharIndex.value < currentText.length) {
    currentCharIndex.value++
    const textToSet = currentText.slice(0, currentCharIndex.value)
    requestAnimationFrame(() => {
      if (textElement.value) textElement.value.textContent = textToSet
    })
    scheduleTimeout(typeNextCharacter, props.speed)
    return
  }

  isTyping.value = false
  setCursorState('idle')
  const hold = textItems.value[currentTextIndex.value]?.duration || DEFAULT_HOLD_SECONDS
  scheduleTimeout(startBackspace, hold * 1000)
}

const typeCurrentText = () => {
  if (!textElement.value || isBackspacing.value) return

  isTyping.value = true
  setCursorState('typing')
  currentCharIndex.value = 0
  requestAnimationFrame(() => {
    if (textElement.value) textElement.value.textContent = ''
  })

  typeNextCharacter()
}

const backspaceNextCharacter = () => {
  if (!textElement.value || !isBackspacing.value) return

  if (currentCharIndex.value > 0) {
    currentCharIndex.value--
    const currentText = textItems.value[currentTextIndex.value]?.text || ''
    const textToSet = currentText.slice(0, currentCharIndex.value)
    requestAnimationFrame(() => {
      if (textElement.value) textElement.value.textContent = textToSet
    })
    scheduleTimeout(backspaceNextCharacter, props.backspaceSpeed)
    return
  }

  isBackspacing.value = false
  currentTextIndex.value = (currentTextIndex.value + 1) % textItems.value.length
  scheduleTimeout(typeCurrentText, 200)
}

const startBackspace = () => {
  if (!textElement.value || isTyping.value) return

  isBackspacing.value = true
  setCursorState('typing')
  backspaceNextCharacter()
}

onMounted(() => {
  if (!textElement.value || !cursorElement.value) return

  initializeTexts()
  setCursorState('idle')

  // Cycling text is motion. Honour the OS preference by showing the first line
  // as static text instead.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    textElement.value.textContent = textItems.value[0]?.text ?? ''
    return
  }

  scheduleTimeout(typeCurrentText, props.delay + props.startDelay * 1000)
})

onUnmounted(() => {
  for (const id of pendingTimeouts) clearTimeout(id)
  pendingTimeouts.clear()
})
</script>

<style scoped>
.term-typewriter {
  font-family: var(--term-font);
  font-size: clamp(0.85rem, 2.4vw, 1rem);
  line-height: 1.7;
  min-height: 1.7em;
  color: var(--term-fg);
  text-shadow:
    0 0 4px var(--term-glow),
    0 0 10px var(--term-glow-soft);
  animation: term-vhold 8s infinite;
}

.term-caret {
  padding-left: 2px;
  animation: term-caret-idle 1s step-end infinite;
}

.term-caret[data-state='typing'] {
  animation: term-caret-typing 1s ease-in-out infinite;
}

[data-cursor='breathing'] .term-caret {
  animation: term-caret-breathing 2s ease-in-out infinite;
}

[data-cursor='breathing-alt'] .term-caret {
  animation: term-caret-breathing-alt 1s ease-in-out infinite;
}

[data-cursor='breathing'] .term-caret[data-state='typing'],
[data-cursor='breathing-alt'] .term-caret[data-state='typing'] {
  animation: term-caret-typing 0.75s ease-in-out infinite;
}

@keyframes term-caret-idle {
  50% { opacity: 0; }
}

@keyframes term-caret-typing {
  0% { opacity: 1; }
  50% { opacity: 0.35; }
  100% { opacity: 1; }
}

@keyframes term-caret-breathing {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}

@keyframes term-caret-breathing-alt {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* Occasional vertical-hold slip, like a CRT losing sync. */
@keyframes term-vhold {
  0%, 98% { transform: translateY(0); }
  98.5% { transform: translateY(-2px); }
  99% { transform: translateY(1px); }
  99.5% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .term-typewriter { animation: none; }
  .term-caret { animation: none; }
}
</style>
