<template>
  <div
    class="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 relative overflow-hidden dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
  >
    <!-- Animated Background Elements -->
    <div
      class="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:bg-blue-500/20 dark:opacity-30"
    ></div>
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:bg-violet-500/20 dark:opacity-30"
    ></div>
    <div
      class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:bg-fuchsia-500/20 dark:opacity-30"
    ></div>

    <div class="max-w-md w-full relative z-10 animate-fade-in-up">
      <!-- Header / Password Strength Display -->
      <div class="text-center mb-10">
        <!-- Show Password Strength Meter when typing -->
        <div v-if="passwordInput || pinInput">
          <div class="flex flex-col items-center justify-center">
            <div class="relative w-44 h-44 mb-6">
              <!-- Background Circle -->
              <svg class="transform -rotate-90 w-44 h-44">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  stroke="currentColor"
                  stroke-width="10"
                  fill="none"
                  class="text-gray-200 dark:text-slate-700"
                />
                <!-- Progress Circle -->
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  stroke="currentColor"
                  stroke-width="10"
                  fill="none"
                  :class="strengthInfo.textColorClass"
                  :style="{
                    strokeDasharray: `${2 * Math.PI * 78}`,
                    strokeDashoffset: `${
                      2 * Math.PI * 78 * (1 - strengthPercentage / 100)
                    }`,
                    transition:
                      'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
                  }"
                  stroke-linecap="round"
                />
              </svg>

              <!-- Center Content -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div
                  class="text-5xl font-black"
                  :class="strengthInfo.textColorClass"
                >
                  {{ Math.round(strengthPercentage) }}%
                </div>
                <div class="text-base text-gray-600 mt-2 font-semibold dark:text-slate-400">
                  {{ strengthInfo.label || "Security" }}
                </div>
              </div>

              <!-- Animated Success Icon -->
              <div
                v-if="strengthPercentage >= 90"
                class="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in shadow-xl"
              >
                <svg
                  class="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Warning Message (Below Strength Indicator) -->
            <div
              v-if="showWarning"
              class="w-full max-w-md p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl animate-shake shadow-md dark:from-red-950/40 dark:to-orange-900/30 dark:border-red-500/40"
            >
              <p
                class="text-sm text-red-800 font-bold flex items-center justify-center gap-2 dark:text-red-200"
              >
                <svg
                  class="w-5 h-5 flex-shrink-0 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span
                  >Weak password! Add more characters, numbers, or
                  symbols.</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Show ZeroNote branding when no input -->
        <div v-else>
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl mb-6 shadow-lg animate-shimmer relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer-slide"
            ></div>
            <Lock class="w-10 h-10 text-white relative z-10" />
          </div>
          <h1
            class="text-5xl font-black text-gray-900 mb-3 tracking-tight uppercase dark:text-white"
          >
            Zero<span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 animate-gradient"
              >Note</span
            >
          </h1>
          <p class="text-lg text-gray-600 font-medium dark:text-slate-400">
            Your Secure Note Vault
          </p>
        </div>
      </div>

      <!-- Input Card -->
      <div
        class="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm bg-opacity-95 dark:bg-slate-950/85 dark:border-slate-800"
      >
        <!-- Password Input -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-300"
            >Master Password</label
          >
          <input
            v-model="passwordInput"
            type="password"
            placeholder="Enter your master password"
            class="w-full p-4 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/30"
            @input="checkPasswordStrength"
            @keyup.enter="unlockApp"
          />
        </div>

        <!-- PIN Input -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-300"
            >PIN (Optional)</label
          >
          <input
            v-model="pinInput"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Enter numeric PIN"
            class="w-full p-4 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/30"
            @input="validatePin"
            @keyup.enter="unlockApp"
            maxlength="16"
          />
        </div>

        <!-- Account Identifier -->
        <div
          v-if="AccountIdentifier"
          class="mb-6 p-4 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl dark:from-blue-950/40 dark:to-violet-950/30 dark:border-blue-500/20"
        >
          <p
            class="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-slate-400"
          >
            Account Identifier
          </p>
          <p class="text-base font-mono font-bold text-blue-700 dark:text-blue-300">
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
        class="mt-6 p-5 bg-white bg-opacity-80 rounded-2xl backdrop-blur-sm border border-gray-100 shadow-sm dark:bg-slate-950/80 dark:border-slate-800"
      >
        <p class="text-sm text-gray-700 text-center leading-relaxed dark:text-slate-300">
          <span class="inline-block mr-1">🔐</span>
          Your master password is the encryption key for all your data.<br />
          <span class="font-semibold"
            >Choose a strong password and remember it - it cannot be
            recovered.</span
          >
        </p>
      </div>

      <!-- GitHub Link -->
      <div class="mt-4 text-center">
        <a
          href="https://github.com/besoeasy/ZeroNote"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group dark:text-slate-400 dark:hover:text-slate-100"
        >
          <svg
            class="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">View on GitHub</span>
        </a>
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
  // Recalculate strength when PIN changes
  checkPasswordStrength();
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
  const pin = pinInput.value;
  const combined = password + pin;

  if (!combined) {
    passwordStrength.value = 0;
    return;
  }

  let score = 0;

  // Length score (combined password + PIN)
  const lengthScore = Math.min(combined.length * 4, 40);
  score += lengthScore;

  // Character variety checks
  if (/[A-Z]/.test(combined)) score += 15; // Uppercase
  if (/[a-z]/.test(combined)) score += 15; // Lowercase
  if (/[0-9]/.test(combined)) score += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(combined)) score += 15; // Special characters

  // Bonus for having both password and PIN
  if (password && pin) score += 10;

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
  return (
    (passwordInput.value.length > 0 || pinInput.value.length > 0) &&
    passwordStrength.value < 50
  );
});

const strengthEmoji = computed(() => {
  const strength = passwordStrength.value;
  if (strength === 0) return "🔒";
  if (strength < 30) return "😰"; // Very Weak
  if (strength < 50) return "😟"; // Weak
  if (strength < 70) return "😐"; // Moderate
  if (strength < 90) return "😊"; // Strong
  return "🎉"; // Very Strong
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

/* Shimmer Animation */
.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%,
  100% {
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
  }
}

/* Shimmer Slide */
.animate-shimmer-slide {
  animation: shimmerSlide 3s ease-in-out infinite;
}

@keyframes shimmerSlide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

/* Gradient Animation */
.animate-gradient {
  background-size: 200% auto;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
}

/* Pulse Once */
.animate-pulse-once {
  animation: pulseOnce 0.5s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulseOnce {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Bounce In */
.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Input Focus Animation */
input:focus {
  animation: inputFocus 0.3s ease-out;
}

@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Shake Animation for Warning */
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

/* Icon Pulse Animation */
.animate-icon-pulse {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
```
