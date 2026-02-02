<template>
  <q-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :position="dialogPosition"
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-white" :style="cardStyle">
      
      <q-card-section class="row items-center q-py-sm border-bottom bg-white sticky-header">
        <q-btn v-if="isMobile" flat round dense icon="close" v-close-popup class="q-mr-sm" color="grey-8" />
        <div class="text-subtitle1 text-weight-bold text-navy ellipsis">
          {{ dialogTitle }}
        </div>
        <q-space />
        <q-btn v-if="!isMobile" icon="close" flat round dense v-close-popup color="grey-7" />
        <q-btn v-if="isMobile" flat round dense icon="check" color="primary" size="lg" @click="trySave" :loading="loading" />
      </q-card-section>

      <q-card-section class="q-pa-none column scroll-area">
        <q-scroll-area class="col q-pa-md">
          
          <div v-if="isLoadingDependencies" class="row justify-center q-pa-md">
             <q-spinner-dots color="navy" size="40px" />
          </div>

          <div v-else class="row q-col-gutter-md">

            <div class="col-12">
              <div class="bg-grey-2 rounded-borders q-pa-xs row">
                <div v-for="type in transactionTypes" :key="type.value" class="col">
                  <q-btn
                    unelevated class="full-width"
                    :color="form.type === type.value ? 'white' : 'transparent'"
                    :text-color="form.type === type.value ? type.color : 'grey-7'"
                    padding="8px" @click="changeType(type.value)"
                  >
                    <div class="row items-center no-wrap">
                      <q-icon :name="type.icon" size="xs" class="q-mr-xs" />
                      <span class="text-weight-bold text-caption">{{ type.label }}</span>
                    </div>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="col-12 text-center">
              <div class="rounded-borders q-py-lg q-px-md transition-bg relative-position" :class="currentBgColor">
                <div class="text-caption text-uppercase text-weight-bold q-mb-xs opacity-60" :class="currentTextColor">
                  Valor Total da Nota
                </div>
                <div class="row justify-center items-baseline">
                  <span class="text-h5 q-mr-sm" :class="currentTextColor">R$</span>
                  <input 
                    ref="valueInput" v-model="displayValue"
                    class="giant-input text-weight-bold no-outline bg-transparent"
                    :class="currentTextColor" placeholder="0,00" inputmode="numeric"
                    @input="formatDisplayValue" @blur="distributeValues" 
                  />
                </div>
              </div>
            </div>

            <div class="col-12">
              <q-input v-model="form.description" label="Descrição" outlined dense placeholder="Ex: Jantar, Aluguel..." />
            </div>
            <div class="col-12">
              <q-input v-model="form.date" label="Data" outlined dense mask="##/##/####">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="navy">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.date" mask="DD/MM/YYYY" color="navy">
                        <div class="row items-center justify-end"><q-btn v-close-popup label="Fechar" color="primary" flat /></div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <template v-if="form.type === 'TRANSFER'">
              <div class="col-12 col-sm-6">
                <q-select v-model="form.account" :options="accountOptions" label="De (Origem)" outlined dense emit-value map-options>
                   <template v-slot:selected-item="scope">
                     <div class="row items-center">{{ scope.opt.label }}</div>
                   </template>
                   <template v-slot:option="scope">
                     <q-item v-bind="scope.itemProps">
                       <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                     </q-item>
                   </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6">
                <q-select v-model="form.destination_account" :options="accountOptions" label="Para (Destino)" outlined dense emit-value map-options>
                   <template v-slot:selected-item="scope">
                     <div class="row items-center">{{ scope.opt.label }}</div>
                   </template>
                   <template v-slot:option="scope">
                     <q-item v-bind="scope.itemProps">
                       <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                     </q-item>
                   </template>
                </q-select>
              </div>
            </template>

            <template v-else-if="form.type === 'EXPENSE'">
              <div class="col-12">
                 <q-tabs v-model="expenseSource" dense class="text-grey" active-color="navy" indicator-color="navy" align="justify" narrow-indicator>
                    <q-tab name="ACCOUNT" label="Débito (Conta)" icon="account_balance" />
                    <q-tab name="CARD" label="Crédito (Cartão)" icon="credit_card" />
                 </q-tabs>
                 <q-separator />
              </div>
              
              <div class="col-12" v-if="expenseSource === 'ACCOUNT'">
                <q-select v-model="form.account" :options="accountOptions" label="Conta" outlined dense emit-value map-options>
                   <template v-slot:selected-item="scope">
                      <div class="row items-center">
                         <q-avatar size="24px" class="q-mr-sm" square>
                            <img v-if="scope.opt.logo" :src="scope.opt.logo" style="object-fit: contain">
                            <q-icon v-else name="account_balance" size="20px" :style="{ color: scope.opt.color || 'grey' }" />
                         </q-avatar>
                         {{ scope.opt.label }}
                      </div>
                   </template>
                   <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                           <q-avatar square size="28px">
                             <img v-if="scope.opt.logo" :src="scope.opt.logo" style="object-fit: contain">
                             <q-icon v-else name="account_balance" size="24px" :style="{ color: scope.opt.color || 'grey' }" />
                           </q-avatar>
                        </q-item-section>
                        <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                      </q-item>
                   </template>
                </q-select>
              </div>
              
              <template v-if="expenseSource === 'CARD'">
                <div class="col-12 row q-col-gutter-sm">
                    <div class="col-8">
                       <q-select v-model="form.credit_card" :options="cardOptions" label="Cartão" outlined dense emit-value map-options>
                          <template v-slot:selected-item="scope">
                             <div class="row items-center">
                                <q-avatar size="24px" class="q-mr-sm" square>
                                   <img v-if="scope.opt.logo" :src="scope.opt.logo" style="object-fit: contain">
                                   <q-icon v-else name="credit_card" size="20px" :style="{ color: scope.opt.color || 'grey' }" />
                                </q-avatar>
                                {{ scope.opt.label }}
                             </div>
                          </template>
                          <template v-slot:option="scope">
                             <q-item v-bind="scope.itemProps">
                               <q-item-section avatar>
                                  <q-avatar square size="28px">
                                    <img v-if="scope.opt.logo" :src="scope.opt.logo" style="object-fit: contain">
                                    <q-icon v-else name="credit_card" size="24px" :style="{ color: scope.opt.color || 'grey' }" />
                                  </q-avatar>
                               </q-item-section>
                               <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                             </q-item>
                          </template>
                       </q-select>
                    </div>
                    <div class="col-4">
                       <div v-if="isEdit && installmentInfo" class="bg-grey-2 rounded-borders text-center column justify-center full-height q-px-xs">
                          <div class="text-caption text-grey-7">Parcela</div>
                          <div class="text-weight-bold text-navy">{{ installmentInfo }}</div>
                       </div>
                       <q-select v-else v-model="form.installments" :options="installmentOptions" label="Parcelas" outlined dense emit-value map-options />
                    </div>
                </div>
              </template>
            </template>

            <template v-else-if="form.type === 'INCOME'">
              <div class="col-12 col-sm-6">
                <q-select v-model="form.account" :options="accountOptions" label="Receber em" outlined dense emit-value map-options>
                   <template v-slot:selected-item="scope">
                     <div class="row items-center">{{ scope.opt.label }}</div>
                   </template>
                   <template v-slot:option="scope">
                     <q-item v-bind="scope.itemProps">
                       <q-item-section>
                         <q-item-label>{{ scope.opt.label }}</q-item-label>
                       </q-item-section>
                     </q-item>
                   </template>
                </q-select>
              </div>
            </template>

            <div class="col-12 row q-col-gutter-xs" v-if="form.type !== 'TRANSFER'">
              <div class="col-12" :class="{ 'col-sm-6': subCategoryOptions.length > 0 }">
                <q-select 
                  v-model="form.category" :options="categoryOptions" label="Categoria" outlined dense emit-value map-options
                  @update:model-value="form.subcategory = null"
                >
                  <template v-slot:prepend>
                    <q-avatar v-if="selectedCategoryObj" :style="{ backgroundColor: selectedCategoryObj.color || '#eee' }" size="24px" text-color="white">
                        <q-icon :name="selectedCategoryObj.icon || 'circle'" size="14px" />
                    </q-avatar>
                  </template>
                  <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                           <q-avatar :style="{ backgroundColor: scope.opt.color || '#eee' }" text-color="white" icon="circle">
                             <q-icon :name="scope.opt.icon || 'circle'" />
                           </q-avatar>
                        </q-item-section>
                        <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                      </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6" v-if="form.category && subCategoryOptions.length > 0">
                <q-select v-model="form.subcategory" :options="subCategoryOptions" label="Subcategoria" outlined dense emit-value map-options />
              </div>
            </div>

            <div class="col-12 q-pt-sm" v-if="form.type !== 'TRANSFER'">
               <div class="row q-col-gutter-md">
                 <div class="col-6">
                   <q-item tag="label" class="bg-grey-1 rounded-borders" v-ripple>
                     <q-item-section><q-item-label>{{ paidLabel }}</q-item-label></q-item-section>
                     <q-item-section side><q-toggle v-model="form.is_paid" color="green" :false-value="false" :true-value="true" /></q-item-section>
                   </q-item>
                 </div>
                 <div class="col-6">
                    <q-item tag="label" class="bg-grey-1 rounded-borders" :class="{ 'opacity-60': !!installmentInfo }">
                       <q-item-section><q-item-label>{{ recurrentLabel }}</q-item-label></q-item-section>
                       <q-item-section side><q-toggle v-model="form.is_recurrent" color="orange" :disable="!!installmentInfo || (form.installments > 1 && expenseSource === 'CARD')" :false-value="false" :true-value="true" /></q-item-section>
                    </q-item>
                 </div>
               </div>
            </div>

            <div class="col-12 q-mt-md" v-if="form.type === 'EXPENSE' && expenseSource !== 'CARD' && !isConciliation">
              <q-card flat bordered class="bg-white rounded-borders">
                <q-expansion-item>
                  <template v-slot:header="{ expanded }">
                     <q-item-section avatar><q-icon name="group" color="navy" /></q-item-section>
                     <q-item-section>
                        <div class="row items-center">
                           <div class="text-navy text-weight-bold q-mr-sm">Dividir conta (Rateio)</div>
                           <q-badge v-if="form.splits.length > 0" color="red" text-color="white" rounded class="shadow-1">{{ form.splits.length }}</q-badge>
                        </div>
                     </q-item-section>
                     <q-item-section side>
                        <q-icon name="keyboard_arrow_down" :class="{ 'rotate-180': expanded }" style="transition: transform 0.3s" />
                     </q-item-section>
                  </template>

                  <div class="q-pa-md">
                    <div v-if="form.splits.length === 0" class="text-center q-py-sm">
                       <q-btn outline color="primary" icon="add" label="Adicionar Pessoa" @click="addSplit" />
                    </div>
                    <div v-else>
                      <div class="text-caption text-grey-6 q-mb-sm">Quem mais pagou?</div>
                      <div v-for="(split, index) in form.splits" :key="index" class="row q-col-gutter-sm q-mb-sm items-center">
                        <div class="col-6">
                          <q-select v-model="split.user" :options="userOptions" label="Usuário" outlined dense emit-value map-options bg-color="grey-1">
                             <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                   <q-item-section avatar>
                                      <q-avatar size="24px">
                                         <img v-if="scope.opt.avatar" :src="scope.opt.avatar">
                                         <div v-else class="bg-grey-4 full-height full-width flex flex-center text-caption">{{ scope.opt.label ? scope.opt.label[0] : '?' }}</div>
                                      </q-avatar>
                                   </q-item-section>
                                   <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
                                </q-item>
                             </template>
                          </q-select>
                        </div>
                        <div class="col-3">
                          <q-input v-model="split.displayValue" outlined dense prefix="R$" input-class="text-right" bg-color="grey-1" @change="val => updateSplitValue(index, val)" />
                        </div>
                        <div class="col-3 row items-center justify-end no-wrap">
                          <q-btn flat round dense :icon="split.is_paid ? 'check_circle' : 'radio_button_unchecked'" :color="split.is_paid ? 'green' : 'grey-5'" @click="split.is_paid = !split.is_paid" />
                          <q-btn flat round dense icon="delete_outline" color="red" size="sm" @click="removeSplit(index)" class="q-ml-xs" />
                        </div>
                      </div>
                      <q-btn flat no-caps icon="add" label="Adicionar outra pessoa" color="primary" size="sm" @click="addSplit" class="q-mt-xs" />
                    </div>
                  </div>
                </q-expansion-item>
              </q-card>
            </div>

          </div>
        </q-scroll-area>
      </q-card-section>

      <div v-if="!isMobile">
        <q-separator />
        <q-card-actions align="right" class="q-pa-md bg-white">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup class="q-mr-sm" />
          <q-btn :label="isEdit ? 'Salvar Alterações' : 'Criar'" color="navy" unelevated @click="trySave" :loading="loading" padding="8px 24px" />
        </q-card-actions>
      </div>
    </q-card>
    
    <q-dialog v-model="showUpdateScopeDialog" persistent>
       <q-card style="min-width: 350px">
        <q-card-section class="row items-center"><q-avatar icon="edit" color="blue-1" text-color="blue" /><span class="q-ml-sm text-h6">Salvar Alterações</span></q-card-section>
        <q-card-section class="text-grey-8">Esta transação faz parte de uma série. Como aplicar?</q-card-section>
        <q-card-actions class="column q-gutter-y-sm q-pa-md">
          <q-btn outline color="primary" class="full-width" align="between" icon="event" label="Apenas esta" @click="confirmSave('single')" />
          <q-btn outline color="primary" class="full-width" align="between" icon="fast_forward" label="Esta e as próximas" @click="confirmSave('future')" />
          <q-btn outline color="primary" class="full-width" align="between" icon="done_all" label="Todas" @click="confirmSave('all')" />
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="full-width" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue' 
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'

