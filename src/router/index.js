import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth' // Importe a store

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // --- GUARDA DE ROTA ---
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // Se a rota exige auth e não tem token
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })

  return Router
})