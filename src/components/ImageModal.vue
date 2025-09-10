<template>
  <div
    v-show="isVisible"
    id="image-modal"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
      <div
        class="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        @click="hideModal"
      ></div>

      <!-- Modal container -->
      <div class="relative inline-block align-middle max-w-4xl w-full mx-4">
        <!-- Close button -->
        <button
          @click="hideModal"
          class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Image -->
        <img
          v-if="currentImage"
          :src="currentImage.src"
          :alt="currentImage.alt"
          class="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        
        <!-- Caption -->
        <div v-if="currentImage?.caption" class="mt-4 text-center">
          <p class="text-white text-lg font-medium">{{ currentImage.caption }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Types
interface ImageData {
  src: string
  alt: string
  caption?: string
}

// Reactive state
const isVisible = ref(false)
const currentImage = ref<ImageData | null>(null)

// Modal management
const showModal = (image: ImageData) => {
  currentImage.value = image
  isVisible.value = true
  document.body.style.overflow = 'hidden'
}

const hideModal = () => {
  isVisible.value = false
  document.body.style.overflow = ''
  currentImage.value = null
}

// Event handlers
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    hideModal()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Expose the showModal function globally
  ;(window as any).showImageModal = showModal
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  
  if ((window as any).showImageModal) {
    delete (window as any).showImageModal
  }
})

// Expose API
defineExpose({ showModal, hideModal })
</script>
