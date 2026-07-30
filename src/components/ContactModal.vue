<template>
  <div
    v-show="isVisible"
    id="contact-modal"
    class="term-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="contact-modal-title"
    @click.self="hideModal"
  >
    <div class="term-modal">
      <div class="term-modal-bar">
        <h2 class="term-modal-title" id="contact-modal-title">Contact Information</h2>
        <button type="button" class="term-modal-close" aria-label="Close" @click="hideModal">
          ×
        </button>
      </div>

      <div class="term-modal-body">
        <VerificationSection
          :step="emailStep"
          message="Please complete verification to view contact information:"
          @retry="retryEmailVerification"
        >
          <div ref="turnstileContainer"></div>
          <input
            ref="honeypot"
            type="text"
            class="term-honeypot"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
        </VerificationSection>

        <template v-if="emailStep.status === 'success'">
          <ContactInfo icon="email" label="Email" :value="contactInfo?.email" />

          <ContactInfo
            v-if="contactInfo?.phone"
            icon="phone"
            label="Phone"
            :value="contactInfo.phone"
          />

          <template v-else>
            <PhoneRevealButton v-if="phoneStep.status === 'idle'" @click="startPhoneReveal" />

            <VerificationSection
              v-else
              :step="phoneStep"
              message="Additional verification required for phone access:"
              @retry="retryPhoneVerification"
            >
              <div ref="phoneTurnstileContainer"></div>
            </VerificationSection>
          </template>
        </template>
      </div>

      <div class="term-modal-foot">
        <button type="button" class="term-btn" @click="hideModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import VerificationSection from './VerificationSection.vue'
import ContactInfo from './ContactInfo.vue'
import PhoneRevealButton from './PhoneRevealButton.vue'
import {
  createRevealContactClient,
  createTurnstileWidget,
  resetTurnstileWidget
} from '../lib/contactModalHelpers'
import { globalEventBus } from '../lib/eventBus'
import { acquireScrollLock, releaseScrollLock } from '../lib/scrollLock'

interface ContactData {
  email: string
  phone?: string
}

interface VerificationStep {
  status: 'idle' | 'loading' | 'success' | 'error' | 'captcha'
  error?: string
}

// Reactive state
const isVisible = ref(false)
const contactInfo = ref<ContactData | null>(null)
const startTime = ref<number>()

// Step states
const emailStep = reactive<VerificationStep>({ status: 'captcha' })
const phoneStep = reactive<VerificationStep>({ status: 'idle' })

// Refs
const turnstileContainer = ref<HTMLElement>()
const phoneTurnstileContainer = ref<HTMLElement>()
const honeypot = ref<HTMLInputElement>()
const turnstileWidgetId = ref<string>()
const phoneTurnstileWidgetId = ref<string>()

const { getEmailInfo, getPhoneInfo } = createRevealContactClient({
  getElapsedMs: () =>
    startTime.value !== undefined ? performance.now() - startTime.value : 0,
  getHoneypotValue: () => honeypot.value?.value || ''
})

// Modal management
const showModal = async () => {
  isVisible.value = true
  acquireScrollLock()
  if (startTime.value === undefined) { startTime.value = performance.now() }
  
  // Reset all state
  contactInfo.value = null
  Object.assign(emailStep, { status: 'captcha', error: undefined })
  Object.assign(phoneStep, { status: 'idle', error: undefined })
  
  await nextTick()
  initializeTurnstile()
}

const hideModal = () => {
  isVisible.value = false
  releaseScrollLock()

  // Cleanup widgets
  resetTurnstileWidget(turnstileWidgetId.value)
  resetTurnstileWidget(phoneTurnstileWidgetId.value)
  turnstileWidgetId.value = undefined
  phoneTurnstileWidgetId.value = undefined
}

