const routes = [
  // 1. ROTA DE LOGIN
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/LoginPage.vue') }
    ]
  },

  // 2. ROTA PRINCIPAL (Painel)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    // meta: { requiresAuth: true }, 
    children: [
      // Raiz redireciona para Finanças (Home da V1)
      { path: '', redirect: '/finance' }, 
      
      // Módulo Financeiro
      { path: 'finance', name: 'finance', component: () => import('pages/FinancePage.vue') },

      // Configurações (Mantido conforme solicitado)
      { path: 'settings', name: 'settings', component: () => import('pages/SettingsPage.vue') },
    ]
  },

  // 3. ERRO 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes