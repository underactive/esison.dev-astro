<template>
  <p class="term-spinner">
    <span class="term-spinner-glyph" aria-hidden="true"></span>
    <span>{{ message }}</span>
  </p>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'Loading...',
  },
)
</script>
