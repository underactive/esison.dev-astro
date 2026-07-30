<template>
  <div>
    <p class="term-prompt">Want my phone number too?</p>
    <button type="button" class="term-btn" style="margin-top:0.75rem" @click="$emit('click')">
      Reveal Phone Number
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>
