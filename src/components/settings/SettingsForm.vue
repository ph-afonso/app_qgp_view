<template>
  <q-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :position="dialogPosition"
    :maximized="true"
    :transition-show="transitionShow"
    :transition-hide="transitionHide"
  >
    <q-card class="bg-white" :style="cardStyle">
      
      <q-card-section class="row items-center q-py-sm border-bottom bg-white">
        
        <q-btn 
          v-if="isMobile" 
          flat round dense 
          icon="arrow_back" 
          v-close-popup 
          class="q-mr-sm"
          color="navy"
        />

        <div class="text-h6 text-weight-bold text-navy ellipsis">
          {{ localData.id ? 'Editar' : 'Nova' }} {{ singularLabel }}
        </div>
        
        <q-space />
        
        <q-btn v-if="!isMobile" icon="close" flat round dense v-close-popup color="grey-7" />

        <q-btn 
          v-if="isMobile" 
          flat 
          round
          dense
          icon="save" 
          color="navy" 
          size="lg"
          @click="save" 
          :loading="loading"
        >
           <q-tooltip>Salvar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-card-section class="scroll" style="height: calc(100vh - 130px)"> 
        
        <div class="row q-col-gutter-md">
          <div 
            v-for="field in schema" 
            :key="field.name"
            :class="getColumnClass(field)" 
          >
            
            <q-input
              v-if="['text', 'number', 'date'].includes(field.type)"
              v-model="localData[field.name]"
              :label="field.label"
              :type="field.type"
              outlined 
              :prefix="field.prefix" 
              :mask="field.mask" 
              stack-label
              :hint="field.hint"
              class="bg-white"
            />

            <div v-if="field.type === 'file-base64'">
              <q-file
                v-model="fileBuffer"
                outlined
                :label="!localData[field.name] ? field.label : undefined"
                accept=".jpg, .jpeg, .png, .svg"
                max-file-size="1048576"
                @update:model-value="(file) => handleFile(file, field.name)"
                @rejected="onFileRejected"
                class="bg-white"
              >
                <template v-slot:prepend>
                  <q-avatar v-if="localData[field.name]" size="40px" square class="rounded-borders bg-grey-2 q-my-xs">
                      <img :src="localData[field.name]" style="object-fit: contain" />
                  </q-avatar>
                  <q-icon v-else name="cloud_upload" color="navy" />
                </template>
                <template v-slot:append>
                  <q-icon v-if="localData[field.name]" name="close" class="cursor-pointer" color="grey-5" @click.stop.prevent="clearFile(field.name)" />
                </template>
              </q-file>
              <div class="text-caption text-grey-6 q-ml-xs q-mt-xs" v-if="!localData[field.name]">
                Formatos: JPG, PNG, SVG (Max 1MB)
              </div>
            </div>

            <q-select
              v-if="field.type === 'icon-search'"
              v-model="localData[field.name]"
              :options="iconOptions"
              :label="field.label"
              outlined 
              use-input 
              input-debounce="0" 
              @filter="filterIcons" 
              behavior="menu"
              class="bg-white"
              emit-value
              map-options
              option-label="label"
              option-value="value"
            >
                <template v-slot:prepend>
                   <q-icon :name="localData[field.name] || 'search'" color="navy" />
                </template>
                
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" color="navy" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                    <div class="row items-center">
                        <span class="q-mr-xs">{{ scope.opt.label }}</span>
                    </div>
                </template>
            </q-select>

            <q-input
              v-if="field.type === 'color'"
              v-model="localData[field.name]"
              :label="field.label"
              outlined class="cursor-pointer bg-white"
              readonly
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer" :style="{ color: localData[field.name] || '#051933' }">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="localData[field.name]" />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:prepend>
                 <div :style="`width:24px; height:24px; background:${localData[field.name] || '#ccc'}; border-radius:50%; border: 1px solid #ddd`"></div>
              </template>
            </q-input>

            <q-select
              v-if="field.type === 'select'"
              v-model="localData[field.name]"
              :options="field.options"
              :label="field.label"
              outlined emit-value map-options
              class="bg-white"
            />

            <q-item v-if="field.type === 'toggle'" tag="label" v-ripple class="rounded-borders bg-grey-1 border-grey">
               <q-item-section>
                 <q-item-label>{{ field.label }}</q-item-label>
                 <q-item-label caption>Status do registro</q-item-label>
               </q-item-section>
               <q-item-section side>
                 <q-toggle v-model="localData[field.name]" color="navy" />
               </q-item-section>
            </q-item>

          </div>
        </div>
      </q-card-section>

      <div v-if="!isMobile">
        <q-separator />
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup class="q-mr-sm" />
          <q-btn 
            icon="save"
            :label="localData.id ? 'Salvar Alterações' : 'Criar Registro'" 
            color="navy" 
            unelevated 
            @click="save" 
            :loading="loading" 
            padding="8px 24px"
          />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  props: {
    modelValue: Boolean,
    schema: Array,
    initialData: Object,
    singularLabel: String,
    loading: Boolean
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const localData = ref({})
    const fileBuffer = ref(null)
    
    // Detecta mobile
    const isMobile = computed(() => $q.screen.lt.sm)

    // Configuração de Animação e Posição
    const dialogPosition = computed(() => isMobile.value ? 'standard' : 'right')
    const transitionShow = computed(() => isMobile.value ? 'slide-up' : 'slide-left')
    const transitionHide = computed(() => isMobile.value ? 'slide-down' : 'slide-right')
    
    const cardStyle = computed(() => {
      return isMobile.value 
        ? 'width: 100vw; height: 100vh;' // Mobile: Total
        : 'width: 500px; max-width: 100vw;' // Desktop: Sidebar
    })

    // --- LISTA EXPANDIDA DE ÍCONES ---
    // label: O que o usuário vê (PT-BR)
    // value: O que é salvo no banco (Inglês/Material Design)
    const allIcons = [
      // Essenciais
      { label: 'Início / Home', value: 'home' },
      { label: 'Configurações', value: 'settings' },
      { label: 'Usuário / Perfil', value: 'person' },
      { label: 'Trabalho / Maleta', value: 'work' },
      { label: 'Favorito / Coração', value: 'favorite' },
      { label: 'Estrela / Destaque', value: 'star' },
      
      // Finanças
      { label: 'Dinheiro', value: 'attach_money' },
      { label: 'Cartão de Crédito', value: 'credit_card' },
      { label: 'Banco', value: 'account_balance' },
      { label: 'Carteira', value: 'account_balance_wallet' },
      { label: 'Gráfico / Investimento', value: 'trending_up' },
      { label: 'Recibo / Nota', value: 'receipt' },
      { label: 'Cofrinho / Poupança', value: 'savings' },
      { label: 'Pagamento', value: 'payments' },

      // Saúde & Bem-estar (Solicitado)
      { label: 'Remédio / Pílula', value: 'medication' },
      { label: 'Farmácia / Cruz', value: 'local_pharmacy' },
      { label: 'Hospital', value: 'local_hospital' },
      { label: 'Médico / Saúde', value: 'medical_services' },
      { label: 'Coração / Batimento', value: 'monitor_heart' },
      { label: 'Academia / Peso', value: 'fitness_center' },
      { label: 'Yoga / Meditação', value: 'self_improvement' },
      { label: 'Dentista', value: 'dentistry' },
      { label: 'Termômetro', value: 'device_thermostat' },
      { label: 'Curativo', value: 'healing' },

      // Vestuário & Compras (Solicitado)
      { label: 'Roupas / Guarda-roupa', value: 'checkroom' },
      { label: 'Sacola de Compras', value: 'shopping_bag' },
      { label: 'Carrinho de Compras', value: 'shopping_cart' },
      { label: 'Etiqueta / Oferta', value: 'local_offer' },
      { label: 'Loja', value: 'storefront' },
      { label: 'Camiseta', value: 'checkroom' }, // Material não tem 'tshirt' específico, usa-se checkroom
      { label: 'Presente', value: 'card_giftcard' },

      // Alimentação
      { label: 'Restaurante / Talheres', value: 'restaurant' },
      { label: 'Lanche / Fast Food', value: 'fastfood' },
      { label: 'Bebida / Bar', value: 'local_bar' },
      { label: 'Café', value: 'local_cafe' },
      { label: 'Pizza', value: 'local_pizza' },
      { label: 'Mercado / Cesta', value: 'shopping_basket' },
      { label: 'Bolo / Aniversário', value: 'cake' },
      { label: 'Cozinha', value: 'kitchen' },

      // Transporte & Viagem
      { label: 'Carro', value: 'directions_car' },
      { label: 'Moto', value: 'two_wheeler' },
      { label: 'Ônibus', value: 'directions_bus' },
      { label: 'Avião / Viagem', value: 'flight' },
      { label: 'Bicicleta', value: 'pedal_bike' },
      { label: 'Combustível', value: 'local_gas_station' },
      { label: 'Hotel / Cama', value: 'hotel' },
      { label: 'Mapa', value: 'map' },
      { label: 'Táxi', value: 'local_taxi' },

      // Tecnologia
      { label: 'Celular / Smartphone', value: 'smartphone' },
      { label: 'Computador', value: 'computer' },
      { label: 'Internet / Wi-Fi', value: 'wifi' },
      { label: 'Mouse', value: 'mouse' },
      { label: 'Game / Controle', value: 'sports_esports' },
      { label: 'Câmera', value: 'photo_camera' },
      
      // Casa & Serviços
      { label: 'Casa', value: 'house' },
      { label: 'Ferramentas / Manutenção', value: 'build' },
      { label: 'Limpeza', value: 'cleaning_services' },
      { label: 'Luz / Energia', value: 'lightbulb' },
      { label: 'Água / Gota', value: 'water_drop' },
      { label: 'Chaves', value: 'vpn_key' },
      { label: 'Lixo', value: 'delete' },
      { label: 'Pet / Animal', value: 'pets' },
      { label: 'Jardim / Flor', value: 'local_florist' },
      
      // Educação & Outros
      { label: 'Estudo / Livro', value: 'menu_book' },
      { label: 'Escola', value: 'school' },
      { label: 'Música', value: 'music_note' },
      { label: 'Filme', value: 'movie' },
      { label: 'Esporte', value: 'sports_soccer' },
      { label: 'Praia', value: 'beach_access' }
    ].sort((a, b) => a.label.localeCompare(b.label)) // Ordena alfabeticamente em PT-BR

    const iconOptions = ref(allIcons)

    watch(() => props.initialData, (newVal) => {
      localData.value = { ...newVal }
      fileBuffer.value = null
    }, { deep: true })

    const getColumnClass = (field) => {
      if (field.type === 'toggle' || field.type === 'file-base64') return 'col-12'
      if (['number', 'date', 'color', 'icon-search'].includes(field.type)) {
        return 'col-12 col-sm-6'
      }
      return 'col-12'
    }

    const filterIcons = (val, update) => {
      if (val === '') {
        update(() => { iconOptions.value = allIcons })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        // Filtra tanto pelo nome em PT quanto pelo nome em Inglês
        iconOptions.value = allIcons.filter(v => 
          v.label.toLowerCase().indexOf(needle) > -1 || 
          v.value.toLowerCase().indexOf(needle) > -1
        )
      })
    }

    const handleFile = (file, fieldName) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => { localData.value[fieldName] = e.target.result }
      reader.readAsDataURL(file)
    }

    const clearFile = (fieldName) => {
      localData.value[fieldName] = null
      fileBuffer.value = null
    }

    const onFileRejected = () => $q.notify({ type: 'negative', message: 'Arquivo inválido ou muito grande.' })

    const save = () => {
      emit('save', localData.value)
    }

    return { 
      localData, fileBuffer, iconOptions, isMobile,
      filterIcons, handleFile, clearFile, onFileRejected, save, getColumnClass,
      dialogPosition, transitionShow, transitionHide, cardStyle
    }
  }
}
</script>

<style scoped>
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.border-grey { border: 1px solid #e0e0e0; }
.border-bottom { border-bottom: 1px solid #e0e0e0; }
</style>