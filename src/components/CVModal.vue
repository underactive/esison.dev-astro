<template>
  <div
    v-show="isVisible"
    id="cv-modal"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        @click="hideModal"
      ></div>

      <!-- Modal container -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="relative inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-white mb-6" id="modal-title">
                My Curriculum Vitae
              </h3>
              
              <!-- CV Content -->
              <div class="space-y-4 text-gray-300 leading-relaxed mb-6">
                <p>
                  I'm gainfully employed at my current company, so the urgency to update my CV is not <i>yet</i> there.
                </p>
                <p>
                  That said, I'm always looking for new opportunities to grow and learn, so feel free to 
                  <button
                    @click="openContactModal"
                    class="text-purple-400 hover:text-purple-300 underline decoration-2 underline-offset-2 hover:decoration-purple-300 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1"
                  >
                    reach out to me
                  </button>
                   if you think I'd be a good fit for your team!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            @click="hideModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import { globalEventBus } from '../lib/eventBus'
import { acquireScrollLock, releaseScrollLock } from '../lib/scrollLock'

// Reactive state
const isVisible = ref(false)

// Modal management
const showModal = () => {
  isVisible.value = true
  acquireScrollLock()
}

const hideModal = () => {
  isVisible.value = false
  releaseScrollLock()
}

// Open contact modal
const openContactModal = () => {
  hideModal()
  globalEventBus.dispatchEvent(new Event('show-contact-modal'))
}

// Event handlers
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    hideModal()
  }
}

const handleShowCVModal = () => showModal()

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  globalEventBus.addEventListener('show-cv-modal', handleShowCVModal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  globalEventBus.removeEventListener('show-cv-modal', handleShowCVModal)

  if (isVisible.value) {
    releaseScrollLock()
  }
})

// Expose API
defineExpose({ showModal, hideModal })
</script>