// Email verification
const initializeTurnstile = () => {
  if (!turnstileContainer.value) {
    emailStep.error = 'Security verification unavailable.'
    emailStep.status = 'error'
    return
  }

  try {
    turnstileWidgetId.value = createTurnstileWidget(
      turnstileContainer.value,
      handleEmailSuccess,
      () => {
        emailStep.error = 'Security verification failed.'
        emailStep.status = 'error'
      }
    )
  } catch (err) {
    console.error('Failed to initialize Turnstile:', err instanceof Error ? err.message : String(err))
    emailStep.error = 'Failed to load security verification.'
    emailStep.status = 'error'
  }
}

const handleEmailSuccess = async (token: string) => {
  emailStep.status = 'loading'
  emailStep.error = undefined
  
  try {
    const data = await getEmailInfo(token)
    contactInfo.value = data
    emailStep.status = 'success'
  } catch (err) {
    console.error('Email verification failed:', err instanceof Error ? err.message : String(err))
    emailStep.error = err instanceof Error ? err.message : 'Verification failed.'
    emailStep.status = 'error'
    resetTurnstileWidget(turnstileWidgetId.value)
  }
}

const retryEmailVerification = () => {
  emailStep.error = undefined
  contactInfo.value = null
  if (turnstileWidgetId.value) {
    resetTurnstileWidget(turnstileWidgetId.value)
  } else {
    initializeTurnstile()
  }
}

// Phone verification
const startPhoneReveal = async () => {
  phoneStep.status = 'captcha'
  phoneStep.error = undefined
  
  await nextTick()
  initializePhoneTurnstile()
}

const initializePhoneTurnstile = () => {
  if (!phoneTurnstileContainer.value) {
    phoneStep.error = 'Security verification unavailable.'
    phoneStep.status = 'error'
    return
  }

  try {
    phoneTurnstileWidgetId.value = createTurnstileWidget(
      phoneTurnstileContainer.value,
      handlePhoneSuccess,
      () => {
        phoneStep.error = 'Phone verification failed.'
        phoneStep.status = 'error'
      }
    )
  } catch (err) {
    console.error('Failed to initialize phone Turnstile:', err instanceof Error ? err.message : String(err))
    phoneStep.error = 'Failed to load phone verification.'
    phoneStep.status = 'error'
  }
}

const handlePhoneSuccess = async (phoneToken: string) => {
  phoneStep.status = 'loading'
  phoneStep.error = undefined
  
  try {
    const data = await getPhoneInfo(phoneToken)
    if (!contactInfo.value) {
      phoneStep.status = 'error'
      phoneStep.error = 'Session expired. Please close and reopen the contact modal.'
      return
    }
    if (data?.phone) { contactInfo.value = { ...contactInfo.value, phone: data.phone } }
    phoneStep.status = 'success'
  } catch (err) {
    console.error('Phone verification failed:', err instanceof Error ? err.message : String(err))
    phoneStep.error = err instanceof Error ? err.message : 'Phone verification failed.'
    phoneStep.status = 'error'
    resetTurnstileWidget(phoneTurnstileWidgetId.value)
  }
}

const retryPhoneVerification = () => {
  phoneStep.error = undefined
  if (phoneTurnstileWidgetId.value) {
    resetTurnstileWidget(phoneTurnstileWidgetId.value)
  } else {
    initializePhoneTurnstile()
  }
}

// Event handlers
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    hideModal()
  }
}

const handleShowContactModal = () => showModal()

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  globalEventBus.addEventListener('show-contact-modal', handleShowContactModal)
})

onUnmounted(() => {
  if (isVisible.value) {
    releaseScrollLock()
  }
  document.removeEventListener('keydown', handleKeydown)
  globalEventBus.removeEventListener('show-contact-modal', handleShowContactModal)
  resetTurnstileWidget(turnstileWidgetId.value)
  resetTurnstileWidget(phoneTurnstileWidgetId.value)
})

// Expose API
defineExpose({ showModal, hideModal })
</script>