<template>
  <div class="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800/50">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <div class="flex flex-col">
        <span class="text-xs text-purple-600 dark:text-purple-400 font-medium">Date of Birth</span>
        <span class="font-semibold text-purple-900 dark:text-purple-200">{{ formattedDate }}</span>
      </div>
    </div>
    
    <div class="h-8 w-px bg-purple-200 dark:bg-purple-800"></div>
    
    <div class="flex flex-col">
      <span class="text-xs text-purple-600 dark:text-purple-400 font-medium">Age</span>
      <span class="font-bold text-purple-900 dark:text-purple-200">{{ age }} years</span>
    </div>
    
    <div v-if="nextBirthday" class="flex flex-col">
      <span class="text-xs text-purple-600 dark:text-purple-400 font-medium">Next Birthday</span>
      <span class="text-xs font-semibold text-purple-900 dark:text-purple-200">{{ nextBirthday }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  }
});

const parsedDate = computed(() => {
  try {
    // Try parsing different date formats
    const date = new Date(props.value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
});

const formattedDate = computed(() => {
  if (!parsedDate.value) return props.value;
  return parsedDate.value.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const age = computed(() => {
  if (!parsedDate.value) return 'N/A';
  
  const today = new Date();
  const birthDate = parsedDate.value;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

const nextBirthday = computed(() => {
  if (!parsedDate.value) return null;
  
  const today = new Date();
  const birthDate = parsedDate.value;
  
  // Get next birthday year
  let nextBirthdayDate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  // If birthday already passed this year, use next year
  if (nextBirthdayDate < today) {
    nextBirthdayDate = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  
  // Calculate days until birthday
  const daysUntil = Math.ceil((nextBirthdayDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil === 0) {
    return '🎉 Today!';
  } else if (daysUntil === 1) {
    return 'Tomorrow';
  } else if (daysUntil <= 30) {
    return `in ${daysUntil} days`;
  } else {
    return nextBirthdayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
});
</script>

<script>
export const tagMetadata = {
  name: "dob",
  displayName: "Date of Birth",
  description: "Store date of birth with automatic age calculation and next birthday countdown",
  example: "dob=1990-05-15",
  category: "personal",
  icon: "🎂",
  aliases: ["birthdate", "birthday"],
  parseValue: (value) => {
    // Normalize various date formats
    return value.trim();
  },
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "Date of birth is required" };
    }
    
    // Try to parse the date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { valid: false, error: "Invalid date format. Use YYYY-MM-DD or similar format" };
    }
    
    // Check if date is in the future
    if (date > new Date()) {
      return { valid: false, error: "Date of birth cannot be in the future" };
    }
    
    // Check if date is too old (more than 150 years)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);
    if (date < maxAge) {
      return { valid: false, error: "Date of birth seems too old" };
    }
    
    return { valid: true };
  },
};
</script>
