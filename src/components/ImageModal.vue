<template>
  <div
    v-show="isVisible"
    id="image-modal"
    class="term-overlay"
    role="dialog"
    aria-modal="true"
    :aria-label="currentImage?.caption ?? 'Image'"
    @click.self="hideModal"
  >
    <div class="term-modal term-modal--bare">
      <div class="term-modal-bar" style="width:100%;max-width:100%">
        <p class="term-modal-title">{{ currentImage?.caption ?? 'Image' }}</p>
        <button type="button" class="term-modal-close" aria-label="Close" @click="hideModal">
          ×
        </button>
      </div>

      <img
        v-if="currentImage"
        class="term-lightbox-img"
        :src="currentImage.src"
        :alt="currentImage.alt"
      />

      <p v-if="currentImage?.caption" class="term-lightbox-caption">
        {{ currentImage.caption }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { acquireScrollLock, releaseScrollLock } from '../lib/scrollLock'

interface ImageData {
  src: string
  alt: string
  caption?: string
}

const isVisible = ref(false)
const currentImage = ref<ImageData | null>(null)

// Only allow relative paths (same-origin assets); block absolute URLs,
// protocol-relative URLs, data: URIs, and javascript: URIs.
const isTrustedImageSrc = (src: string): boolean =>
  typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')

const showModal = (image: ImageData) => {
  if (!isTrustedImageSrc(image?.src)) return
  currentImage.value = image
  isVisible.value = true
  acquireScrollLock()
}

const hideModal = () => {
  isVisible.value = false
  releaseScrollLock()
  currentImage.value = null
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) hideModal()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.showImageModal = showModal
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  if (isVisible.value) releaseScrollLock()

  if (window.showImageModal) delete window.showImageModal
})

defineExpose({ showModal, hideModal })
</script>
