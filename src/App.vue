<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
    <RouterView v-if="isPublicShareRoute" />

    <LockScreen v-else-if="!isUnlocked" @unlock="handleUnlock" />

    <div v-else class="min-h-screen bg-white flex flex-col md:flex-row transition-colors duration-300 dark:bg-gray-950">
      <!-- Mobile Navbar (visible on small screens) -->
      <nav class="md:hidden sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/70 dark:bg-gray-950/80 dark:border-gray-800/70">
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Logo -->
          <router-link
            to="/dashboard"
            class="group relative flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100/80 transition-all duration-300 dark:hover:bg-gray-900/60"
            title="ZERO NOTE"
          >
            <div class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 via-blue-600 to-fuchsia-600 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <div class="absolute inset-0 rounded-lg bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 animate-shimmer-slide"></div>
              <svg class="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.66-.91-6-4.84-6-8.5V8.72l6-3.16 6 3.16V12c0 3.66-2.34 7.59-6 8.5z"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
            </div>
            <div class="flex flex-col leading-none">
              <span class="text-sm font-black tracking-tight text-gray-900 dark:text-gray-100">ZERO</span>
              <span class="text-[9px] font-bold tracking-[0.15em] text-gray-500 dark:text-gray-400">NOTE</span>
            </div>
          </router-link>

          <!-- Mobile Actions -->
          <div class="flex items-center gap-2">
            <button
              v-if="isDashboard"
              @click="handleNewNote"
              class="group relative h-9 px-3 rounded-lg bg-linear-to-r from-indigo-600 via-blue-600 to-fuchsia-600 text-white flex items-center gap-1.5 hover:brightness-110 transition-all duration-300 shadow-md active:scale-[0.95]"
              title="New Note"
            >
              <Plus class="w-4 h-4" />
              <span class="text-xs font-medium">New</span>
            </button>

            <router-link
              v-else
              to="/dashboard"
              class="h-9 px-3 rounded-lg bg-gray-100/80 text-gray-900 flex items-center gap-1.5 hover:bg-gray-200/80 transition-all duration-300 dark:bg-gray-900/70 dark:text-gray-100"
              title="Back"
            >
              <ArrowLeft class="w-4 h-4" />
              <span class="text-xs font-medium">Back</span>
            </router-link>

            <button
              @click="theme.toggle"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 dark:text-gray-300 dark:hover:bg-gray-900/60"
              :title="theme.resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'"
            >
              <component :is="theme.resolvedTheme === 'dark' ? Sun : Moon" class="w-4 h-4" />
            </button>

            <router-link
              to="/data"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 dark:text-gray-300 dark:hover:bg-gray-900/60"
              :class="route.path === '/data' ? 'bg-gray-100/80 dark:bg-gray-900/60' : ''"
              title="Data Hub"
            >
              <Database class="w-4 h-4" />
            </router-link>

            <router-link
              to="/insights"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 dark:text-gray-300 dark:hover:bg-gray-900/60"
              :class="route.path === '/insights' ? 'bg-gray-100/80 dark:bg-gray-900/60' : ''"
              title="Insights"
            >
              <BarChart3 class="w-4 h-4" />
            </router-link>

            <button
              v-if="isUnlocked && !isPublicShareRoute"
              @click="toggleS3Panel(!s3PanelOpen)"
              class="relative w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-200/60 flex items-center justify-center hover:bg-emerald-500/15 transition-all duration-300 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30"
              :title="s3PanelOpen ? 'Hide S3' : 'Show S3'"
            >
              <span class="inline-flex h-2 w-2 rounded-full" :class="s3IndicatorDotClass"></span>
            </button>

            <button
              @click="handleLogout"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 dark:text-gray-300 dark:hover:bg-gray-900/60"
              title="Lock"
            >
              <Lock class="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <!-- Desktop Sidebar (visible on md and up) -->
      <aside class="hidden md:flex fixed left-0 top-0 h-screen w-20 flex-col border-r border-gray-200/70 bg-white/80 backdrop-blur-xl transition-all duration-300 z-50 dark:border-gray-800/70 dark:bg-gray-950/70">
        <div class="flex flex-col h-full p-4">
          <!-- Logo -->
          <router-link
            to="/dashboard"
            class="group relative flex items-center justify-center rounded-2xl px-3 py-3 mb-6 hover:bg-gray-100/80 transition-all duration-300 dark:hover:bg-gray-900/60"
            title="ZERO NOTE"
          >
            <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 via-blue-600 to-fuchsia-600 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 shrink-0">
              <div class="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 animate-shimmer-slide"></div>
              <svg class="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.66-.91-6-4.84-6-8.5V8.72l6-3.16 6 3.16V12c0 3.66-2.34 7.59-6 8.5z"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
            </div>
          </router-link>

          <!-- Navigation Items -->
          <nav class="flex-1 flex flex-col gap-2">
            <button
              v-if="isDashboard"
              @click="handleNewNote"
              class="group relative h-12 px-3 rounded-xl bg-linear-to-r from-indigo-600 via-blue-600 to-fuchsia-600 text-white flex items-center justify-center hover:brightness-110 transition-all duration-300 shadow-md hover:shadow-2xl active:scale-[0.98] overflow-hidden"
              title="New Note"
            >
              <span class="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 animate-shimmer-slide"></span>
              <Plus class="w-5 h-5 relative z-10 shrink-0" />
            </button>

            <router-link
              v-else
              to="/dashboard"
              class="h-12 px-3 rounded-xl bg-gray-100/80 text-gray-900 flex items-center justify-center hover:bg-gray-200/80 transition-all duration-300 active:scale-[0.98] dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-900"
              title="Back to Dashboard"
            >
              <ArrowLeft class="w-5 h-5 shrink-0" />
            </router-link>

            <div class="h-px bg-gray-200 my-2 dark:bg-gray-800"></div>

            <router-link
              to="/data"
              class="h-12 px-3 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              :class="route.path === '/data' ? 'bg-gray-100/80 dark:bg-gray-900/60' : ''"
              title="Data Hub"
            >
              <Database class="w-5 h-5 shrink-0" />
            </router-link>

            <router-link
              to="/insights"
              class="h-12 px-3 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              :class="route.path === '/insights' ? 'bg-gray-100/80 dark:bg-gray-900/60' : ''"
              title="Insights"
            >
              <BarChart3 class="w-5 h-5 shrink-0" />
            </router-link>
          </nav>

          <!-- Bottom Actions -->
          <div class="flex flex-col gap-2 mt-4">
            <div class="h-px bg-gray-200 mb-2 dark:bg-gray-800"></div>
            
            <button
              v-if="isUnlocked && !isPublicShareRoute"
              @click="toggleS3Panel(!s3PanelOpen)"
              class="group relative h-12 px-3 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-200/60 flex items-center justify-center hover:bg-emerald-500/15 transition-all duration-300 active:scale-[0.98] dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30"
              :title="s3PanelOpen ? 'Hide S3 Sync' : 'Show S3 Sync'"
            >
              <span class="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-30 animate-shimmer-slide"></span>
              <span class="relative inline-flex h-2.5 w-2.5 rounded-full shrink-0" :class="s3IndicatorDotClass"></span>
            </button>

            <button
              @click="theme.toggle"
              class="h-12 px-3 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              :title="theme.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <component :is="theme.resolvedTheme === 'dark' ? Sun : Moon" class="w-5 h-5 shrink-0" />
            </button>

            <button
              @click="handleLogout"
              class="h-12 px-3 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              title="Lock App"
            >
              <Lock class="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      <main class="flex-1 w-full overflow-auto md:ml-20" :class="s3PanelOpen ? 'md:pr-80' : ''">
        <RouterView />
      </main>
    </div>


    <aside
      v-if="isUnlocked && !isPublicShareRoute"
      class="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] z-40 border-l border-gray-200/70 bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-300 dark:bg-gray-950/70 dark:border-gray-800/70"
      :class="s3PanelOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200/70 dark:border-gray-800/70">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 shadow-lg">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-white" :class="s3Connected ? 'animate-pulse' : 'opacity-50'"></span>
              </div>
              <div>
                <h2 class="text-base font-black text-gray-900 dark:text-gray-100">S3 Sync</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ s3IndicatorLabel }}</p>
              </div>
            </div>
            <button
              @click="toggleS3Panel(false)"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100/80 transition-all duration-300 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-900/60"
              aria-label="Hide S3 Sync"
              title="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div v-if="s3LastSync" class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last synced {{ new Date(s3LastSync).toLocaleTimeString() }}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1">
          <!-- Info Alert -->
          <div class="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                Configure S3-compatible storage. Auto-sync runs on changes and every 15 minutes.
              </p>
            </div>
          </div>

          <!-- Configuration Form -->
          <form @submit.prevent="applyConfig" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Endpoint URL</label>
              <input
                v-model="config.endpoint"
                placeholder="http://localhost:9000"
                required
                class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Access Key ID</label>
                <input
                  v-model="config.accessKeyId"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-300"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Secret Access Key</label>
                <input
                  v-model="config.secretAccessKey"
                  type="password"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-300"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Bucket Name</label>
                <input
                  v-model="config.bucket"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-300"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Region</label>
                <input
                  v-model="config.region"
                  placeholder="us-east-1"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 text-sm transition-all duration-300 placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors">
              <input type="checkbox" v-model="config.useSSL" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 focus:ring-2 transition-all" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Use SSL/TLS</span>
            </label>
            
            <button type="submit" class="w-full px-4 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:brightness-110 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl active:scale-[0.98]">
              Connect to S3
            </button>
          </form>

          <!-- Status Card -->
          <div v-if="s3Status" class="rounded-xl border border-gray-200/70 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800/70 dark:bg-gray-900/50">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Connection Status</h3>
              <span
                :class="
                  s3Status.connected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                "
                class="px-3 py-1 rounded-full text-xs font-semibold"
              >
                {{ s3Status.connected ? "Connected" : "Disconnected" }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Notes</div>
                <div class="text-xl font-black text-gray-900 dark:text-gray-100">{{ s3Status.totalNotes || 0 }}</div>
              </div>
              <div v-if="s3Status.oldestEntry" class="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Oldest Note</div>
                <div class="text-xs font-bold text-gray-900 dark:text-gray-100">{{ new Date(s3Status.oldestEntry).toLocaleDateString() }}</div>
              </div>
            </div>
          </div>

          <!-- Sync Controls -->
          <div class="space-y-3">
            <button
              @click="fullSync"
              :disabled="syncing || !s3Connected"
              class="w-full px-4 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:brightness-110 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed dark:disabled:from-gray-700 dark:disabled:to-gray-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <svg v-if="syncing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ syncing ? 'Syncing...' : 'Sync Now' }}
            </button>

            <!-- Progress -->
            <div v-if="syncing" class="rounded-xl bg-gray-50 p-4 dark:bg-gray-950/50">
              <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">{{ statusMessage }}</div>
              <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                <div class="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300" :style="{ width: total > 0 ? (progress / total * 100) + '%' : '0%' }"></div>
              </div>
              <div class="text-xs text-center text-gray-600 dark:text-gray-400">{{ progress }} / {{ total }} notes</div>
            </div>

            <!-- Result -->
            <div v-if="syncResult" class="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Sync Complete</span>
              </div>
              <div class="text-xs text-emerald-600 dark:text-emerald-400">
                Uploaded {{ syncResult.uploaded.new + syncResult.uploaded.updated }}, Downloaded {{ syncResult.downloaded.new + syncResult.downloaded.updated }}
              </div>
            </div>
          </div>

          <!-- Sync Logs -->
          <div v-if="syncLogs.length" class="rounded-xl border border-gray-200/70 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800/70 dark:bg-gray-900/50">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Sync Logs</h3>
              <button @click="syncLogs = []" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors">Clear</button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-3 max-h-40 overflow-y-auto">
              <div v-for="(log, i) in syncLogs" :key="i" class="text-[11px] font-mono text-gray-700 dark:text-gray-300 py-1 leading-relaxed">{{ log }}</div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="rounded-xl border border-red-200/60 bg-red-50/50 p-4 backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-red-700 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LockScreen from "@/components/LockScreen.vue";
