<template>
  <div v-if="domains" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide dark:text-slate-400">Domains</div>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="domain in domainList"
        :key="domain"
        class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs dark:bg-slate-900 dark:text-slate-200"
      >
        {{ domain }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: null
  }
})

const domains = computed(() => {
  return props.value
})

const domainList = computed(() => {
  if (!domains.value) return []
  return domains.value.split(',').map(d => d.trim()).filter(Boolean)
})
</script>

<script>
export const tagMetadata = {
  name: 'domains',
  displayName: 'Domains',
  description: 'List related domain names or websites (comma-separated)',
  example: 'domains=github.com,gitlab.com',
  category: 'reference',
  icon: '🌐',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'At least one domain is required' }
    }
    return { valid: true }
  }
}
</script>
