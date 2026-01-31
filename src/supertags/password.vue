<template>
  <div class="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm dark:bg-blue-950/30 dark:border-blue-500/30">
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-200">Password</div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <div class="text-xs font-semibold" :class="strengthColor">
            {{ strengthLabel }}
          </div>
          <div class="flex gap-0.5">
            <div 
              v-for="i in 4" 
              :key="i"
              class="w-1 h-3 rounded-full transition-all duration-300"
              :class="i <= strengthLevel ? strengthBgColor : 'bg-gray-300 dark:bg-gray-700'"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="text-sm text-blue-900 font-mono font-bold select-all flex-1 break-all dark:text-blue-100">
        {{ showPassword ? value : "••••••••••••" }}
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button
          @click="copyPassword"
          class="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-200 dark:hover:bg-blue-500/15"
          :title="copied ? 'Copied!' : 'Copy password'"
        >
          {{ copied ? '✓' : 'Copy' }}
        </button>
        <button
          @click="showPassword = !showPassword"
          class="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-200 dark:hover:bg-blue-500/15"
        >
          {{ showPassword ? "Hide" : "Show" }}
        </button>
      </div>
    </div>

    <!-- Strength Details -->
    <div v-if="showPassword && strengthDetails.length > 0" class="pt-3 border-t border-blue-200 dark:border-blue-800/50">
      <div class="space-y-1">
        <div v-for="detail in strengthDetails" :key="detail.text" class="flex items-center gap-2 text-xs">
          <span v-if="detail.met" class="text-green-600 dark:text-green-400">✓</span>
          <span v-else class="text-gray-400 dark:text-gray-600">○</span>
          <span :class="detail.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'">
            {{ detail.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const showPassword = ref(false)
const copied = ref(false)

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Password strength calculation
const passwordStrength = computed(() => {
  const password = props.value
  if (!password) return { score: 0, level: 0 }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noCommon: !/(password|123456|qwerty|abc123)/i.test(password)
  }
  
  // Calculate score
  if (checks.length) score += 20
  if (checks.longLength) score += 15
  if (checks.uppercase) score += 15
  if (checks.lowercase) score += 15
  if (checks.numbers) score += 15
  if (checks.special) score += 15
  if (checks.noCommon) score += 5
  
  // Determine level (0-4)
  let level = 0
  if (score >= 25) level = 1  // Weak
  if (score >= 50) level = 2  // Fair
  if (score >= 75) level = 3  // Good
  if (score >= 90) level = 4  // Strong
  
  return { score, level, checks }
})

const strengthLevel = computed(() => passwordStrength.value.level)

const strengthLabel = computed(() => {
  const level = strengthLevel.value
  if (level === 0) return 'Very Weak'
  if (level === 1) return 'Weak'
  if (level === 2) return 'Fair'
  if (level === 3) return 'Good'
  return 'Strong'
})

const strengthColor = computed(() => {
  const level = strengthLevel.value
  if (level === 0) return 'text-red-600 dark:text-red-400'
  if (level === 1) return 'text-orange-600 dark:text-orange-400'
  if (level === 2) return 'text-yellow-600 dark:text-yellow-400'
  if (level === 3) return 'text-blue-600 dark:text-blue-400'
  return 'text-green-600 dark:text-green-400'
})

const strengthBgColor = computed(() => {
  const level = strengthLevel.value
  if (level === 0) return 'bg-red-500 dark:bg-red-400'
  if (level === 1) return 'bg-orange-500 dark:bg-orange-400'
  if (level === 2) return 'bg-yellow-500 dark:bg-yellow-400'
  if (level === 3) return 'bg-blue-500 dark:bg-blue-400'
  return 'bg-green-500 dark:bg-green-400'
})

const strengthDetails = computed(() => {
  const checks = passwordStrength.value.checks
  return [
    { text: 'At least 8 characters', met: checks.length },
    { text: '12+ characters (recommended)', met: checks.longLength },
    { text: 'Uppercase letters', met: checks.uppercase },
    { text: 'Lowercase letters', met: checks.lowercase },
    { text: 'Numbers', met: checks.numbers },
    { text: 'Special characters', met: checks.special },
    { text: 'Not a common password', met: checks.noCommon }
  ]
})
</script>

<script>
export const tagMetadata = {
  name: 'password',
  displayName: 'Password',
  description: 'Store login credentials securely with show/hide functionality',
  example: 'password=MySecurePass123!',
  category: 'security',
  icon: '🔐',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Password is required' }
    }
    return { valid: true }
  }
}
</script>