import ToastHost from "@/components/ToastHost.vue";
import { Plus, Lock, Database, BarChart3, ArrowLeft, Sun, Moon } from "lucide-vue-next";
import { useThemeStore } from "@/stores/theme.js";
import { db, getAllNotes, getPurgedNotes, isNotePurged } from "@/db";
import { AwsClient } from "aws4fetch";

const isUnlocked = ref(false);
const route = useRoute();
const router = useRouter();
const theme = useThemeStore();

const s3PanelOpen = ref(localStorage.getItem("s3_panel_open") !== "false");
const syncing = ref(false);
const pendingSync = ref(false);
const suppressDbHook = ref(false);
const syncLogs = ref([]);
const syncResult = ref(null);
const error = ref("");
const progress = ref(0);
const total = ref(0);
const statusMessage = ref("");
const s3Status = ref({ connected: false, totalNotes: 0, oldestEntry: null });
const s3Connected = ref(false);
const s3LastSync = ref(0);

const config = reactive({
  endpoint: localStorage.getItem("s3_endpoint") || "http://localhost:9000",
  accessKeyId: localStorage.getItem("s3_accessKeyId") || "",
  secretAccessKey: localStorage.getItem("s3_secretAccessKey") || "",
  bucket: localStorage.getItem("s3_bucket") || "notes",
  region: localStorage.getItem("s3_region") || "us-east-1",
  useSSL: localStorage.getItem("s3_useSSL") === "true" || false,
});

let s3Client = null;
let BUCKET_NAME = config.bucket;
let debounceTimer = null;
let intervalId = null;
let cleanupHooks = [];

const userID = db.name;

const isPublicShareRoute = computed(() => {
  return route.name === "ipfs-note" || route.name === "ipfs-note-key";
});

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const s3IndicatorLabel = computed(() => {
  if (!isS3Configured()) return "S3 off";
  if (syncing.value) return "Syncing";
  if (error.value) return "S3 error";
  return s3Connected.value ? "S3 on" : "S3 idle";
});

const s3IndicatorDotClass = computed(() => {
  if (!isS3Configured()) return "bg-gray-400";
  if (error.value) return "bg-red-500";
  if (syncing.value) return "bg-emerald-400 animate-pulse";
  return s3Connected.value ? "bg-emerald-500" : "bg-emerald-300";
});

const handleUnlock = () => {
  location.reload();
};

const generateRandomId = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const handleNewNote = () => {
  router.push(`/notes/${generateRandomId()}/edit`);
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.clear();
    location.reload();
  }
};

function toggleS3Panel(open) {
  s3PanelOpen.value = open;
  localStorage.setItem("s3_panel_open", open ? "true" : "false");
}

function addSyncLog(...args) {
  const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
  syncLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (syncLogs.value.length > 100) syncLogs.value.shift();
}

