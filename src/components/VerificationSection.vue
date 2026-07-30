<template>
  <div v-if="step.status === 'loading'">
    <LoadingSpinner message="verifying..." />
  </div>
  <div v-else-if="step.status === 'error'">
    <ErrorMessage :message="step.error!" @retry="$emit('retry')" />
  </div>
  <div v-else-if="step.status === 'captcha'">
    <p class="term-prompt">{{ message }}</p>
    <div style="margin-top:0.9rem">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorMessage from './ErrorMessage.vue'

interface VerificationStep {
  status: 'idle' | 'loading' | 'success' | 'error' | 'captcha'
  error?: string
}

defineProps<{
  step: VerificationStep
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>
