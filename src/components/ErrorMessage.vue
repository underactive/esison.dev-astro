<template>
  <div class="term-error" role="alert">
    <span>{{ message }}</span>
    <button type="button" class="term-inline-btn" @click="$emit('retry')">Try again</button>
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