function streamToString(stream) {
  const reader = stream.getReader();
  let result = "";
  return (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    return result;
  })();
}

function arrayBufferToBase64(buffer) {
  if (!buffer || buffer.byteLength === 0) return null;
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  if (!base64 || typeof base64 !== "string") return null;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function isS3Configured() {
  return Boolean(
    config.endpoint &&
      config.accessKeyId &&
      config.secretAccessKey &&
      config.bucket &&
      config.region
  );
}

function createS3Client() {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region || "us-east-1",
    service: "s3",
  });
}

function ensureClient() {
  if (!isUnlocked.value) return false;
  if (!isS3Configured()) return false;
  if (!s3Client || BUCKET_NAME !== config.bucket) {
    s3Client = createS3Client();
    BUCKET_NAME = config.bucket;
  }
  return true;
}

async function ensureBucket() {
  const url = `${config.endpoint}/${BUCKET_NAME}`;
  try {
    await s3Client.fetch(url, { method: "HEAD" });
  } catch (err) {
    await s3Client.fetch(url, { method: "PUT" });
  }
}

function applyConfig() {
  localStorage.setItem("s3_endpoint", config.endpoint);
  localStorage.setItem("s3_accessKeyId", config.accessKeyId);
  localStorage.setItem("s3_secretAccessKey", config.secretAccessKey);
  localStorage.setItem("s3_bucket", config.bucket);
  localStorage.setItem("s3_region", config.region);
  localStorage.setItem("s3_useSSL", config.useSSL ? "true" : "false");
  s3Client = createS3Client();
  BUCKET_NAME = config.bucket;
  checkS3Status();
  scheduleSync("config-update");
}

async function checkS3Status() {
  if (!ensureClient()) return;
  try {
    const bucketUrl = `${config.endpoint}/${BUCKET_NAME}`;
    let bucketResp = await s3Client.fetch(bucketUrl, { method: "HEAD" });
    if (bucketResp.status === 404) {
      await s3Client.fetch(bucketUrl, { method: "PUT" });
    }
    s3Status.value.connected = true;
    s3Connected.value = true;

    let totalNotes = 0;
    let oldestEntry = null;
    
    const listUrl = `${config.endpoint}/${BUCKET_NAME}?list-type=2&prefix=${encodeURIComponent(userID + "/")}`;
    const listResp = await s3Client.fetch(listUrl);
    const xmlText = await listResp.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const contents = xmlDoc.getElementsByTagName("Contents");
    
    if (contents.length > 0) {
      const uniqueNotes = new Set();
      for (let i = 0; i < contents.length; i++) {
        const keyEl = contents[i].getElementsByTagName("Key")[0];
        const lastModifiedEl = contents[i].getElementsByTagName("LastModified")[0];
        
        if (keyEl) {
          const filename = keyEl.textContent.split("/").pop();
          const match = filename.match(/^(.+)-(\d+)\.json$/);
          if (match) {
            const [, noteID] = match;
            uniqueNotes.add(noteID);
            if (lastModifiedEl) {
              const lastModified = new Date(lastModifiedEl.textContent);
              if (!oldestEntry || lastModified < oldestEntry) {
                oldestEntry = lastModified;
              }
            }
          }
        }
      }
      totalNotes = uniqueNotes.size;
    }
    s3Status.value = { connected: true, totalNotes, oldestEntry };
  } catch (e) {
    s3Status.value.connected = false;
    s3Connected.value = false;
    error.value = "Failed to connect to S3";
  }
}

