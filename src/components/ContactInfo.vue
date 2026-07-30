<template>
  <div class="term-field">
    <span class="term-field-label">{{ label }}</span>
    <a v-if="value" class="term-field-value" :href="href">{{ value }}</a>
    <span v-else class="term-field-value">—</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  value?: string
}>()

// `icon` is retained so callers keep working; Terminal labels the field with
// text rather than a glyph, and uses the kind to pick the right link scheme.
const href = computed(() => {
  if (!props.value) return undefined
  return props.icon === 'phone' ? `tel:${props.value.replace(/[^\d+]/g, '')}` : `mailto:${props.value}`
})
</script>
