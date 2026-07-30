<template>
  <div
    v-show="isVisible"
    id="cv-modal"
    class="term-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cv-modal-title"
    @click.self="hideModal"
  >
    <div class="term-modal">
      <div class="term-modal-bar">
        <h2 class="term-modal-title" id="cv-modal-title">{{ copy.title }}</h2>
        <button type="button" class="term-modal-close" aria-label="Close" @click="hideModal">
          ×
        </button>
      </div>

      <!-- Body stays inline rather than mapping copy.body: the second paragraph
           embeds a button that opens the contact modal, which plain strings in
           site-content.ts cannot express. -->
      <div class="term-modal-body">
        <p>
          I’m gainfully employed at my current company, so the urgency to update my CV is not
          <em>yet</em> there.
        </p>
        <p>
          That said, I’m always looking for new opportunities to grow and learn, so feel free to
          <button type="button" class="term-inline-btn" @click="openContactModal">
            reach out to me
          </button>
          if you think I’d be a good fit for your team!
        </p>
      </div>

      <div class="term-modal-foot">
        <button type="button" class="term-btn" @click="hideModal">
          {{ copy.primaryAction }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { globalEventBus } from '../lib/eventBus'
import { acquireScrollLock, releaseScrollLock } from '../lib/scrollLock'
import { siteContent } from '../data/site-content'

const copy = siteContent.shared.modals.find((modal) => modal.id === 'cv')!

const isVisible = ref(false)

const showModal = () => {
  isVisible.value = true
  acquireScrollLock()
}

const hideModal = () => {
  isVisible.value = false
  releaseScrollLock()
}

const openContactModal = () => {
  hideModal()
  globalEventBus.dispatchEvent(new Event('show-contact-modal'))
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) hideModal()
}

const handleShowCVModal = () => showModal()

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  globalEventBus.addEventListener('show-cv-modal', handleShowCVModal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  globalEventBus.removeEventListener('show-cv-modal', handleShowCVModal)

  if (isVisible.value) releaseScrollLock()
})

defineExpose({ showModal, hideModal })
</script>
