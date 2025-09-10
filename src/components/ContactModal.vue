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
import { ref, onMounted, onUnmounted, nextTick, reactive, defineComponent, h } from 'vue'

// Types
interface ContactInfo {
  email: string
  phone?: string
}

interface VerificationStep {
  status: 'idle' | 'loading' | 'success' | 'error' | 'captcha'
  error?: string
}

// Global Turnstile interface
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'error-callback'?: () => void
        theme?: 'light' | 'dark'
        size?: 'normal' | 'compact'
      }) => string
      reset: (widgetId?: string) => void
    }
  }
}

// Reactive state
const isVisible = ref(false)
const contactInfo = ref<ContactInfo | null>(null)
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

// Composable: Turnstile Management
const useTurnstile = () => {
  const getSiteKey = () => {
    const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY
    return siteKey || '1x00000000000000000000AA' // Fallback for development
  }

  const createWidget = (
    container: HTMLElement,
    callback: (token: string) => void,
    errorCallback: () => void
  ) => {
    if (!window.turnstile) throw new Error('Turnstile not available')

    return window.turnstile.render(container, {
      sitekey: getSiteKey(),
      callback,
      'error-callback': errorCallback,
      theme: 'dark',
      size: 'normal'
    })
  }

  const resetWidget = (widgetId?: string) => {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId)
    }
  }

  return { createWidget, resetWidget }
}

// Composable: API calls
const useContactAPI = () => {
  const callAPI = async (payload: Record<string, any>) => {
    const response = await fetch('/.netlify/functions/reveal_contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    return response.json()
  }

  const getEmailInfo = async (token: string) => {
    const tNow = startTime.value ? performance.now() - startTime.value : 0
    const honeypotValue = honeypot.value?.value || ''

    return callAPI({
      token,
      tNow,
      honeypot: honeypotValue
    })
  }

  const getPhoneInfo = async (phoneToken: string) => {
    const tNow = startTime.value ? performance.now() - startTime.value : 0
    const honeypotValue = honeypot.value?.value || ''

    return callAPI({
      token: "",
      phoneToken,
      includePhone: true,
      tNow,
      honeypot: honeypotValue
    })
  }

  return { getEmailInfo, getPhoneInfo }
}

// Initialize composables
const { createWidget, resetWidget } = useTurnstile()
const { getEmailInfo, getPhoneInfo } = useContactAPI()

// Modal management
const showModal = async () => {
  isVisible.value = true
  document.body.style.overflow = 'hidden'
  startTime.value = performance.now()
  
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
  resetWidget(turnstileWidgetId.value)
  resetWidget(phoneTurnstileWidgetId.value)
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
    turnstileWidgetId.value = createWidget(
      turnstileContainer.value,
      handleEmailSuccess,
      () => {
        emailStep.error = 'Security verification failed.'
        emailStep.status = 'error'
      }
    )
  } catch (err) {
    console.error('Failed to initialize Turnstile:', err)
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
    console.error('Email verification failed:', err)
    emailStep.error = err instanceof Error ? err.message : 'Verification failed.'
    emailStep.status = 'error'
    resetWidget(turnstileWidgetId.value)
  }
}

const retryEmailVerification = () => {
  emailStep.error = undefined
  contactInfo.value = null
  if (turnstileWidgetId.value) {
    resetWidget(turnstileWidgetId.value)
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
    phoneTurnstileWidgetId.value = createWidget(
      phoneTurnstileContainer.value,
      handlePhoneSuccess,
      () => {
        phoneStep.error = 'Phone verification failed.'
        phoneStep.status = 'error'
      }
    )
  } catch (err) {
    console.error('Failed to initialize phone Turnstile:', err)
    phoneStep.error = 'Failed to load phone verification.'
    phoneStep.status = 'error'
  }
}

const handlePhoneSuccess = async (phoneToken: string) => {
  phoneStep.status = 'loading'
  phoneStep.error = undefined
  
  try {
    const data = await getPhoneInfo(phoneToken)
    if (contactInfo.value) {
      contactInfo.value = { ...contactInfo.value, ...data }
    }
    phoneStep.status = 'success'
  } catch (err) {
    console.error('Phone verification failed:', err)
    phoneStep.error = err instanceof Error ? err.message : 'Phone verification failed.'
    phoneStep.status = 'error'
    resetWidget(phoneTurnstileWidgetId.value)
  }
}