export default {
  props: { 
      modelValue: Boolean, 
      transactionToEdit: Object, 
      loading: Boolean 
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const isMobile = computed(() => $q.screen.lt.sm)
    const dialogPosition = computed(() => isMobile.value ? 'bottom' : 'right')
    const cardStyle = computed(() => isMobile.value ? 'width: 100vw; height: 95vh; border-radius: 16px 16px 0 0' : 'width: 500px; max-width: 100vw; height: 100vh')
    
    const showUpdateScopeDialog = ref(false)
    const installmentInfo = ref('')
    const isLoadingDependencies = ref(false)

    // Defaults com booleanos explícitos para evitar estado nulo
    const defaultForm = { type: 'EXPENSE', description: '', value: 0, date: date.formatDate(new Date(), 'DD/MM/YYYY'), account: null, destination_account: null, credit_card: null, installments: 1, category: null, subcategory: null, is_paid: true, is_recurrent: false, splits: [], resolve_split_id: null }
    const form = ref({ ...defaultForm })
    const isEdit = ref(false)
    const displayValue = ref('')
    const expenseSource = ref('ACCOUNT')

    const transactionTypes = [ 
      { label: 'Despesa', value: 'EXPENSE', icon: 'arrow_downward', color: 'red-6' }, 
      { label: 'Receita', value: 'INCOME', icon: 'arrow_upward', color: 'green-6' }, 
      { label: 'Transf.', value: 'TRANSFER', icon: 'swap_horiz', color: 'blue-6' } 
    ]

    const accountOptions = ref([]); const cardOptions = ref([]); const allCategories = ref([]); const userOptions = ref([]);
    
    const categoryOptions = computed(() => allCategories.value.filter(c => c.type === form.value.type).map(c => ({ label: c.name, value: c.id, icon: c.icon, color: c.color })))
    const subCategoryOptions = computed(() => { if (!form.value.category) return []; const cat = allCategories.value.find(c => c.id === form.value.category); return cat && cat.subcategories ? cat.subcategories.map(s => ({ label: s.name, value: s.id })) : [] })
    const installmentOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}x`, value: i + 1 }))
    const selectedCategoryObj = computed(() => categoryOptions.value.find(c => c.value === form.value.category))
    
    const currentTextColor = computed(() => { if (form.value.type === 'INCOME') return 'text-green-8'; if (form.value.type === 'TRANSFER') return 'text-blue-8'; return 'text-red-8' })
    const currentBgColor = computed(() => { if (form.value.type === 'INCOME') return 'bg-green-1'; if (form.value.type === 'TRANSFER') return 'bg-blue-1'; return 'bg-red-1' })
    const paidLabel = computed(() => form.value.type === 'INCOME' ? 'Recebido' : 'Pago')
    const recurrentLabel = computed(() => form.value.type === 'INCOME' ? 'Receita Fixa' : 'Despesa Fixa')
    const isConciliation = computed(() => !!form.value.resolve_split_id)
    const dialogTitle = computed(() => isConciliation.value ? 'Lançar Despesa (Rateio)' : (isEdit.value ? 'Editar Transação' : 'Nova Transação'))

    const parseCurrency = (val) => { if (!val) return 0; if (typeof val === 'number') return val; const digits = val.replace(/\D/g, ''); return Number(digits) / 100 }
    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
    const formatDisplayValue = () => { const numeric = parseCurrency(displayValue.value); form.value.value = numeric; displayValue.value = numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
    const totalSplitOthers = computed(() => form.value.splits.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0))
    const remainingValue = computed(() => Math.max(0, form.value.value - totalSplitOthers.value))
    
    const updateSplitValue = (index, val) => { const numeric = parseCurrency(val); form.value.splits[index].value = numeric; form.value.splits[index].displayValue = numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
    const addSplit = () => { form.value.splits.push({ user: null, value: 0, displayValue: '', is_paid: false }); distributeValues() }
    const removeSplit = (i) => { form.value.splits.splice(i, 1); distributeValues() }
    const distributeValues = () => { if (form.value.splits.length === 0) return; const total = form.value.value; const share = total / (form.value.splits.length + 1); form.value.splits.forEach(split => { split.value = Number(share.toFixed(2)); split.displayValue = share.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }) }
    const changeType = (newType) => { if (form.value.type !== newType) { form.value.category = null; form.value.subcategory = null } form.value.type = newType; if (newType !== 'EXPENSE') { form.value.splits = []; form.value.credit_card = null; expenseSource.value = 'ACCOUNT' }; if (newType === 'TRANSFER') { form.value.category = null; form.value.subcategory = null; form.value.is_paid = true } }
    
    watch(expenseSource, (val) => { if (val === 'CARD') { form.value.account = null; form.value.is_paid = true; form.value.splits = [] } else { form.value.credit_card = null; form.value.installments = 1 } })

    const loadDependencies = async () => {
       if (accountOptions.value.length > 0) return 
       isLoadingDependencies.value = true
       try {
        const [accRes, cardRes, catRes, usrRes] = await Promise.all([
             api.get('/finance/accounts/'), 
             api.get('/finance/cards/'), 
             api.get('/finance/categories/'), 
             api.get('/auth/users/')
        ])
        accountOptions.value = (accRes.data.results || accRes.data).map(a => ({ label: a.name, value: a.id, logo: a.brand_logo_base64, color: a.color }))
        cardOptions.value = (cardRes.data.results || cardRes.data).map(c => ({ label: c.name, value: c.id, logo: c.brand_logo_base64 }))
        allCategories.value = catRes.data.results || catRes.data
        userOptions.value = (usrRes.data.results || usrRes.data).map(u => ({ label: u.username, value: u.id, avatar: u.profile?.avatar }))
       } catch (e) { console.error(e) } 
       finally { isLoadingDependencies.value = false }
    }

    watch(() => props.modelValue, async (isOpen) => {
      if (isOpen) {
        await loadDependencies()

        if (props.transactionToEdit) {
           const inputData = props.transactionToEdit
           
           if (inputData.id && !inputData.resolve_split_id) {
               // --- EDIÇÃO PADRÃO ---
               isEdit.value = true
               installmentInfo.value = '' 
               
               let cleanDescription = inputData.description
               const installmentMatch = inputData.description.match(/\((\d+\/\d+)\)$/)
               if (installmentMatch) {
                   installmentInfo.value = installmentMatch[1].replace('/', ' de ') 
                   cleanDescription = inputData.description.replace(/\s\(\d+\/\d+\)$/, '')
               }

               const data = JSON.parse(JSON.stringify(inputData))
               
               // Força valor positivo na edição
               data.value = Math.abs(Number(data.value))
               data.is_paid = !!data.is_paid
               data.is_recurrent = !!(data.is_recurrent || data.recurrence_id) 

               let splitsSum = 0; if (data.splits) splitsSum = data.splits.reduce((acc, s) => acc + Math.abs(Number(s.value)), 0)
               const totalOriginal = data.value + splitsSum
               
               form.value = { ...data, value: totalOriginal, description: cleanDescription }
               displayValue.value = totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
               
               if (data.date) { const [y, m, d] = data.date.split('T')[0].split('-'); form.value.date = `${d}/${m}/${y}` }
               if (data.splits) form.value.splits = data.splits.map(s => ({ ...s, value: Math.abs(Number(s.value)), displayValue: Math.abs(Number(s.value)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), is_paid: !!s.is_paid }))
               
               if (data.credit_card) expenseSource.value = 'CARD'; else expenseSource.value = 'ACCOUNT'

           } else {
               // --- CONCILIAÇÃO / NOVO VIA PROPS ---
               isEdit.value = false
               installmentInfo.value = ''
               const today = date.formatDate(new Date(), 'DD/MM/YYYY')
               
               // FIX: Garante valor positivo usando Math.abs()
               const safeValue = Math.abs(Number(inputData.value || 0))
               
               form.value = { ...JSON.parse(JSON.stringify(defaultForm)), date: today, ...inputData, value: safeValue }
               
               // Garante booleans
               form.value.is_paid = !!form.value.is_paid
               form.value.is_recurrent = !!form.value.is_recurrent

               displayValue.value = safeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
               
               if (inputData.date && inputData.date.includes('-')) {
                   const [y, m, d] = inputData.date.split('-')
                   form.value.date = `${d}/${m}/${y}`
               }

               expenseSource.value = 'ACCOUNT'
               
               if (inputData.resolve_split_id) {
                   form.value.is_paid = false
                   
                   // FIX: Detecção robusta de recorrência
                   const desc = (inputData.description || '').toLowerCase()
                   // Se veio da prop, ou tem "recorrente", ou tem (12x)
                   if (inputData.is_recurrent || desc.includes('recorrente') || /\(\d+x\)/.test(desc)) {
                       form.value.is_recurrent = true
                   }
               }
           }
        } else {
           // --- NOVO VAZIO ---
           isEdit.value = false
           installmentInfo.value = ''
           const today = date.formatDate(new Date(), 'DD/MM/YYYY')
           form.value = { ...JSON.parse(JSON.stringify(defaultForm)), date: today }
           displayValue.value = '0,00'
           expenseSource.value = 'ACCOUNT'
        }
      }
    })

    const trySave = () => {
      if (!form.value.description || form.value.value <= 0) { $q.notify({ type: 'warning', message: 'Informe descrição e valor.' }); return }
      if (remainingValue.value < 0) { $q.notify({ type: 'negative', message: 'Rateio inválido.' }); return }
      if (isEdit.value && form.value.recurrence_id) showUpdateScopeDialog.value = true
      else confirmSave('single')
    }

    const confirmSave = (scope) => {
      const payload = { ...form.value }
      if (payload.date) { const [d, m, y] = payload.date.split('/'); payload.date = `${y}-${m}-${d}` }
      const isNegative = payload.type === 'EXPENSE' || payload.type === 'TRANSFER'
      let myRealPart = Number(Number(remainingValue.value).toFixed(2))
      payload.value = isNegative ? -Math.abs(myRealPart) : Math.abs(myRealPart)
      if (payload.splits) { payload.splits = payload.splits.map(s => { const val = Number(Number(s.value).toFixed(2)); return { user: s.user, value: isNegative ? -Math.abs(val) : Math.abs(val), is_paid: !!s.is_paid } }) }
      payload.update_scope = scope 
      emit('save', payload)
      showUpdateScopeDialog.value = false
    }

    return {
      form, isEdit, isConciliation, dialogTitle, isLoadingDependencies,
      expenseSource, displayValue, installmentInfo,
      accountOptions, cardOptions, categoryOptions, subCategoryOptions, userOptions, installmentOptions, transactionTypes,
      isMobile, dialogPosition, cardStyle, currentTextColor, currentBgColor, paidLabel, recurrentLabel, remainingValue, totalSplitOthers,
      selectedCategoryObj, changeType, trySave, confirmSave, addSplit, removeSplit, updateSplitValue, distributeValues, formatDisplayValue, formatCurrency, showUpdateScopeDialog
    }
  }
}
</script>

<style scoped>
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.sticky-header { position: sticky; top: 0; z-index: 10; }
.scroll-area { height: calc(100vh - 60px); }
.opacity-60 { opacity: 0.6; }
.transition-bg { transition: background-color 0.3s ease, color 0.3s ease; }
.giant-input { font-size: 2.5rem; width: 200px; text-align: center; border: none; border-bottom: 2px solid transparent; transition: border-color 0.3s; }
.giant-input:focus { border-bottom-color: rgba(0,0,0,0.2); outline: none; }
</style>