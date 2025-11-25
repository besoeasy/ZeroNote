<template>
  <div
    class="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 relative overflow-hidden"
  >
    <!-- Animated Background Elements -->
    <div
      class="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
    ></div>
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
    ></div>
    <div
      class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
    ></div>

    <div class="max-w-md w-full relative z-10 animate-fade-in-up">
      <!-- Header -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl mb-6 shadow-lg"
        >
          <Lock class="w-10 h-10 text-white" />
        </div>
        <h1
          class="text-5xl font-black text-gray-900 mb-3 tracking-tight uppercase"
        >
          Zero<span
            class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"
            >Note</span
          >
        </h1>
        <p class="text-lg text-gray-600 font-medium">Your Secure Note Vault</p>
      </div>

      <!-- Input Card -->
      <div
        class="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm bg-opacity-95"
      >
        <!-- Password Input -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >Master Password</label
          >
          <input
            v-model="passwordInput"
            type="password"
            placeholder="Enter your master password"
            class="w-full p-4 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            @input="checkPasswordStrength"
            @keyup.enter="unlockApp"
          />
        </div>

        <!-- PIN Input -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >PIN (Optional)</label
          >
          <input
            v-model="pinInput"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Enter numeric PIN"
            class="w-full p-4 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            @input="validatePin"
            @keyup.enter="unlockApp"
            maxlength="16"
          />
        </div>

        <!-- Password Strength Meter -->
        <div v-if="passwordInput" class="mb-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-600"
              >Password Strength</span
            >
            <span
              class="text-xs font-bold"
              :class="strengthInfo.textColorClass"
              >{{ strengthInfo.label }}</span
            >
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500 ease-out rounded-full"
              :class="strengthInfo.colorClass"
              :style="{ width: `${strengthPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Warning Message -->
        <div
          v-if="showWarning"
          class="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"
        >
          <p class="text-sm text-red-700 font-medium flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            Your password is {{ strengthInfo.label }}. Consider using a stronger
            password.
          </p>
        </div>

        <!-- Account Identifier -->
        <div
          v-if="AccountIdentifier"
          class="mb-6 p-4 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl"
        >
          <p
            class="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
          >
            Account Identifier
          </p>
          <p class="text-base font-mono font-bold text-blue-700">
            {{ AccountIdentifier }}
          </p>
        </div>

        <!-- Unlock Button -->
        <button
          @click="unlockApp"
          class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-base font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="passwordInput.length === 0"
        >
          <span class="flex items-center justify-center">
            <Unlock class="w-5 h-5 mr-2" />
            DECRYPT & UNLOCK
          </span>
        </button>
      </div>

      <!-- Info Box -->
      <div
        class="mt-6 p-5 bg-white bg-opacity-80 rounded-2xl backdrop-blur-sm border border-gray-100 shadow-sm"
      >
        <p class="text-sm text-gray-700 text-center leading-relaxed">
          <span class="inline-block mr-1">🔐</span>
          Your master password is the encryption key for all your data.<br />
          <span class="font-semibold"
            >Choose a strong password and remember it - it cannot be
            recovered.</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Lock, Unlock } from "lucide-vue-next";

import sha512 from "crypto-js/sha512";

const passwordInput = ref("");
const pinInput = ref("");
const passwordStrength = ref(0);

const emit = defineEmits(["unlock"]);

// Word lists for generating Account identifier
const adjectives = [
  "happy",
  "bright",
  "calm",
  "swift",
  "brave",
  "gentle",
  "proud",
  "wise",
  "kind",
  "noble",
  "quiet",
  "bold",
  "clever",
  "eager",
  "fancy",
  "jolly",
  "keen",
  "lively",
  "mighty",
  "polite",
  "witty",
  "zealous",
  "careful",
  "daring",
];

const nouns = [
  "ocean",
  "mountain",
  "river",
  "forest",
  "meadow",
  "valley",
  "garden",
  "sunset",
  "morning",
  "eagle",
  "dolphin",
  "tiger",
  "phoenix",
  "dragon",
  "wolf",
  "falcon",
  "star",
  "moon",
  "cloud",
  "wind",
  "thunder",
  "rainbow",
  "crystal",
  "diamond",
];

const verbs = [
  "dances",
  "flows",
  "shines",
  "soars",
  "runs",
  "jumps",
  "sings",
  "flies",
  "glides",
  "whispers",
  "roars",
  "sparkles",
  "glows",
  "blooms",
  "rises",
  "falls",
  "dreams",
  "wonders",
  "creates",
  "explores",
  "discovers",
  "transforms",
  "illuminates",
  "unites",
];

const validatePin = () => {
  // Ensure only numeric values
  pinInput.value = pinInput.value.replace(/\D/g, "");
};

const AccountIdentifier = computed(() => {
  if (!passwordInput.value && !pinInput.value) return "";

  // Generate a hash from the current inputs
  const combined = passwordInput.value + pinInput.value;
  if (!combined) return "";

  const hash = sha512("besoeasy" + combined).toString();

  // Use hash to deterministically select words
  const hashNum = parseInt(hash.substring(0, 8), 16);
  const adjIndex = hashNum % adjectives.length;
  const nounIndex = Math.floor(hashNum / adjectives.length) % nouns.length;
  const verbIndex =
    Math.floor(hashNum / (adjectives.length * nouns.length)) % verbs.length;

  const adj = adjectives[adjIndex];
  const noun = nouns[nounIndex];
  const verb = verbs[verbIndex];

  return `The ${adj} ${noun} ${verb}`;
});

const checkPasswordStrength = () => {
  const password = passwordInput.value;

  if (!password) {
    passwordStrength.value = 0;
    return;
  }

  let score = 0;

  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;

  if (/[A-Z]/.test(password)) score += 15; // Uppercase
  if (/[a-z]/.test(password)) score += 15; // Lowercase
  if (/[0-9]/.test(password)) score += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special characters

  passwordStrength.value = Math.min(Math.max(score, 0), 100);
};

const strengthPercentage = computed(() => passwordStrength.value);

const strengthInfo = computed(() => {
  const strength = passwordStrength.value;

  if (strength === 0) {
    return {
      label: "",
      colorClass: "",
      textColorClass: "",
    };
  }

  const thresholds = [
    { max: 30, label: "Very Weak", color: "red" },
    { max: 50, label: "Weak", color: "orange" },
    { max: 70, label: "Moderate", color: "yellow" },
    { max: 90, label: "Strong", color: "blue" },
    { max: Infinity, label: "Very Strong", color: "green" },
  ];

  const info =
    thresholds.find((t) => strength < t.max) ||
    thresholds[thresholds.length - 1];

  return {
    label: info.label,
    colorClass: `bg-${info.color}-500`,
    textColorClass: `text-${info.color}-600`,
  };
});

const showWarning = computed(() => {
  return passwordInput.value.length > 0 && passwordStrength.value < 50;
});

const unlockApp = () => {
  const encryptionKey = sha512(
    "besoeasy" + passwordInput.value + pinInput.value
  );

  sessionStorage.setItem("ENCRYPTION_KEY", encryptionKey);

  passwordInput.value = "";
  pinInput.value = "";

  emit("unlock");
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