async function fullSync() {
  if (!ensureClient()) return;

  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;

  suppressDbHook.value = true;
  try {
    addSyncLog("🔄 Starting full sync...");
    await ensureBucket();
    const localNotes = await getAllNotes();
    
    const listUrl = `${config.endpoint}/${BUCKET_NAME}?list-type=2&prefix=${encodeURIComponent(userID + "/")}`;
    const listResp = await s3Client.fetch(listUrl);
    const xmlText = await listResp.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const contents = xmlDoc.getElementsByTagName("Contents");
    
    const cloudObjects = [];
    for (let i = 0; i < contents.length; i++) {
      const keyEl = contents[i].getElementsByTagName("Key")[0];
      if (keyEl) {
        cloudObjects.push({ Key: keyEl.textContent });
      }
    }

    const cloudNotes = {};
    const filesToDelete = [];

    for (const obj of cloudObjects) {
      const filename = obj.Key.split("/").pop();
      const match = filename.match(/^(.+)-(\d+)\.json$/);

      if (match) {
        const [, noteID, timestampStr] = match;
        const timestamp = parseInt(timestampStr, 10);

        if (!cloudNotes[noteID] || timestamp > cloudNotes[noteID].timestamp) {
          if (cloudNotes[noteID]) {
            filesToDelete.push(cloudNotes[noteID].key);
          }

          cloudNotes[noteID] = {
            key: obj.Key,
            noteID,
            timestamp,
          };
        } else {
          filesToDelete.push(obj.Key);
        }
      } else {
        filesToDelete.push(obj.Key);
      }
    }

    const uploaded = { new: 0, updated: 0, deleted: 0 };
    const downloaded = { new: 0, updated: 0, skipped: 0 };

    total.value = localNotes.length;
    for (let i = 0; i < localNotes.length; i++) {
      const localNote = localNotes[i];
      progress.value = i + 1;
      statusMessage.value = `Processing ${localNote.id}...`;

      const localTimestamp = new Date(localNote.updatedAt).getTime();
      const cloudNote = cloudNotes[localNote.id];
      const needsUpload = !cloudNote || localTimestamp > cloudNote.timestamp;

      if (needsUpload) {
        // Skip upload for soft-deleted notes older than 7 days (should be purged)
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (localNote.deletedAt && Date.now() - localNote.deletedAt > sevenDays) {
          addSyncLog(`⏭️ Skipping expired deleted note: ${localNote.id}`);
          continue;
        }

        if (cloudNote) {
          try {
            const deleteUrl = `${config.endpoint}/${BUCKET_NAME}/${cloudNote.key}`;
            await s3Client.fetch(deleteUrl, { method: "DELETE" });
          } catch (e) {
            addSyncLog("⚠️ Failed to delete old version:", e?.message || e);
          }
        }

        const s3Key = `${userID}/${localNote.id}-${localTimestamp}.json`;
        const noteBody = JSON.stringify({
          noteID: localNote.id,
          userID,
          content: localNote.content,
          updatedAt: localNote.updatedAt,
          deletedAt: localNote.deletedAt || null,
          attachments: (localNote.attachments || []).map((att) => ({
            ...att,
            data: att.data ? arrayBufferToBase64(att.data) : null,
          })),
        });
        
        const putUrl = `${config.endpoint}/${BUCKET_NAME}/${s3Key}`;
        await s3Client.fetch(putUrl, {
          method: "PUT",
          body: noteBody,
          headers: { "Content-Type": "application/json" },
        });

        if (cloudNote) uploaded.updated++;
        else uploaded.new++;
      }
    }

    // Delete purged notes from S3
    const purgedNotes = getPurgedNotes();
    for (const noteID of Object.keys(purgedNotes)) {
      if (cloudNotes[noteID]) {
        try {
          const deleteUrl = `${config.endpoint}/${BUCKET_NAME}/${cloudNotes[noteID].key}`;
          await s3Client.fetch(deleteUrl, { method: "DELETE" });
          addSyncLog(`🗑️ Deleted purged note from S3: ${noteID}`);
          uploaded.deleted++;
          delete cloudNotes[noteID]; // Remove from download list
        } catch (e) {
          addSyncLog("⚠️ Failed to delete purged note:", e?.message || e);
        }
      }
    }

    for (const noteID in cloudNotes) {
      const cloudNote = cloudNotes[noteID];
      
      // Skip if note was purged locally
      if (isNotePurged(noteID)) {
        addSyncLog(`⏭️ Skipping purged note: ${noteID}`);
        downloaded.skipped++;
        continue;
      }
      
      const existsLocal = await db.notes.get(noteID);

      if (!existsLocal || new Date(existsLocal.updatedAt).getTime() < cloudNote.timestamp) {
        const getUrl = `${config.endpoint}/${BUCKET_NAME}/${cloudNote.key}`;
        const resp = await s3Client.fetch(getUrl);
        const data = await resp.text();
        const noteData = JSON.parse(data);
        
        // Skip if deletedAt is older than 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (noteData.deletedAt && Date.now() - noteData.deletedAt > sevenDays) {
          addSyncLog(`⏭️ Skipping expired deleted note from cloud: ${noteID}`);
          downloaded.skipped++;
          continue;
        }

        if (existsLocal) {
          await db.notes.delete(noteID);
        }

        const attachments = (noteData.attachments || []).map((att) => ({
          ...att,
          data: att.data ? base64ToArrayBuffer(att.data) : null,
        }));

        await db.notes.add({
          id: noteData.noteID,
          content: noteData.content,
          updatedAt: noteData.updatedAt,
          deletedAt: noteData.deletedAt || null,
          attachments,
        });

        if (existsLocal) downloaded.updated++;
        else downloaded.new++;
      }
    }

    if (filesToDelete.length > 0) {
      for (const key of filesToDelete) {
        try {
          const deleteUrl = `${config.endpoint}/${BUCKET_NAME}/${key}`;
          await s3Client.fetch(deleteUrl, { method: "DELETE" });
        } catch (e) {
          addSyncLog("⚠️ Failed to delete:", e?.message || e);
        }
      }
    }

    syncResult.value = { uploaded, downloaded };
    statusMessage.value = "Sync complete!";
    s3LastSync.value = Date.now();
    await checkS3Status();
  } catch (e) {
    addSyncLog("❌ Sync failed:", e?.message || e);
    error.value = e?.message || "Failed to complete sync";
  } finally {
    syncing.value = false;
    suppressDbHook.value = false;
  }
}

