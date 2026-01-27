<template>
  <div class="p-4 bg-white rounded-xl border border-blue-200 shadow-sm w-full dark:bg-slate-950 dark:border-blue-500/30">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-500/20">
        <Wifi class="w-5 h-5 text-blue-600 dark:text-blue-300" />
      </div>
      <div>
        <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-200">WiFi Network</div>
      </div>
    </div>
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:gap-6 w-full">
      <div class="flex-1">
        <div class="text-xs font-medium text-gray-500 mb-1 dark:text-slate-400">SSID</div>
        <div class="flex items-center gap-2 w-full">
          <span class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded select-all border border-gray-200 text-sm w-full md:w-auto dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800">{{ ssid }}</span>
          <button @click="copyToClipboard(ssid)" class="p-1.5 rounded hover:bg-blue-100 transition-colors dark:hover:bg-blue-500/20" title="Copy SSID">
            <Copy class="w-4 h-4 text-blue-500 dark:text-blue-300" />
          </button>
        </div>
      </div>
      <div class="flex-1">
        <div class="text-xs font-medium text-gray-500 mb-1 dark:text-slate-400">Password</div>
        <div class="flex items-center gap-2 w-full">
          <span class="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded select-all border border-gray-200 text-sm w-full md:w-auto dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800">{{ password }}</span>
          <button @click="copyToClipboard(password)" class="p-1.5 rounded hover:bg-blue-100 transition-colors dark:hover:bg-blue-500/20" title="Copy Password">
            <Copy class="w-4 h-4 text-blue-500 dark:text-blue-300" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Wifi, Copy } from 'lucide-vue-next'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const ssid = computed(() => {
  if (!props.value) return ''
  return props.value.split(':')[0] || ''
})

const password = computed(() => {
  if (!props.value) return ''
  return props.value.split(':').slice(1).join(':') || ''
})

function copyToClipboard(text) {
  if (!text) return
  navigator.clipboard.writeText(text)
}
</script>

<script>
export const tagMetadata = {
  name: 'wifi',
  displayName: 'WiFi Credentials',
  description: 'Store WiFi network credentials (SSID and password)',
  example: 'wifi=MyNetwork:password123',
  category: 'security',
  icon: '📶',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'WiFi credentials are required' }
    }
    if (!value.includes(':')) {
      return { valid: false, error: 'Format must be SSID:password' }
    }
    return { valid: true }
  }
}
</script>