const retryPhoneVerification = () => {
  phoneStep.error = undefined
  if (phoneTurnstileWidgetId.value) {
    resetWidget(phoneTurnstileWidgetId.value)
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

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  ;(window as any).showContactModal = showModal
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  resetWidget(turnstileWidgetId.value)
  resetWidget(phoneTurnstileWidgetId.value)
  
  if ((window as any).showContactModal) {
    delete (window as any).showContactModal
  }
})

// Inline Components (Simple functional components)
const LoadingSpinner = defineComponent({
  props: {
    message: { type: String, default: 'Loading...' }
  },
  setup(props) {
    return () => h('div', { class: 'flex items-center justify-center space-x-2' }, [
      h('svg', {
        class: 'animate-spin h-5 w-5 text-purple-500',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24'
      }, [
        h('circle', {
          class: 'opacity-25',
          cx: '12',
          cy: '12',
          r: '10',
          stroke: 'currentColor',
          'stroke-width': '4'
        }),
        h('path', {
          class: 'opacity-75',
          fill: 'currentColor',
          d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        })
      ]),
      h('span', { class: 'text-gray-400 text-sm' }, props.message)
    ])
  }
})

const ErrorMessage = defineComponent({
  props: {
    message: { type: String, required: true }
  },
  emits: ['retry'],
  setup(props, { emit }) {
    return () => h('div', { class: 'p-3 bg-red-900/20 border border-red-500/50 rounded-lg' }, [
      h('p', { class: 'text-red-400 text-sm' }, props.message),
      h('button', {
        class: 'mt-2 text-xs text-purple-400 hover:text-purple-300 underline',
        onClick: () => emit('retry')
      }, 'Try again')
    ])
  }
})

const VerificationSection = defineComponent({
  props: {
    step: { type: Object, required: true },
    message: { type: String, required: true }
  },
  emits: ['retry'],
  components: { LoadingSpinner, ErrorMessage },
  setup(props, { emit, slots }) {
    return () => {
      if (props.step.status === 'loading') {
        return h('div', { class: 'mt-4' }, h(LoadingSpinner))
      }
      
      if (props.step.status === 'error') {
        return h('div', { class: 'mt-4' }, 
          h(ErrorMessage, { 
            message: props.step.error,
            onRetry: () => emit('retry')
          })
        )
      }
      
      if (props.step.status === 'captcha') {
        return h('div', { class: 'mt-4 space-y-4' }, [
          h('p', { class: 'text-gray-400 text-sm' }, props.message),
          slots.default?.()
        ])
      }
      
      return null
    }
  }
})

const ContactInfo = defineComponent({
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String }
  },
  setup(props) {
    const iconPaths: Record<string, string> = {
      email: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    }
    
    return () => h('div', { class: 'flex items-center space-x-3' }, [
      h('svg', {
        class: 'h-5 w-5 text-gray-400',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor'
      }, [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: iconPaths[props.icon] || iconPaths.email
        })
      ]),
      h('div', {}, [
        h('p', { class: 'text-sm font-medium text-gray-400' }, props.label),
        h('p', { class: 'text-white' }, props.value)
      ])
    ])
  }
})

const PhoneRevealButton = defineComponent({
  emits: ['click'],
  setup(_, { emit }) {
    return () => h('div', { class: 'text-center' }, [
      h('p', { class: 'text-sm text-gray-400 mb-3' }, 'Want my phone number too?'),
      h('button', {
        class: 'px-4 py-2 bg-purple-600/80 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors duration-200 border border-purple-500/50',
        onClick: () => emit('click')
      }, [
        h('svg', {
          class: 'h-4 w-4 inline mr-2',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
          })
        ]),
        'Reveal Phone Number'
      ])
    ])
  }
})

// Expose API
defineExpose({ showModal, hideModal })
</script>