async function triggerSync(reason = "manual") {
  if (!ensureClient()) return;
  if (syncing.value) {
    pendingSync.value = true;
    return;
  }

  addSyncLog("🔄 Auto sync:", reason);
  await fullSync();
  if (pendingSync.value) {
    pendingSync.value = false;
    triggerSync("queued");
  }
}

function scheduleSync(reason = "db-change") {
  if (!ensureClient()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => triggerSync(reason), 1500);
}

function registerDbHooks() {
  const onChange = () => {
    if (suppressDbHook.value) return;
    scheduleSync("db-change");
  };

  cleanupHooks = [
    db.notes.hook("creating", onChange),
    db.notes.hook("updating", onChange),
    db.notes.hook("deleting", onChange),
  ];
}

function cleanupDbHooks() {
  for (const hook of cleanupHooks) {
    if (hook && typeof hook.unsubscribe === "function") {
      hook.unsubscribe();
    }
  }
  cleanupHooks = [];
}

onMounted(() => {
  if (sessionStorage.getItem("ENCRYPTION_KEY")) {
    isUnlocked.value = true;
  }

  registerDbHooks();
  if (isS3Configured()) {
    s3Client = createS3Client();
    BUCKET_NAME = config.bucket;
    checkS3Status();
    triggerSync("startup");
  }

  intervalId = setInterval(() => {
    triggerSync("interval-15m");
  }, 15 * 60 * 1000);
});

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (intervalId) clearInterval(intervalId);
  cleanupDbHooks();
});

watch(
  () => config.bucket,
  (val) => {
    BUCKET_NAME = val;
  }
);
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

.dark body {
  background-color: #030712;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #0b1220;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
