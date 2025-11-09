<template>
  <div class="flex h-screen bg-[#F9FAFB] overflow-hidden">
    <!-- Premium Sidebar -->
    <aside class="w-20 bg-[#F9FAFB] border-r border-gray-200 flex flex-col items-center py-6 gap-6 flex-shrink-0">
      <!-- Logo with hover effect -->
      <div class="relative group cursor-pointer">
        <div class="w-12 h-12 bg-black rounded-[14px] flex items-center justify-center shadow-card transition-all duration-300 group-hover:scale-105 group-hover:shadow-card-hover">
          <span class="text-white font-bold text-xl tracking-tight">A</span>
        </div>
        <!-- Subtle glow on hover -->
        <div class="absolute inset-0 bg-black/10 rounded-[14px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>

      <!-- Divider -->
      <div class="w-8 h-px bg-black/[0.06]" />

      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col gap-3" role="navigation" aria-label="Main navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:ring-offset-2"
          :class="$route.path === item.path ? 'bg-black text-white shadow-md' : 'text-text-secondary hover:bg-black/5'"
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
          
          <!-- Elegant Tooltip -->
          <div class="absolute left-full ml-3 px-3 py-2 bg-black text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none transition-all duration-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            {{ item.label }}
            <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black" />
          </div>
        </NuxtLink>
      </nav>

      <!-- User Avatar -->
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-card cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-card-hover flex items-center justify-center">
        <span class="text-xs font-bold text-text-primary">AD</span>
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
