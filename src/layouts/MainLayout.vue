<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">

    <q-header class="bg-white text-grey-9 shadow-1">
      <q-toolbar class="q-py-sm">
        
        <q-btn
          flat dense round icon="menu" aria-label="Menu"
          @click="toggleLeftDrawer" class="q-mr-sm"
        />

        <q-toolbar-title class="text-weight-bold text-navy">
          Painel de Controle
        </q-toolbar-title>

        <q-space />

        <div class="row items-center q-gutter-sm">
          
          <NotificationMenu ref="notifMenuRef" @open-conciliation="openConciliationForm" />

          <q-btn flat no-caps class="q-pl-xs">
            <div class="column items-end q-mr-sm gt-xs">
              <div class="text-weight-bold text-body2">{{ userName }}</div>
              <div class="text-caption text-grey-6">{{ userRole }}</div>
            </div>
            
            <q-avatar size="36px" class="bg-navy text-white shadow-2">
              <span>{{ userInitials }}</span>
            </q-avatar>
            
            <q-menu auto-close>
              <q-list style="min-width: 150px">
                <q-item clickable @click="openMyProfile">
                  <q-item-section>Meu Perfil</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable class="text-red" @click="handleLogout">
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above bordered :width="260"
      class="bg-navy text-white"
    >
      <div class="column full-height">
        <div class="q-pa-md row items-center q-mb-md">
          <div class="bg-white rounded-borders flex flex-center q-mr-md" style="width: 40px; height: 40px; border-radius: 8px;">
            <q-icon name="trending_up" color="navy" size="24px" />
          </div>
          <div>
            <div class="text-weight-bold text-h6" style="line-height: 1.1">Meu Gestor</div>
            <div class="text-caption text-cyan-brand">Financeiro</div>
          </div>
        </div>

        <q-scroll-area class="col">
          <q-list padding class="menu-list">
             <q-item clickable v-ripple to="/finance" active-class="active-menu-item"><q-item-section avatar><q-icon name="account_balance" /></q-item-section><q-item-section>Finanças</q-item-section></q-item>
             <q-item clickable v-ripple to="/settings" active-class="active-menu-item"><q-item-section avatar><q-icon name="settings" /></q-item-section><q-item-section>Configurações</q-item-section></q-item>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <UserForm 
      v-model="showProfileDialog" 
      :user-to-edit="currentUserData" 
      :loading="savingProfile" 
      @save="saveMyProfile" 
    />

    <TransactionForm 
      v-model="showGlobalForm" 
      :transaction-to-edit="formInitialData"
      @save="handleGlobalSave" 
    />

  </q-layout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'
import UserForm from 'components/UserForm.vue'
import NotificationMenu from 'src/components/notifications/NotificationMenu.vue'
import TransactionForm from 'src/components/finance/TransactionForm.vue'

export default {
  name: 'MainLayout',
  components: { UserForm, NotificationMenu, TransactionForm },

  setup () {
    const $q = useQuasar()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const leftDrawerOpen = ref(false)
    const notifMenuRef = ref(null) // <--- REF PARA O MENU
    
    // Perfil
    const showProfileDialog = ref(false)
    const savingProfile = ref(false)
    const currentUserData = ref(null)

    // Conciliação Global
    const showGlobalForm = ref(false)
    const formInitialData = ref(null)

    const userName = computed(() => {
       if (authStore.user) return `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim() || authStore.user.username
       return 'Carregando...'
    })

    const userRole = computed(() => authStore.user?.is_staff ? 'Administrador' : 'Usuário')

    const userInitials = computed(() => {
       const name = userName.value
       if (!name || name === 'Carregando...') return '...'
       const parts = name.split(' ')
       if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
       return name.substring(0, 2).toUpperCase()
    })

    const openConciliationForm = (splitData) => {
        formInitialData.value = {
            description: `Rateio: ${splitData.description}`,
            value: splitData.value,
            date: splitData.date || date.formatDate(new Date(), 'YYYY-MM-DD'),
            type: 'EXPENSE',
            resolve_split_id: splitData.id,
            is_recurrent: splitData.is_recurrent
        }
        showGlobalForm.value = true
    }

    const handleGlobalSave = async (formData) => {
        try {
            if (formData.id) {
                // Se tem ID, é Edição -> PUT
                await api.put(`/finance/transactions/${formData.id}/`, formData)
                $q.notify({ type: 'positive', message: 'Transação atualizada!' })
            } else {
                // Se não tem ID, é Novo/Conciliação -> POST
                await api.post('/finance/transactions/', formData)
                $q.notify({ type: 'positive', message: 'Lançamento realizado!' })
            }
            
            showGlobalForm.value = false
            
            if (notifMenuRef.value) {
                notifMenuRef.value.loadNotifications()
            }
            
            // Dica: Se estiver na tela de transações, talvez precise recarregar a lista lá também.
            // O ideal seria usar um Store (Pinia) ou EventBus.

        } catch (error) {
            console.error(error)
            $q.notify({ type: 'negative', message: 'Erro ao salvar.' })
        }
    }

    onMounted(async () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user_data')
      if (!token) return router.push('/login')
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      if (storedUser && !authStore.user) authStore.user = JSON.parse(storedUser)
      
      const userId = authStore.user?.id || JSON.parse(storedUser || '{}').id
      if (userId) {
        try {
          const { data } = await api.get(`/auth/users/${userId}/`)
          authStore.user = data
          localStorage.setItem('user_data', JSON.stringify(data))
        } catch (error) { if (error.response?.status === 401) handleLogout() }
      }
    })

    const openMyProfile = () => { currentUserData.value = { ...authStore.user, password: '' }; showProfileDialog.value = true }

    const saveMyProfile = (userData) => {
      savingProfile.value = true
      const id = userData.id
      let payload = { ...userData }; delete payload.avatarFile; if (!payload.password) delete payload.password
      api.put(`/auth/users/${id}/`, payload)
        .then((response) => {
          $q.notify({ type: 'positive', message: 'Atualizado!' })
          authStore.user = response.data
          localStorage.setItem('user_data', JSON.stringify(response.data))
          showProfileDialog.value = false
        })
        .catch(() => { $q.notify({ type: 'negative', message: 'Erro.' }) })
        .finally(() => { savingProfile.value = false })
    }

    const handleLogout = () => {
      localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); localStorage.removeItem('user_data')
      delete api.defaults.headers.common['Authorization']
      authStore.logout()
      router.push('/login')
    }

    return {
      authStore, leftDrawerOpen, toggleLeftDrawer () { leftDrawerOpen.value = !leftDrawerOpen.value },
      userName, userRole, userInitials, showProfileDialog, currentUserData, savingProfile,
      openMyProfile, saveMyProfile, handleLogout,
      // Conciliação
      showGlobalForm, formInitialData, openConciliationForm, handleGlobalSave, notifMenuRef
    }
  }
}
</script>

<style scoped>
.bg-navy { background-color: #051933; }
.text-navy { color: #051933; }
.text-cyan-brand { color: #2eb7e6; }
.active-menu-item { color: #2eb7e6 !important; background-color: rgba(46, 183, 230, 0.1); border-right: 3px solid #2eb7e6; }
.menu-list .q-item:hover { color: #2eb7e6 !important; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>