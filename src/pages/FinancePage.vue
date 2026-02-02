<template>
  <q-page class="bg-grey-2">
    
    <div class="bg-white q-py-md q-px-xl border-bottom shadow-0 sticky-top z-10">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-x-lg">
          <div class="text-h6 text-navy text-weight-bold letter-spacing-1">Dashboard</div>
          
          <q-btn-dropdown flat dense no-caps color="grey-8" :label="dateLabel" icon="calendar_today" class="bg-grey-1 q-px-sm rounded-borders">
            <div class="row no-wrap q-pa-md">
              <div class="column q-gutter-y-sm q-mr-md" style="min-width: 150px">
                <q-btn flat align="left" label="Este Mês" @click="setDateRange('thisMonth')" dense color="navy" />
                <q-btn flat align="left" label="Últimos 30 dias" @click="setDateRange('30days')" dense color="navy" />
                <q-btn flat align="left" label="Este Ano" @click="setDateRange('thisYear')" dense color="navy" />
              </div>
              <q-separator vertical class="q-mx-sm" />
              <div class="column"><q-date v-model="dateRange" range mask="YYYY-MM-DD" color="navy" flat minimal @update:model-value="loadData" /></div>
            </div>
          </q-btn-dropdown>
        </div>

        <div class="row q-gutter-sm">
          <q-btn round flat icon="refresh" color="grey-6" @click="loadData" :loading="loading"><q-tooltip>Atualizar</q-tooltip></q-btn>
          <q-btn unelevated color="navy" icon="add" label="Novo Lançamento" class="q-px-lg" @click="openForm()" />
        </div>
      </div>
    </div>

    <div class="q-pa-lg full-width q-mx-auto" style="max-width: 1800px;">

      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-white full-height">
            <q-card-section>
              <div class="text-caption text-grey-6 text-weight-bold">Entradas</div>
              <div class="text-h4 text-weight-bolder text-green-7 q-mt-sm">{{ formatCurrency(dashboardData.income) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-white full-height">
            <q-card-section>
              <div class="text-caption text-grey-6 text-weight-bold">Saídas</div>
              <div class="text-h4 text-weight-bolder text-red-8 q-mt-sm">{{ formatCurrency(dashboardData.expense) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="full-height text-white" :class="dashboardData.balance >= 0 ? 'bg-navy' : 'bg-red-9'">
            <q-card-section>
              <div class="text-caption text-blue-1 text-weight-bold">Saldo Líquido</div>
              <div class="text-h4 text-weight-bolder q-mt-sm">{{ formatCurrency(dashboardData.balance) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-white full-height">
            <q-card-section class="row items-center justify-between no-wrap">
              <div>
                <div class="text-caption text-grey-6 text-weight-bold">Economia</div>
                <div class="text-h4 text-weight-bolder text-navy q-mt-sm">{{ dashboardData.savingsRate }}%</div>
              </div>
              <q-circular-progress show-value class="text-navy" :value="Math.max(0, dashboardData.savingsRate)" size="70px" :thickness="0.15" :color="dashboardData.savingsRate > 20 ? 'green' : 'orange'" track-color="grey-2" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="bg-white q-mb-xl overflow-hidden">
        
        <div class="row items-center justify-between q-pr-md border-bottom">
          <q-tabs
            v-model="tab"
            class="text-grey-7"
            active-color="navy"
            indicator-color="navy"
            align="left"
            narrow-indicator
            @update:model-value="resetAutoPlayTimer" 
          >
            <q-tab name="overview" label="Visão Geral" icon="dashboard" />
            <q-tab name="expenses" label="Detalhamento" icon="pie_chart" />
            <q-tab name="credit" label="Cartão" icon="credit_card" />
            <q-tab name="refunds" label="Reembolsos & Dívidas" icon="swap_horiz" />
          </q-tabs>

          <div class="row items-center q-gutter-x-sm bg-grey-1 q-px-sm rounded-borders" style="height: 36px;">
              <div class="text-caption text-grey-6 q-mr-xs gt-xs">
                {{ isPlaying ? `Próximo em ${timeRemaining}s` : 'Pausado' }}
              </div>
              <q-btn :icon="isPlaying ? 'pause' : 'play_arrow'" flat round dense :color="isPlaying ? 'navy' : 'grey-7'" @click="togglePlay" />
              <q-separator vertical inset />
              <q-btn-dropdown flat dense no-caps :label="(cycleDuration || 10) + 's'" color="grey-8" content-class="bg-white" size="sm">
                 <q-list dense>
                    <q-item clickable v-close-popup @click="changeDuration(5)"><q-item-section>5s</q-item-section></q-item>
                    <q-item clickable v-close-popup @click="changeDuration(10)"><q-item-section>10s</q-item-section></q-item>
                    <q-item clickable v-close-popup @click="changeDuration(30)"><q-item-section>30s</q-item-section></q-item>
                 </q-list>
              </q-btn-dropdown>
          </div>
        </div>

        <q-linear-progress v-if="isPlaying" :value="progressValue" color="navy" track-color="transparent" size="2px" animation-speed="200"/>

        <q-tab-panels v-model="tab" animated class="q-pa-md">
          
          <q-tab-panel name="overview">
            <div class="row q-col-gutter-lg">
               <div class="col-12 col-md-8">
                  <div class="text-subtitle1 text-weight-bold text-navy q-mb-md">Evolução do Saldo (Acumulado)</div>
                  <apexchart type="line" height="350" :options="chartEvolutionOptions" :series="chartEvolutionSeries" />
               </div>
               <div class="col-12 col-md-4">
                  <div class="text-subtitle1 text-weight-bold text-navy q-mb-md">Fontes de Renda</div>
                  <div v-if="incomeSeries.length > 0"><apexchart type="pie" height="300" :options="incomeOptions" :series="incomeSeries" /></div>
                  <div v-else class="flex flex-center bg-grey-1 rounded-borders" style="height: 300px"><div class="text-grey-6">Sem receitas</div></div>
               </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="expenses">
            <div class="row q-col-gutter-lg">
               <div class="col-12 col-md-6">
                  <div class="row justify-between items-center q-mb-md">
                     <div class="text-subtitle1 text-weight-bold text-navy">{{ chartLevel === 'category' ? 'Por Categoria' : `Detalhes: ${selectedCategoryName}` }}</div>
                     <q-btn v-if="chartLevel === 'subcategory'" flat dense size="sm" icon="arrow_back" label="Voltar" color="navy" @click="resetDrillDown" />
                  </div>
                  <apexchart type="donut" height="350" :options="dynamicChartOptions" :series="dynamicChartSeries" />
               </div>
               <div class="col-12 col-md-6">
                  <div class="text-subtitle1 text-weight-bold text-navy q-mb-md">Top 5 Maiores Gastos</div>
                  <q-list separator bordered class="rounded-borders">
                     <q-item v-for="item in topExpenses" :key="item.id" class="q-py-md">
                        <q-item-section avatar><q-avatar size="36px" :style="{ backgroundColor: getCategoryColor(item) }" text-color="white"><q-icon :name="item.category_icon || 'category'" size="18px" /></q-avatar></q-item-section>
                        <q-item-section><q-item-label class="text-weight-bold text-navy">{{ item.description }}</q-item-label><q-item-label caption>{{ item.category_name }} • {{ item.dateFormatted }}</q-item-label></q-item-section>
                        <q-item-section side><div class="text-subtitle2 text-red-9">{{ formatCurrency(item.value) }}</div></q-item-section>
                     </q-item>
                  </q-list>
               </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="credit">
             <div class="row q-col-gutter-lg items-center">
                <div class="col-12 col-md-4 text-center">
                   <div class="text-caption text-uppercase text-grey-7 text-weight-bold">Fatura Estimada</div>
                   <div class="text-h3 text-weight-bolder text-navy q-my-md">{{ formatCurrency(creditCardStats.total) }}</div>
                   <div class="text-caption text-grey-6">Representa <b>{{ creditCardStats.percentage }}%</b> dos gastos.</div>
                   <q-linear-progress :value="creditCardStats.percentage / 100" color="navy" track-color="grey-3" class="q-mt-md rounded-borders" size="8px" />
                </div>
                <div class="col-12 col-md-4">
                   <div v-if="creditCardSeries.length > 0"><apexchart type="donut" height="280" :options="creditCardOptions" :series="creditCardSeries" /></div>
                   <div v-else class="text-center text-grey">Sem uso de cartão.</div>
                </div>
                <div class="col-12 col-md-4">
                   <div class="text-subtitle2 text-navy q-mb-sm">Últimas compras no crédito</div>
                   <q-list dense separator>
                      <q-item v-for="item in creditCardTopList" :key="item.id">
                         <q-item-section><q-item-label>{{ item.description }}</q-item-label></q-item-section>
                         <q-item-section side class="text-red-8 text-weight-bold">{{ formatCurrency(item.value) }}</q-item-section>
                      </q-item>
                   </q-list>
                </div>
             </div>
          </q-tab-panel>

          <q-tab-panel name="refunds">
             <div class="row q-col-gutter-lg">
                
                <div class="col-12 col-md-6 border-right-md">
                   <div class="row items-center justify-between q-mb-md">
                      <div class="text-subtitle1 text-weight-bold text-green-8"><q-icon name="arrow_downward" /> A Receber ({{ formatCurrency(totalReceivable) }})</div>
                      <q-badge color="grey-3" text-color="grey-8" label="Ref. Mês Selecionado" />
                   </div>
                   
                   <div class="scroll-list-container">
                       <div v-if="creditsList.length === 0" class="text-center q-pa-lg text-grey-5 bg-grey-1 rounded-borders">Ninguém te deve neste mês.</div>
                       
                       <q-list v-else separator class="bg-white rounded-borders border">
                          <q-item v-for="split in creditsList" :key="split.uniqueId" class="q-py-sm">
                             <q-item-section avatar><q-avatar color="green-1" text-color="green-8" icon="person" size="md" /></q-item-section>
                             <q-item-section>
                                <q-item-label class="text-weight-bold text-navy">{{ split.user_name }}</q-item-label>
                                <q-item-label caption>{{ split.description }}</q-item-label>
                             </q-item-section>
                             <q-item-section side>
                                <div class="text-caption text-grey-6 text-right">{{ split.dateFormatted }}</div>
                                <div class="text-weight-bold text-green-8 text-right">{{ formatCurrency(Math.abs(split.value)) }}</div>
                                <div class="row justify-end q-mt-xs">
                                   <q-btn v-if="split.status === 'PAID_BY_DEBTOR'" flat dense size="sm" color="blue" label="Confirmar" @click="confirmReceipt(split)" />
                                   <q-badge v-else color="grey-3" text-color="grey-8" label="Pendente" />
                                </div>
                             </q-item-section>
                          </q-item>
                       </q-list>
                   </div>
                </div>

                <div class="col-12 col-md-6">
                   <div class="row items-center justify-between q-mb-md">
                      <div class="text-subtitle1 text-weight-bold text-red-8"><q-icon name="arrow_upward" /> A Pagar ({{ formatCurrency(totalPayable) }})</div>
                      <q-badge color="grey-3" text-color="grey-8" label="Ref. Mês Selecionado" />
                   </div>

                   <div class="scroll-list-container">
                       <div v-if="debtsList.length === 0" class="text-center q-pa-lg text-grey-5 bg-grey-1 rounded-borders">Nada a pagar neste mês.</div>

                       <q-list v-else separator class="bg-white rounded-borders border">
                          <q-item v-for="split in debtsList" :key="split.id" class="q-py-sm">
                             <q-item-section avatar><q-avatar color="red-1" text-color="red-8" icon="money_off" size="md" /></q-item-section>
                             <q-item-section>
                                <q-item-label class="text-weight-bold text-navy">{{ split.creditor_name || 'Credor' }}</q-item-label>
                                <q-item-label caption>{{ split.description }}</q-item-label>
                             </q-item-section>
                             <q-item-section side>
                                <div class="text-caption text-grey-6 text-right">{{ split.dateFormatted }}</div>
                                <div class="text-weight-bold text-red-8 text-right">{{ formatCurrency(Math.abs(split.value)) }}</div>
                                <div class="row justify-end q-mt-xs">
                                   <q-badge v-if="split.status === 'PAID_BY_DEBTOR'" color="orange" text-color="white" label="Aguardando Confirmação" />
                                   <q-btn v-else unelevated size="sm" color="green" label="Pagar" icon="check" @click="openPayForm(split)" />
                                </div>
                             </q-item-section>
                          </q-item>
                       </q-list>
                   </div>
                </div>

             </div>
          </q-tab-panel>

        </q-tab-panels>
      </q-card>

      <q-table flat :rows="transactions" :columns="columns" :loading="loading" :filter="filter" row-key="id" :pagination="{ rowsPerPage: 15 }" class="bg-white no-border">
        <template v-slot:top><div class="text-h6 text-navy text-weight-bold">Extrato Financeiro</div><q-space /><q-input dense outlined v-model="filter" placeholder="Pesquisar..." class="bg-grey-1" style="min-width: 250px"><template v-slot:append><q-icon name="search" color="grey-5" /></template></q-input></template>
        <template v-slot:body-cell-description="props">
          <q-td :props="props">
            <div class="row items-center">
              <div :style="{ backgroundColor: getCategoryColor(props.row) }" class="category-dot q-mr-md"></div>
              <div>
                <div class="text-weight-bold text-grey-9">{{ props.row.description }}</div>
                <div class="text-caption text-grey-6 row items-center q-gutter-x-sm">
                  <span v-if="props.row.recurrence_id">Recorrente</span>
                  <div v-if="props.row.splits && props.row.splits.length > 0" class="row items-center">
                     <span class="q-mx-xs">| Rateio:</span>
                     <q-badge v-if="props.row.splits.every(s => s.is_paid)" color="green-1" text-color="green-8" label="Recebido" rounded dense />
                     <q-badge v-else color="orange-1" text-color="orange-8" label="Pendente" rounded dense />
                  </div>
                </div>
              </div>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-category="props"><q-td :props="props"><span class="text-grey-8">{{ props.row.category_name || '-' }}</span></q-td></template>
        <template v-slot:body-cell-value="props"><q-td :props="props" class="text-right"><span :class="props.row.type === 'INCOME' ? 'text-green-7' : 'text-grey-9'" class="text-weight-bold font-mono">{{ props.row.type === 'INCOME' ? '+' : '' }} {{ formatCurrency(props.row.value) }}</span></q-td></template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.row.is_paid ? 'green-1' : 'orange-1'" :text-color="props.row.is_paid ? 'green-9' : 'orange-9'" :label="!props.row.is_paid ? 'Pendente' : 'Pago'" />
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props"><q-td :props="props" align="right"><q-btn flat round dense icon="edit" color="grey-6" size="sm" @click="openForm(props.row)" /><q-btn flat round dense icon="delete" color="grey-6" size="sm" @click="handleDeleteClick(props.row)" /></q-td></template>
      </q-table>
    </div>

    <TransactionForm v-model="showForm" :transaction-to-edit="transactionToEdit" :loading="saving" @save="handleSave" />
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center"><q-avatar icon="delete" color="red-1" text-color="red" /><span class="q-ml-sm text-h6 text-navy">Excluir Recorrência</span></q-card-section>
        <q-card-actions class="column q-gutter-y-sm q-pa-md">
          <q-btn outline color="primary" class="full-width" label="Apenas este" @click="confirmDelete('single')" />
          <q-btn outline color="primary" class="full-width" label="Este e os próximos" @click="confirmDelete('future')" />
          <q-btn outline color="primary" class="full-width" label="Todos" @click="confirmDelete('all')" />
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="full-width" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import { useAuthStore } from 'stores/auth'
import TransactionForm from 'src/components/finance/TransactionForm.vue'
import VueApexCharts from "vue3-apexcharts"

const DEFAULT_COLORS = ['#051933', '#2eb7e6', '#e91e63', '#ff9800', '#4caf50', '#9c27b0', '#795548', '#607d8b'];

const adjustBrightness = (hex, percent) => {
    if (!hex) return '#9e9e9e'; 
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) hex = hex.replace(/(.)/g, '$1$1');
    var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
    return '#' + ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) + ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) + ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(val || 0)

export default {
  name: 'FinancePage',
  components: { TransactionForm, apexchart: VueApexCharts },
  setup() {
    const $q = useQuasar()
    const authStore = useAuthStore()
    const loading = ref(false)
    const saving = ref(false)
    const filter = ref('')
    const dateRange = ref({ from: date.formatDate(date.startOfDate(new Date(), 'month'), 'YYYY-MM-DD'), to: date.formatDate(date.endOfDate(new Date(), 'month'), 'YYYY-MM-DD') })
    const transactions = ref([])
    const allSplits = ref([])
    const userMap = ref({}) 
    const categories = ref([]) 
    const showForm = ref(false)
    const transactionToEdit = ref(null)
    const showDeleteDialog = ref(false)
    const transactionToDelete = ref(null)
    
    // Autoplay
    const tab = ref('overview')
    const tabList = ['overview', 'expenses', 'credit', 'refunds']
    const isPlaying = ref(false)
    const cycleDuration = ref(10)
    const timeRemaining = ref(10)
    let autoPlayInterval = null, countdownInterval = null

    const startAutoPlay = () => {
        clearInterval(autoPlayInterval); clearInterval(countdownInterval)
        isPlaying.value = true; timeRemaining.value = cycleDuration.value
        countdownInterval = setInterval(() => { if (timeRemaining.value > 0) timeRemaining.value-- }, 1000)
        autoPlayInterval = setInterval(() => {
            const currentIndex = tabList.indexOf(tab.value)
            tab.value = tabList[(currentIndex + 1) % tabList.length]
            timeRemaining.value = cycleDuration.value
        }, cycleDuration.value * 1000)
    }
    const stopAutoPlay = () => { clearInterval(autoPlayInterval); clearInterval(countdownInterval); isPlaying.value = false }
    const togglePlay = () => { if (isPlaying.value) stopAutoPlay(); else startAutoPlay() }
    const changeDuration = (val) => { cycleDuration.value = val; if (isPlaying.value) startAutoPlay() }
    const resetAutoPlayTimer = () => { if (isPlaying.value) startAutoPlay() }
    const progressValue = computed(() => isPlaying.value ? 1 - (timeRemaining.value / cycleDuration.value) : 0)
    onUnmounted(() => stopAutoPlay())

    const dateLabel = computed(() => {
        if (!dateRange.value) return 'Selecione'; 
        if (typeof dateRange.value === 'string') return date.formatDate(dateRange.value, 'DD/MM/YYYY'); 
        if (dateRange.value.from && dateRange.value.to) return `${date.formatDate(dateRange.value.from, 'DD/MM')} - ${date.formatDate(dateRange.value.to, 'DD/MM/YYYY')}`; 
        return 'Período'
    })

    const loadData = async () => {
      loading.value = true
      try {
        let start, end;
        if (typeof dateRange.value === 'string') { start = dateRange.value; end = dateRange.value; } else { start = dateRange.value.from; end = dateRange.value.to; }
        
        const transRes = await api.get('/finance/transactions/', { params: { start_date: start, end_date: end } })
        transactions.value = transRes.data.results || transRes.data
        
        const splitRes = await api.get('/finance/transaction-splits/') 
        allSplits.value = splitRes.data.results || splitRes.data

        resetDrillDown()
      } catch { $q.notify({ type: 'negative', message: 'Erro ao carregar dados.' }) } finally { loading.value = false }
    }

    const loadDependencies = async () => {
       try {
          const [uRes, cRes] = await Promise.all([
             api.get('/auth/users/'),
             api.get('/finance/categories/')
          ])
          const users = uRes.data.results || uRes.data
          users.forEach(u => { userMap.value[u.id] = u.username })
          categories.value = cRes.data.results || cRes.data
       } catch (e) { console.error(e) }
    }

    const getCategoryColor = (row) => {
        if (row.category_color) return row.category_color;
        const cat = categories.value.find(c => c.name === row.category_name);
        return cat ? cat.color : '#9e9e9e';
    }

    const setDateRange = (type) => {
        const today = new Date(); let from, to;
        if (type === 'thisMonth') { from = date.startOfDate(today, 'month'); to = date.endOfDate(today, 'month') }
        else if (type === '30days') { to = today; from = date.subtractFromDate(today, { days: 30 }) }
        else if (type === 'thisYear') { from = date.startOfDate(today, 'year'); to = date.endOfDate(today, 'year') }
        dateRange.value = { from: date.formatDate(from, 'YYYY-MM-DD'), to: date.formatDate(to, 'YYYY-MM-DD') }; loadData()
    }

    const dashboardData = computed(() => {
      let income = 0, expense = 0;
      transactions.value.forEach(t => { if (t.type === 'INCOME') income += Number(t.value); else expense += Math.abs(Number(t.value)) })
      let savingsRate = 0; if (income > 0) savingsRate = Math.round(((income - expense) / income) * 100)
      return { income, expense: -expense, balance: income - expense, savingsRate }
    })

    const chartEvolutionSeries = computed(() => { 
        const dailyMap = {};
        transactions.value.forEach(t => {
            const d = t.date;
            if (!dailyMap[d]) dailyMap[d] = 0;
            const val = t.type === 'EXPENSE' ? -Math.abs(Number(t.value)) : Math.abs(Number(t.value));
            dailyMap[d] += val;
        });
        const sortedDates = Object.keys(dailyMap).sort();
        let accumulated = 0;
        const dataPoints = sortedDates.map(d => {
            accumulated += dailyMap[d];
            return { x: d, y: accumulated };
        });
        return [{ name: 'Saldo Acumulado', data: dataPoints }]
    })
    
    const chartEvolutionOptions = ref({ 
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Roboto, sans-serif' }, 
        dataLabels: { enabled: false }, 
        stroke: { curve: 'straight', width: 2, colors: ['#051933'] }, 
        xaxis: { type: 'datetime' }, 
        yaxis: { labels: { formatter: (val) => formatCurrency(val) } },
        colors: ['#051933'], 
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] } }, 
        tooltip: { theme: 'light', y: { formatter: (val) => formatCurrency(val) } },
        grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
        markers: { size: 4, hover: { size: 6 } }
    })

    const myId = computed(() => authStore.user?.id)
    
    // Lista "A RECEBER" (Créditos)
    const creditsList = computed(() => {
        const list = []
        transactions.value.forEach(t => {
            if (t.splits && t.splits.length > 0) {
                t.splits.forEach(s => {
                    if (!s.is_paid) {
                        list.push({
                            uniqueId: t.id + s.user,
                            user_name: userMap.value[s.user] || 'Alguém',
                            value: s.value,
                            description: t.description,
                            dateFormatted: date.formatDate(t.date, 'DD/MM/YYYY'),
                            status: s.status,
                            originalTransaction: t, 
                            id: s.id 
                        })
                    }
                })
            }
        })
        return list
    })

    // Lista "A PAGAR" (Dívidas) - CORRIGIDO
    // Cruzamos os dados: Se a transação do split (related_transaction) 
    // ESTÁ na lista de transações visíveis no extrato (transactions.value), então mostramos.
    const debtsList = computed(() => {
        // Cria um Set com os IDs das transações visíveis no mês
        const visibleTransactionIds = new Set(transactions.value.map(t => t.id));

        return allSplits.value
            .filter(s => {
                const isMe = s.user === myId.value;
                const isPending = !['CONFIRMED', 'REJECTED'].includes(s.status);
                
                // O PULO DO GATO: Verifica se a transação atrelada a este split
                // está visível no painel atual (ou seja, se é do mês selecionado)
                const isVisibleInMonth = s.related_transaction && visibleTransactionIds.has(s.related_transaction);

                return isMe && isPending && isVisibleInMonth;
            })
            .map(s => {
                // Busca a transação original na lista para pegar a data correta
                const transaction = transactions.value.find(t => t.id === s.related_transaction);
                
                return {
                    ...s,
                    creditor_name: 'Credor', 
                    description: transaction ? transaction.description : 'Conta Compartilhada',
                    // Usa a data real da transação visível
                    dateFormatted: transaction ? date.formatDate(transaction.date, 'DD/MM/YYYY') : '-'
                }
            })
            .sort((a, b) => {
               // Ordenação simples por string de data (DD/MM/YYYY) invertida para Date
               if (a.dateFormatted === '-' || b.dateFormatted === '-') return 0;
               const [da, ma, ya] = a.dateFormatted.split('/');
               const [db, mb, yb] = b.dateFormatted.split('/');
               return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
            })
    })

    const totalReceivable = computed(() => creditsList.value.reduce((acc, s) => acc + Math.abs(Number(s.value)), 0))
    const totalPayable = computed(() => debtsList.value.reduce((acc, s) => acc + Math.abs(Number(s.value)), 0))

    const openForm = (row = null) => { if (row) transactionToEdit.value = { ...row }; else transactionToEdit.value = { type: 'EXPENSE' }; showForm.value = true }
    
    const openPayForm = (split) => {
        transactionToEdit.value = {
            description: `Pagamento: ${split.description}`,
            value: Math.abs(Number(split.value)),
            date: date.formatDate(new Date(), 'YYYY-MM-DD'),
            type: 'EXPENSE',
            resolve_split_id: split.id
        }
        showForm.value = true
    }

    const confirmReceipt = async (split) => {
        try {
            await api.post(`/finance/transaction-splits/${split.id}/change_status/`, { status: 'CONFIRMED' })
            $q.notify({ type: 'positive', message: 'Recebimento confirmado!' })
            loadData()
        } catch { $q.notify({ type: 'negative', message: 'Erro ao confirmar.' }) }
    }

    const handleSave = async (formData) => { saving.value = true; try { if (formData.id) { const scope = formData.update_scope || 'single'; await api.put(`/finance/transactions/${formData.id}/?scope=${scope}`, formData); $q.notify({ type: 'positive', message: 'Atualizado!' }) } else { await api.post('/finance/transactions/', formData); $q.notify({ type: 'positive', message: 'Criado!' }) } showForm.value = false; loadData() } catch { $q.notify({ type: 'negative', message: 'Erro ao salvar.' }) } finally { saving.value = false } }
    const handleDeleteClick = (row) => { transactionToDelete.value = row; if (row.recurrence_id) showDeleteDialog.value = true; else $q.dialog({ title: 'Confirmar', message: 'Excluir?', cancel: true }).onOk(() => confirmDelete('single')) }
    const confirmDelete = async (scope) => { if (!transactionToDelete.value) return; try { await api.delete(`/finance/transactions/${transactionToDelete.value.id}/`, { params: { scope } }); $q.notify({ type: 'positive', message: 'Excluído.' }); showDeleteDialog.value = false; loadData() } catch { $q.notify({ type: 'negative', message: 'Erro.' }) } }
    
    const chartLevel = ref('category'), selectedCategoryName = ref(null)
    const topExpenses = computed(() => transactions.value.filter(t => t.type === 'EXPENSE').sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 5).map(t => ({ ...t, dateFormatted: date.formatDate(t.date, 'DD/MM') })))
    const incomeSeries = computed(() => [dashboardData.value.income || 0]); const incomeOptions = computed(() => ({ labels: ['Renda'], colors: ['#4caf50'], legend: { position: 'bottom' } }))
    const creditCardStats = computed(() => { const creditTransactions = transactions.value.filter(t => t.type === 'EXPENSE' && t.credit_card); const total = creditTransactions.reduce((acc, t) => acc + Math.abs(Number(t.value)), 0); const totalExpense = Math.abs(dashboardData.value.expense); const percentage = totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0; return { total: -total, percentage } })
    const creditCardTopList = computed(() => transactions.value.filter(t => t.type === 'EXPENSE' && t.credit_card).sort((a, b) => Math.abs(Number(b.value)) - Math.abs(Number(a.value))).slice(0, 5).map(t => ({ ...t, dateFormatted: date.formatDate(t.date, 'DD/MM') })))
    const creditCardSeries = computed(() => { const map = {}; transactions.value.forEach(t => { if (t.type === 'EXPENSE' && t.credit_card) { const cat = t.category_name || 'Outros'; if(!map[cat]) map[cat] = 0; map[cat] += Math.abs(Number(t.value)) } }); return Object.values(map) })
    const creditCardOptions = computed(() => { const map = {}; transactions.value.forEach(t => { if(t.type === 'EXPENSE' && t.credit_card) { const cat = t.category_name || 'Outros'; if(!map[cat]) map[cat] = 0; map[cat] += Math.abs(Number(t.value)) } }); return { labels: Object.keys(map), colors: ['#051933', '#152b47', '#253d5b', '#354f6f', '#456183'], legend: { position: 'right' }, plotOptions: { pie: { donut: { size: '65%' } } }, dataLabels: { enabled: false }, tooltip: { y: { formatter: (val) => formatCurrency(val) } } } })

    const chartDataProcessed = computed(() => { 
        const dataMap = {}; 
        let colorIndex = 0; 
        transactions.value.forEach(t => { 
            if (t.type === 'EXPENSE') { 
                if (chartLevel.value === 'category') { 
                    const key = t.category_name || 'Outros'; 
                    if (!dataMap[key]) {
                        const fallbackColor = getCategoryColor(t) || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
                        dataMap[key] = { value: 0, color: t.category_color || fallbackColor, label: key }; 
                        if (!t.category_color) colorIndex++;
                    }
                    dataMap[key].value += Math.abs(Number(t.value)) 
                } else { 
                    if (t.category_name === selectedCategoryName.value) { 
                        const key = t.subcategory_name || 'Sem Subcategoria'; 
                        let parentColor = getCategoryColor(t); 
                        if (!dataMap[key]) {
                            dataMap[key] = { value: 0, color: null, label: key, parentColor }; 
                        }
                        dataMap[key].value += Math.abs(Number(t.value)) 
                    } 
                } 
            } 
        }); 
        let dataArray = Object.values(dataMap).sort((a, b) => b.value - a.value);
        if (chartLevel.value === 'subcategory') { 
            dataArray = dataArray.map((item, index) => { 
                const factor = -20 + (index * (80 / Math.max(dataArray.length, 1))); 
                return { ...item, color: adjustBrightness(item.parentColor, factor) } 
            }) 
        }
        return { array: dataArray }
    })

    const dynamicChartSeries = computed(() => chartDataProcessed.value.array.map(item => item.value))
    const dynamicChartOptions = computed(() => { 
        const data = chartDataProcessed.value.array; 
        return { 
            labels: data.map(i => i.label), 
            colors: data.map(i => i.color), 
            legend: { position: 'right' }, 
            plotOptions: { pie: { donut: { size: '65%', labels: { show: true, name: { show: true }, value: { show: true, formatter: (val) => formatCurrency(val) }, total: { show: true, label: chartLevel.value === 'category' ? 'Total' : selectedCategoryName.value, color: '#051933', formatter: (w) => { const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0); return formatCurrency(total) } } } } } }, 
            tooltip: { y: { formatter: (val) => formatCurrency(val) } }, 
            dataLabels: { enabled: false }, 
            chart: { events: { dataPointSelection: (event, chartContext, config) => { if (chartLevel.value === 'category') { const index = config.dataPointIndex; const label = data[index].label; handleChartClick(label) } } } } 
        } 
    })
    
    const handleChartClick = (label) => { selectedCategoryName.value = label; chartLevel.value = 'subcategory' }
    const resetDrillDown = () => { chartLevel.value = 'category'; selectedCategoryName.value = null }

    const columns = [
      { name: 'description', label: 'Descrição', field: 'description', align: 'left', sortable: true },
      { name: 'category', label: 'Categoria', field: 'category_name', align: 'left', sortable: true },
      { name: 'date', label: 'Data', field: 'date', align: 'center', sortable: true, format: val => date.formatDate(val, 'DD/MM') },
      { name: 'value', label: 'Valor', field: 'value', align: 'right', sortable: true },
      { name: 'status', label: 'Status', field: 'is_paid', align: 'center', sortable: true },
      { name: 'actions', label: '', align: 'right' }
    ]

    onMounted(() => { loadData(); loadDependencies() })

    return {
      loading, saving, filter, transactions, columns, dateRange, dateLabel, showForm, transactionToEdit, showDeleteDialog,
      loadData, openForm, handleSave, handleDeleteClick, confirmDelete, setDateRange, formatCurrency,
      tab, isPlaying, timeRemaining, togglePlay, changeDuration, resetAutoPlayTimer, progressValue, cycleDuration,
      dashboardData, chartEvolutionSeries, chartEvolutionOptions, dynamicChartSeries, dynamicChartOptions,
      topExpenses, incomeSeries, incomeOptions, creditCardStats, creditCardTopList, creditCardSeries, creditCardOptions,
      chartLevel, selectedCategoryName, handleChartClick, resetDrillDown,
      creditsList, debtsList, totalReceivable, totalPayable, openPayForm, confirmReceipt, getCategoryColor
    }
  }
}
</script>

<style scoped>
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.border-bottom { border-bottom: 1px solid #e0e0e0; }
.border-right-md { border-right: 1px solid #e0e0e0; }
@media (max-width: 1023px) { .border-right-md { border-right: none; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px; margin-bottom: 16px; } }
.sticky-top { position: sticky; top: 0; z-index: 10; }
.category-dot { width: 10px; height: 10px; border-radius: 50%; }
.font-mono { font-family: 'Roboto Mono', monospace; }

.scroll-list-container {
    height: 400px;
    overflow-y: auto;
    padding-right: 4px;
}
.scroll-list-container::-webkit-scrollbar { width: 6px; }
.scroll-list-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.scroll-list-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
.scroll-list-container::-webkit-scrollbar-thumb:hover { background: #aaa; }
</style>