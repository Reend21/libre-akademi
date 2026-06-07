<template>
  <svg 
    v-if="iconData"
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    :width="size" 
    :height="size" 
    :fill="computedColor"
    class="simple-icon"
  >
    <path :d="iconData.path" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { SIMPLE_ICONS } from '../constants/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
  color: { type: String, default: 'currentColor' }
})

const iconData = computed(() => SIMPLE_ICONS[props.name])

const computedColor = computed(() => {
  if (props.color !== 'currentColor') return props.color
  return 'currentColor'
})
</script>

<style scoped>
.simple-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
