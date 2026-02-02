import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

export default boot(({ app, router, store }) => {
  const authStore = useAuthStore(store)

  // --- INTERCEPTOR DE REQUISIÇÃO ---
  api.interceptors.request.use((config) => {
    
    // Tenta pegar da Store OU direto do navegador (Garantia dupla)
    // Nota: Certifique-se que no auth.js você salvou como 'access_token'
    const token = authStore.token || localStorage.getItem('access_token')

    // DEBUG: Mostra no console o que está sendo enviado
    if (token) {
      console.log('>>> [AXIOS] Token anexado:', token.substring(0, 10) + '...')
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('>>> [AXIOS] Sem token! Enviando requisição anônima.')
    }
    
    return config
  }, (error) => {
    return Promise.reject(error)
  })

  // --- INTERCEPTOR DE RESPOSTA ---
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error('>>> [AXIOS] Erro 401: Token inválido ou expirado.')
        
        authStore.logout()
        
        if (router.currentRoute.value.path !== '/login') {
            router.push('/login') 
        }
      }
      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }