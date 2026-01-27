<template>
  <div v-if="references && references.length > 0" class="p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm dark:bg-purple-950/30 dark:border-purple-500/30">
    <div class="text-xs font-semibold text-purple-700 mb-3 uppercase tracking-wide dark:text-purple-200">
      Links ({{ references.length }})
    </div>
    <div class="space-y-2">
      <a
        v-for="(ref, index) in references"
        :key="index"
        :href="ref.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all group dark:bg-slate-950 dark:border-purple-500/30 dark:hover:border-purple-400/60"
      >
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
            <component :is="getPlatformIcon(ref.type)" class="w-4 h-4" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-900 truncate dark:text-slate-100">{{ ref.platform }}</div>
          <p class="text-xs text-gray-500 truncate dark:text-slate-400">{{ ref.url }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { Youtube, Instagram, Twitter, MessageCircle, ExternalLink } from 'lucide-vue-next'

defineProps({
  references: {
    type: Array,
    default: () => []
  }
})

const getPlatformIcon = (type) => {
  switch (type) {
    case "youtube":
      return Youtube
    case "instagram":
      return Instagram
    case "twitter":
      return Twitter
    case "reddit":
      return MessageCircle
    default:
      return ExternalLink
  }
}

const getPlatformColorClass = (type) => {
  switch (type) {
    case "youtube":
      return "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
    case "instagram":
      return "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300"
    case "twitter":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
    case "reddit":
      return "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"
  }
}
</script>
