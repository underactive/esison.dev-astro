<template>
  <div class="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
    <p class="text-red-400 text-sm">{{ message }}</p>
    <button
      class="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>
