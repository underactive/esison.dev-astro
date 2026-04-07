<template>
  <div v-if="step.status === 'loading'" class="mt-4">
    <LoadingSpinner />
  </div>
  <div v-else-if="step.status === 'error'" class="mt-4">
    <ErrorMessage :message="step.error!" @retry="$emit('retry')" />
  </div>
  <div v-else-if="step.status === 'captcha'" class="mt-4 space-y-4">
    <p class="text-gray-400 text-sm">{{ message }}</p>
    <slot />
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
