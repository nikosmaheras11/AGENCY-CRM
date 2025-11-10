<template>
  <div class="flex h-screen bg-gradient-dark overflow-hidden">
    <!-- Elevated Glass Sidebar -->
    <aside class="w-20 bg-white/[0.05] backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 gap-6 flex-shrink-0">
      <!-- Logo with gradient glow -->
      <div class="relative group cursor-pointer">
        <div class="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_6px_20px_rgba(67,24,255,0.5)]">
          <span class="text-white font-bold text-xl tracking-tight">A</span>
        </div>
        <!-- Purple glow on hover -->
        <div class="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>

      <!-- Divider -->
      <div class="w-8 h-px bg-white/10" />

      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col gap-3" role="navigation" aria-label="Main navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          :class="$route.path === item.path ? 'bg-gradient-primary text-white shadow-primary' : 'text-gray-400 hover:bg-white/5'"
          :aria-label="item.label"
          :aria-current="$route.path === item.path ? 'page' : undefined"
        >
          <span 
            class="material-icons text-xl transition-transform duration-300"
            :class="{
              'group-hover:scale-110': $route.path !== item.path,
              'font-bold': $route.path === item.path
            }"
          >
            {{ item.icon }}
          </span>
          
          <!-- Glass Tooltip -->
          <div class="absolute left-full ml-3 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none transition-all duration-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            {{ item.label }}
            <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white/10" />
          </div>
        </NuxtLink>
      </nav>

      <!-- User Avatar -->
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-300 to-primary-400 shadow-primary cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_16px_rgba(67,24,255,0.4)] flex items-center justify-center">
        <span class="text-xs font-bold text-white">AD</span>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-auto">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: 'home', label: 'Overview' },
  { path: '/creative', icon: 'palette', label: 'Creative Hub' },
  { path: '/performance', icon: 'trending_up', label: 'Performance' },
  { path: '/projects', icon: 'view_kanban', label: 'Projects' },
]

// Head configuration for fonts
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap'
    }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<style>
/* Global typography system */
* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6, .font-display {
  font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'cv05', 'cv11';
}

/* Tabular numbers for metrics */
.font-variant-tabular {
  font-variant-numeric: tabular-nums;
}

/* Smooth transitions globally */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 250ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* Focus visible styles */
*:focus-visible {
  outline: 2px solid #E8FF00;
  outline-offset: 2px;
}
</style>
