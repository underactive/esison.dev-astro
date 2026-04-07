<template>
  <div
    v-show="isVisible"
    id="contact-modal"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        @click="hideModal"
      ></div>

      <!-- Modal container -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
                Contact Information
              </h3>
              
              <!-- Email Verification Section -->
              <VerificationSection
                :step="emailStep"
                message="Please complete verification to view contact information:"
                @retry="retryEmailVerification"
              >
                <div ref="turnstileContainer" class="flex justify-center"></div>
                <input 
                  ref="honeypot" 
                  type="text" 
                  class="absolute -left-9999px opacity-0" 
                  tabindex="-1" 
                  autocomplete="off"
                />
              </VerificationSection>

              <!-- Contact Info Display -->
              <div v-if="emailStep.status === 'success'" class="mt-4 space-y-4">
                <ContactInfo 
                  icon="email"
                  label="Email"
                  :value="contactInfo?.email"
                />
                
                <!-- Phone Section -->
                <div class="border-t border-gray-700 pt-4">
                  <ContactInfo 
                    v-if="contactInfo?.phone"
                    icon="phone"
                    label="Phone"
                    :value="contactInfo.phone"
                  />
                  
                  <!-- Phone Reveal Process -->
                  <template v-else>
                    <PhoneRevealButton 
                      v-if="phoneStep.status === 'idle'"
                      @click="startPhoneReveal"
                    />
                    
                    <VerificationSection
                      v-else
                      :step="phoneStep"
                      message="Additional verification required for phone access:"
                      @retry="retryPhoneVerification"
                    >
                      <div ref="phoneTurnstileContainer" class="flex justify-center"></div>
                    </VerificationSection>
                  </template>
                </div>
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
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import VerificationSection from './VerificationSection.vue'
import ContactInfo from './ContactInfo.vue'
import PhoneRevealButton from './PhoneRevealButton.vue'
import {
  createRevealContactClient,
  createTurnstileWidget,
  resetTurnstileWidget
} from '../lib/contactModalHelpers'

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
  document.body.style.overflow = 'hidden'
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
  document.body.style.overflow = ''
  
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
  window.addEventListener('show-contact-modal', handleShowContactModal)
  ;(window as any).showContactModal = showModal
})

onUnmounted(() => {
  if (isVisible.value) {
    document.body.style.overflow = ''
  }
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('show-contact-modal', handleShowContactModal)
  resetTurnstileWidget(turnstileWidgetId.value)
  resetTurnstileWidget(phoneTurnstileWidgetId.value)

  if ((window as any).showContactModal) {
    delete (window as any).showContactModal
  }
})

// Expose API
defineExpose({ showModal, hideModal })
</script>