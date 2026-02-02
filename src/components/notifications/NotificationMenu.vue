<template>
  <q-btn round dense flat icon="notifications" class="q-mr-sm text-grey-7">
    <q-badge v-if="unreadCount > 0" color="red" floating rounded dot />
    
    <q-menu class="notification-menu" style="width: 400px; max-width: 90vw;">
      <div class="row no-wrap q-pa-md bg-navy text-white items-center">
        <div class="text-subtitle1 text-weight-bold">Notificações</div>
        <q-space />
        <q-btn flat round dense icon="done_all" size="sm" @click="markAllRead" v-if="unreadCount > 0">
           <q-tooltip>Marcar todas como lidas</q-tooltip>
        </q-btn>
      </div>

      <q-list separator class="scroll" style="max-height: 400px">
        <div v-if="notifications.length === 0" class="text-center q-pa-xl text-grey-6 column flex-center">
           <q-icon name="notifications_off" size="md" class="q-mb-sm opacity-50"/>
           <div>Nenhuma notificação nova.</div>
        </div>

        <q-item 
           v-for="notif in notifications" 
           :key="notif.id" 
           class="q-py-md transition-hover"
           :class="{'bg-blue-1': !notif.is_read}"
        >
          <q-item-section avatar top>
             <q-avatar :icon="getIcon(notif.type)" :color="getColor(notif.type)" text-color="white" size="md" font-size="20px" />
          </q-item-section>

          <q-item-section>
             <div class="row items-center justify-between no-wrap q-mb-xs">
                <div class="text-weight-bold text-navy ellipsis" style="max-width: 200px">{{ notif.title }}</div>
                <div class="text-caption text-grey-6">{{ formatDate(notif.created_at) }}</div>
             </div>
             
             <div class="text-body2 text-grey-8" style="line-height: 1.3;">{{ notif.message }}</div>

             <div v-if="notif.related_split && !notif.action_taken" class="q-mt-sm row q-gutter-x-sm">
                <q-btn 
                   v-if="notif.type === 'SPLIT_CREATED'"
                   unelevated dense size="sm" color="green-7" icon="edit_document" 
                   label="Lançar Despesa" 
                   class="q-px-md"
                   @click.stop="triggerConciliation(notif)" 
                />
                
                <q-btn 
                   v-if="notif.type === 'SPLIT_PAID'"
                   unelevated dense size="sm" color="blue-8" icon="check_circle" label="Confirmar Recebimento" 
                   class="q-px-md"
                   :loading="loadingAction === notif.id"
                   @click.stop="handleSimpleAction(notif, 'CONFIRMED')" 
                />
             </div>
             <div v-else-if="notif.related_split" class="q-mt-xs text-caption text-green-7 row items-center">
                <q-icon name="check" size="xs" class="q-mr-xs"/> Ação realizada
             </div>
          </q-item-section>

          <q-item-section side top>
             <q-btn flat round dense icon="close" size="xs" color="grey-5" @click.stop="markAsRead(notif)" />
             <div v-if="!notif.is_read" class="bg-blue q-mt-xs rounded-borders" style="width: 8px; height: 8px; border-radius: 50%; align-self: center;"></div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import { date, useQuasar } from 'quasar'

export default {
  name: 'NotificationMenu',
  emits: ['open-conciliation'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const notifications = ref([])
    const loadingAction = ref(null) 
    let pollingInterval = null

    const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

    const loadNotifications = async () => {
       try {
          const res = await api.get('/finance/notifications/')
          // Filtra para remover notificações onde a ação já foi tomada, se desejado
          // notifications.value = res.data.results.filter(n => !n.action_taken) 
          notifications.value = res.data.results || res.data
       } catch (e) { console.error('Erro ao carregar notificações', e) }
    }

    onMounted(() => {
        loadNotifications()
        pollingInterval = setInterval(loadNotifications, 15000)
    })

    onUnmounted(() => {
        if (pollingInterval) clearInterval(pollingInterval)
    })

    const getIcon = (type) => {
       if (type === 'SPLIT_CREATED') return 'receipt_long'
       if (type === 'SPLIT_PAID') return 'savings'
       if (type === 'SPLIT_CONFIRMED') return 'verified'
       return 'notifications'
    }

    const getColor = (type) => {
       if (type === 'SPLIT_CREATED') return 'orange-8'
       if (type === 'SPLIT_PAID') return 'green-7'
       if (type === 'SPLIT_CONFIRMED') return 'blue-7'
       return 'grey-7'
    }

    const formatDate = (val) => {
        const d = new Date(val)
        const diff = date.getDateDiff(new Date(), d, 'days')
        if (diff === 0) return date.formatDate(d, 'HH:mm')
        if (diff === 1) return 'Ontem'
        return date.formatDate(d, 'DD/MM')
    }

    const triggerConciliation = (notif) => {
        const titleLower = (notif.title || '').toLowerCase()
        const msgLower = (notif.message || '').toLowerCase()
        
        const isRecurrentHint = 
            titleLower.includes('recorrente') || 
            msgLower.includes('recorrente') || 
            /\(\d+x\)/.test(msgLower)

        emit('open-conciliation', {
            id: notif.related_split,
            description: notif.split_description || notif.title, 
            value: notif.split_amount || 0,
            date: notif.split_date,
            is_recurrent: isRecurrentHint 
        })
        markAsRead(notif)
    }

    const handleSimpleAction = async (notif, newStatus) => {
       if (!notif.related_split) return
       loadingAction.value = notif.id 

       try {
          // 1. Envia a mudança para o backend
          await api.post(`/finance/transaction-splits/${notif.related_split}/change_status/`, { status: newStatus })
          
          // 2. Marca a notificação como lida (opcional, já que vamos esconder)
          await markAsRead(notif)
          
          // 3. Força recarregamento da lista do servidor
          // Como o backend agora filtra SPLIT_PAID confirmados, ela sumirá da lista
          await loadNotifications() 
          
          $q.notify({ type: 'positive', message: 'Status atualizado com sucesso!', position: 'top' })
       } catch {
          $q.notify({ type: 'negative', message: 'Erro ao atualizar.' })
       } finally {
          loadingAction.value = null
       }
    }

    const markAsRead = async (notif) => {
       try {
          if(!notif.is_read) {
              await api.post(`/finance/notifications/${notif.id}/mark_read/`)
              notif.is_read = true
          }
       } catch (e) { console.error(e) }
    }

    const markAllRead = async () => {
        notifications.value.forEach(async n => {
            if (!n.is_read) await markAsRead(n)
        })
    }

    return { 
        notifications, unreadCount, loadingAction,
        getIcon, getColor, formatDate, 
        triggerConciliation, handleSimpleAction, markAsRead, markAllRead, loadNotifications // <--- EXPOSTO
    }
  }
}
</script>

<style scoped>
.bg-navy { background-color: #051933; }
.text-navy { color: #051933; }
.opacity-50 { opacity: 0.5; }
.transition-hover:hover { background-color: #f5f5f5; }
</style>