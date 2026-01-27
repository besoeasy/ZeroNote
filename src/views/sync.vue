<template>
  <main
    class="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-white px-4 py-12"
  >
    <div class="w-full max-w-6xl mx-auto animate-fade-in-up">
      <!-- Header -->
      <header class="text-center mb-16">
        <h1
          class="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight"
        >
          Data
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-violet-600"
            >Hub</span
          >
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Import, backup, and sync your notes. Choose a method below:
        </p>
      </header>

      <!-- Sync Options Grid -->
      <section
        aria-label="Sync and Backup Methods"
        class="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <!-- P2P Sync Card -->
        <router-link
          to="/p2p"
          class="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200"
          tabindex="0"
          aria-label="Peer-to-Peer: Encrypted device-to-device sync"
        >
          <!-- Gradient Glow -->
          <div
            class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"
          ></div>

          <div class="relative z-10">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            <!-- Content -->
            <h2
              class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
            >
              Peer-to-Peer
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              Encrypted device-to-device sync
            </p>

            <!-- Features -->
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                End-to-end encrypted
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                No cloud required
              </li>
            </ul>

            <!-- Arrow -->
            <div
              class="mt-6 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform"
            >
              Learn more
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- S3 Sync Card -->
        <router-link
          to="/s3"
          class="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          tabindex="0"
          aria-label="S3 / MinIO: Encrypted cloud backup & sync"
        >
          <!-- Gradient Glow -->
          <div
            class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"
          ></div>

          <div class="relative z-10">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-2xl mb-6 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 15a4 4 0 004 4h10a4 4 0 100-8h-1.26A8 8 0 103 15z"
                />
              </svg>
            </div>

            <!-- Content -->
            <h2
              class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors"
            >
              S3 / MinIO
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              Encrypted cloud backup & sync
            </p>

            <!-- Features -->
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Cloud storage
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Multi-device sync
              </li>
            </ul>

            <!-- Arrow -->
            <div
              class="mt-6 flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-2 transition-transform"
            >
              Learn more
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- Local Backup Card -->
        <router-link
          to="/backup"
          class="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-200"
          tabindex="0"
          aria-label="Local Backup: Unencrypted export/import"
        >
          <!-- Gradient Glow -->
          <div
            class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"
          ></div>

          <div class="relative z-10">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-20 h-20 bg-amber-50 rounded-2xl mb-6 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </div>

            <!-- Content -->
            <h2
              class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors"
            >
              Local Backup
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              Unencrypted export/import
            </p>

            <!-- Features -->
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Simple & fast
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Full data control
              </li>
            </ul>

            <!-- Arrow -->
            <div
              class="mt-6 flex items-center text-amber-600 font-semibold text-sm group-hover:translate-x-2 transition-transform"
            >
              Learn more
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- Import Card -->
        <router-link
          to="/import"
          class="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          tabindex="0"
          aria-label="Import: Bring data from other apps (CSV)"
        >
          <!-- Gradient Glow -->
          <div
            class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"
          ></div>

          <div class="relative z-10">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-2xl mb-6 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v10m0 0l3-3m-3 3l-3-3M4 17a2 2 0 002 2h12a2 2 0 002-2"
                />
              </svg>
            </div>

            <!-- Content -->
            <h2
              class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors"
            >
              Import
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              Bring data from other apps (CSV)
            </p>

            <!-- Features -->
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Map CSV columns to supertags
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Great for passwords & bookmarks
              </li>
            </ul>

            <!-- Arrow -->
            <div
              class="mt-6 flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-transform"
            >
              Learn more
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </router-link>
      </section>
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
