<template>
  <q-page class="q-pa-sm q-pa-md-md bg-grey-2">
    
    <div class="row items-center justify-between q-mb-md">
      <div class="col-12 col-md-auto q-mb-sm q-mb-md-none">
        <div class="text-h5 text-navy text-weight-bold">Visão Geral</div>
        <div class="text-caption text-grey-7">
          Resumo financeiro de <span class="text-weight-bold text-navy">{{ currentData.label }}</span>.
        </div>
      </div>
      
      <div class="col-12 col-md-auto">
        <q-btn-dropdown 
          outline 
          color="navy" 
          :label="currentData.label" 
          no-caps 
          class="full-width bg-white text-navy" 
          icon="calendar_today"
        >
          <q-list>
            <q-item 
              v-for="(data, key) in mockDB" 
              :key="key" 
              clickable 
              v-close-popup 
              @click="selectedMonthKey = key"
              :active="selectedMonthKey === key"
              active-class="bg-cyan-1 text-cyan-brand"
            >
              <q-item-section>
                <q-item-label>{{ data.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="selectedMonthKey === key">
                <q-icon name="check" color="cyan-brand" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-col-gutter-md-md q-mb-lg">
      
      <div class="col-12 col-md-4">
        <q-card class="bg-navy text-white full-height shadow-3 rounded-borders">
          <q-card-section class="q-pa-lg relative-position">
            <div class="text-caption text-cyan-brand text-uppercase text-weight-bold q-mb-xs">Saldo em Conta</div>
            
            <transition name="fade" mode="out-in">
              <div :key="currentData.balance" class="text-h4 text-weight-bolder">
                {{ formatMoney(currentData.balance) }}
              </div>
            </transition>

            <q-icon name="account_balance_wallet" size="60px" class="absolute-right q-pa-md text-white-10" />
            
            <div class="q-mt-md text-caption text-grey-4 row items-center">
              <q-icon :name="currentData.balanceTrend === 'up' ? 'trending_up' : 'trending_down'" 
                      :color="currentData.balanceTrend === 'up' ? 'green-4' : 'red-4'" class="q-mr-xs" /> 
              {{ currentData.balanceChange }} vs mês anterior
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-4">
        <q-card flat bordered class="bg-white text-navy full-height rounded-borders">
          <q-card-section>
            <div class="row items-center no-wrap q-mb-sm">
              <div class="bg-green-1 text-green-8 rounded-borders q-pa-xs q-mr-sm">
                <q-icon name="arrow_upward" size="16px" />
              </div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Receitas</div>
            </div>
            
            <transition name="fade" mode="out-in">
              <div :key="currentData.income" class="text-h5 text-weight-bold text-green-9">
                + {{ formatMoney(currentData.income) }}
              </div>
            </transition>
            <q-linear-progress :value="0.75" color="green-6" class="q-mt-md" rounded size="6px" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-4">
        <q-card flat bordered class="bg-white text-navy full-height rounded-borders">
          <q-card-section>
            <div class="row items-center no-wrap q-mb-sm">
              <div class="bg-red-1 text-red-8 rounded-borders q-pa-xs q-mr-sm">
                <q-icon name="arrow_downward" size="16px" />
              </div>
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Despesas</div>
            </div>

            <transition name="fade" mode="out-in">
              <div :key="currentData.expense" class="text-h5 text-weight-bold text-red-9">
                - {{ formatMoney(currentData.expense) }}
              </div>
            </transition>
            <q-linear-progress :value="0.45" color="red-6" class="q-mt-md" rounded size="6px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-col-gutter-md-md q-mb-lg">
      
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders full-height">
          <q-card-section class="row items-center justify-between q-pb-none">
            <div class="text-subtitle1 text-weight-bold text-navy">
              <q-icon name="flag" color="purple" class="q-mr-sm"/> Metas Financeiras
            </div>
            <q-btn flat round icon="more_horiz" color="grey-7" size="sm" />
          </q-card-section>

          <q-card-section>
            <div v-if="!currentData.goals.length" class="text-grey-5 text-center q-pa-md">
              <q-icon name="flag" size="md" />
              <div>Nenhuma meta definida.</div>
            </div>

            <div v-for="goal in currentData.goals" :key="goal.id" class="q-mb-md">
              <div class="row justify-between text-caption text-weight-bold q-mb-xs text-grey-8">
                <span>{{ goal.name }}</span>
                <span :class="goal.percent >= 100 ? 'text-green-7' : 'text-navy'">
                  {{ formatMoney(goal.current) }} / {{ formatMoney(goal.target) }}
                </span>
              </div>
              <q-linear-progress 
                size="8px" 
                :value="goal.percent / 100" 
                :color="goal.percent >= 100 ? 'green' : goal.color" 
                track-color="grey-2"
                rounded
                animation-speed="1000"
              >
                <q-tooltip>{{ goal.percent }}%</q-tooltip>
              </q-linear-progress>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders full-height bg-white column">
          <q-card-section class="bg-navy text-white q-py-sm">
            <div class="text-subtitle2 text-weight-bold row items-center">
              <q-icon name="checklist" class="q-mr-sm text-cyan-brand"/> Minhas Listas
            </div>
          </q-card-section>
          
          <q-scroll-area class="col" style="min-height: 200px;">
            <q-list separator>
               <q-item 
                v-for="(task, i) in currentData.todoList" 
                :key="i" 
                tag="label" 
                v-ripple
                :class="{ 'bg-grey-1': task.done }"
              >
                <q-item-section side top>
                  <q-checkbox v-model="task.done" color="cyan-brand" />
                </q-item-section>

                <q-item-section>
                  <q-item-label :class="{ 'text-strike text-grey-5': task.done, 'text-weight-medium text-navy': !task.done }">
                    {{ task.label }}
                  </q-item-label>
                  <q-item-label caption v-if="task.category">
                    <q-badge :color="task.catColor" outline rounded :label="task.category" class="q-mr-xs" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>
    </div>

    <div class="q-mb-xl q-pb-xl">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-weight-bold text-navy">Movimentações Recentes</div>
        <q-btn flat dense no-caps label="Ver extrato completo" color="primary" to="/transactions" size="sm" />
      </div>

      <q-card flat bordered class="rounded-borders">
        <q-list separator>
          <q-item v-for="trans in currentData.transactions" :key="trans.id" clickable v-ripple class="q-py-md">
            <q-item-section avatar>
              <q-avatar 
                :color="trans.type === 'expense' ? 'red-1' : 'green-1'" 
                :text-color="trans.type === 'expense' ? 'red-9' : 'green-9'" 
                :icon="trans.icon" 
                font-size="20px"
              />
            </q-item-section>
            
            <q-item-section>
              <div class="text-weight-bold text-navy">{{ trans.name }}</div>
              <div class="text-caption text-grey-6">{{ trans.category }} • {{ trans.date }}</div>
            </q-item-section>
            
            <q-item-section side>
              <div :class="trans.type === 'expense' ? 'text-red-9' : 'text-green-9'" class="text-weight-bold text-body1">
                {{ trans.type === 'expense' ? '-' : '+' }} {{ formatMoney(trans.value) }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <div class="desktop-dock-container gt-sm bg-navy text-white shadow-up-10">
      
      <div class="dock-handle row justify-center items-center">
        <div class="bg-cyan-brand rounded-borders" style="width: 50px; height: 4px; opacity: 0.8"></div>
      </div>

      <div class="dock-content row justify-center items-center q-gutter-lg">
        
        <q-btn round color="white" text-color="navy" icon="add_circle" size="lg" to="/transactions/new" class="dock-btn">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" class="bg-navy text-weight-bold">
            Novo Lançamento
          </q-tooltip>
        </q-btn>

        <q-btn round color="white" text-color="navy" icon="flag" size="lg" @click="openGoalDialog = true" class="dock-btn">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" class="bg-navy text-weight-bold">
            Nova Meta
          </q-tooltip>
        </q-btn>

        <q-btn round color="white" text-color="navy" icon="checklist" size="lg" @click="openListDialog = true" class="dock-btn">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" class="bg-navy text-weight-bold">
            Nova Lista
          </q-tooltip>
        </q-btn>

      </div>
    </div>

    <transition name="scale">
      <q-page-sticky position="bottom-right" :offset="[18, 18]" class="lt-md z-top" v-if="!mobileMenuOpen">
        <q-btn 
          fab 
          icon="widgets" 
          color="navy" 
          text-color="cyan-brand" 
          class="shadow-10"
          @click="mobileMenuOpen = true"
        />
      </q-page-sticky>
    </transition>

    <transition name="slide-up">
      <q-page-sticky position="bottom" expand class="lt-md z-top" v-if="mobileMenuOpen">
        <div class="bg-navy text-white shadow-up-4 row justify-around items-center q-py-sm rounded-top-borders relative-position">
          
          <q-btn flat round dense icon="keyboard_arrow_down" color="grey-5" class="absolute-top-right q-mr-sm q-mt-xs" @click="mobileMenuOpen = false" />

          <q-btn flat stack no-caps class="q-mx-xs" to="/transactions/new">
            <q-icon name="add_circle" color="cyan-brand" size="24px" />
            <div class="text-caption q-mt-xs" style="font-size: 11px">Lançar</div>
          </q-btn>

          <q-btn flat stack no-caps class="q-mx-xs" @click="openGoalDialog = true">
            <q-icon name="flag" color="white" size="24px" />
            <div class="text-caption q-mt-xs" style="font-size: 11px">Meta</div>
          </q-btn>

          <q-btn flat stack no-caps class="q-mx-xs" @click="openListDialog = true">
            <q-icon name="checklist" color="white" size="24px" />
            <div class="text-caption q-mt-xs" style="font-size: 11px">Lista</div>
          </q-btn>
          
        </div>
      </q-page-sticky>
    </transition>


    <q-dialog v-model="openGoalDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-navy">Nova Meta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input outlined dense label="Nome da Meta" color="navy" autofocus />
          <q-input outlined dense label="Valor Alvo" prefix="R$" color="navy" type="number" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Criar Meta" color="navy" unelevated v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openListDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-navy">Nova Lista</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input outlined dense label="Nome da Lista" color="navy" autofocus />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Criar Lista" color="navy" unelevated v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'IndexPage',
  setup() {
    const selectedMonthKey = ref('2026-01')
    const openGoalDialog = ref(false)
    const openListDialog = ref(false)
    const mobileMenuOpen = ref(true)

    // DADOS MOCKADOS
    const mockDB = {
      '2026-02': {
        label: 'Fevereiro, 2026',
        balance: 13500.00, balanceChange: '+8%', balanceTrend: 'up', income: 6100.00, expense: 4050.00,
        goals: [{ id: 1, name: 'Viagem Carnaval', current: 1800, target: 2000, percent: 90, color: 'orange' }, { id: 2, name: 'Reserva Emergência', current: 5600, target: 10000, percent: 56, color: 'blue' }],
        todoList: [{ label: 'Pagar IPVA (Cota 2)', done: false, category: 'Impostos', catColor: 'red' }, { label: 'Revisão do Carro', done: false, category: 'Carro', catColor: 'grey' }],
        transactions: [{ id: 1, name: 'Posto Shell', category: 'Transporte', value: 250.00, type: 'expense', icon: 'local_gas_station', date: '02/02' }, { id: 2, name: 'Cliente Freela', category: 'Receita Extra', value: 800.00, type: 'income', icon: 'attach_money', date: '01/02' }]
      },
      '2026-01': {
        label: 'Janeiro, 2026',
        balance: 12450.00, balanceChange: '+12%', balanceTrend: 'up', income: 5200.00, expense: 1840.50,
        goals: [{ id: 1, name: 'Viagem Carnaval', current: 500, target: 2000, percent: 25, color: 'orange' }, { id: 2, name: 'Trocar Celular', current: 3000, target: 3000, percent: 100, color: 'green' }],
        todoList: [{ label: 'Fazer compras do mês', done: true, category: 'Casa', catColor: 'orange' }, { label: 'Pagar IPVA (Cota 1)', done: true, category: 'Impostos', catColor: 'red' }, { label: 'Cotar Seguro Auto', done: false, category: 'Carro', catColor: 'blue' }],
        transactions: [{ id: 10, name: 'Supermercado Extra', category: 'Alimentação', value: 450.20, type: 'expense', icon: 'shopping_cart', date: '15/01' }, { id: 11, name: 'Salário Mensal', category: 'Trabalho', value: 5200.00, type: 'income', icon: 'work', date: '05/01' }, { id: 12, name: 'Netflix', category: 'Lazer', value: 55.90, type: 'expense', icon: 'movie', date: '02/01' }]
      },
      '2025-12': {
        label: 'Dezembro, 2025',
        balance: 11000.00, balanceChange: '-2%', balanceTrend: 'down', income: 8500.00, expense: 6000.00,
        goals: [{ id: 3, name: 'Presentes Natal', current: 2000, target: 2000, percent: 100, color: 'red' }],
        todoList: [{ label: 'Comprar Peru', done: true, category: 'Natal', catColor: 'red' }, { label: 'Planejar 2026', done: true, category: 'Planejamento', catColor: 'grey' }],
        transactions: [{ id: 20, name: 'Shopping Center', category: 'Presentes', value: 1200.00, type: 'expense', icon: 'card_giftcard', date: '24/12' }, { id: 21, name: 'Décimo Terceiro', category: 'Trabalho', value: 4500.00, type: 'income', icon: 'account_balance', date: '20/12' }]
      }
    }

    const currentData = computed(() => mockDB[selectedMonthKey.value] || mockDB['2026-01'])
    const formatMoney = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return { selectedMonthKey, mockDB, currentData, formatMoney, openGoalDialog, openListDialog, mobileMenuOpen }
  }
}
</script>

<style scoped>
/* CORES E ESTILOS GERAIS */
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.text-cyan-brand { color: #2eb7e6; }
.bg-cyan-brand { background-color: #2eb7e6; }
.bg-cyan-1 { background-color: #e6f7ff; }
.text-white-10 { color: rgba(255,255,255,0.1); }
.rounded-top-borders { border-top-left-radius: 16px; border-top-right-radius: 16px; }
.z-top { z-index: 2000; }

/* ANIMAÇÕES VUE */
.scale-enter-active, .scale-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.scale-enter-from, .scale-leave-to { transform: scale(0); opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* --- CSS DO DOCK DESKTOP (EFEITO GAVETA) --- */
.desktop-dock-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  
  /* Altura da gaveta aberta */
  height: 100px; 
  
  /* Esconde 85px para baixo, deixa só 15px visíveis */
  transform: translateY(85px); 
  
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  z-index: 5000;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  
  display: flex;
  flex-direction: column;
}

/* No Hover, puxa a gaveta para cima (posição original) */
.desktop-dock-container:hover {
  transform: translateY(0);
}

.dock-handle {
  height: 15px;
  width: 100%;
  cursor: pointer;
}

.dock-content {
  flex: 1;
  padding-bottom: 10px;
}

.dock-btn {
  transition: transform 0.2s;
}
.dock-btn:hover {
  transform: scale(1.1);
}
</style>