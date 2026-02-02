<template>
  <q-card :flat="grid" :bordered="!grid" class="rounded-borders bg-white full-height" style="min-height: 600px">

    <div v-if="!hideHeader && !grid" class="q-pa-md border-bottom row items-center justify-between q-gutter-y-sm">
      <div class="col-12 col-md-auto">
        <div class="text-h6 text-navy">{{ selectedItem?.label }}</div>
        <div class="text-caption text-grey-7">Gerenciamento de registros.</div>
      </div>

      <div class="col-12 col-md-auto row q-gutter-sm items-center justify-end">
        <q-input 
          dense outlined v-model="localFilter" 
          placeholder="Pesquisar..." debounce="300"
          class="bg-grey-1" 
          style="min-width: 200px"
        >
          <template v-slot:append>
            <q-icon name="search" v-if="!localFilter" />
            <q-icon name="close" v-else @click="localFilter = ''" class="cursor-pointer" />
          </template>
        </q-input>

        <q-btn icon="refresh" flat round color="grey-7" @click="$emit('refresh')" :loading="loading" />
        <q-btn icon="add" label="Novo" color="navy" unelevated :disable="!selectedItem" @click="$emit('add')" />
      </div>
    </div>

    <div v-else-if="grid" class="q-px-sm q-pt-sm">
        <q-input 
          dense outlined v-model="localFilter" 
          placeholder="Buscar..." debounce="300"
          class="bg-white full-width" 
          rounded
        >
          <template v-slot:prepend><q-icon name="search" color="grey-5" /></template>
        </q-input>
    </div>

    <div class="q-pa-md" :class="{'q-pa-none': grid}">
      <q-table
        :flat="grid"
        :bordered="!grid"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="localFilter" 
        color="navy"
        no-data-label="Nenhum registro encontrado."
        :pagination="{ rowsPerPage: 10 }"
        :grid="grid"
        hide-header
      >
        <template v-slot:no-data="{ message, filter }">
          <div class="full-width row flex-center text-grey-8 q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ message }} <span v-if="filter"> (Filtro: "{{ filter }}")</span></span>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-sm col-12">
            <q-card class="shadow-1 rounded-borders overflow-hidden bg-white">
              
              <q-item clickable v-ripple @click="$emit('edit', props.row)" class="q-py-md no-wrap">
                 
                 <q-item-section avatar style="min-width: 40px" class="q-pr-sm">
                   <q-avatar v-if="props.row.brand_logo_base64 || props.row.profile?.avatar" size="40px" square class="rounded-borders">
                     <img :src="props.row.brand_logo_base64 || props.row.profile?.avatar" style="object-fit: cover;">
                   </q-avatar>
                   
                   <q-avatar v-else-if="getColValue(props.row, 'icon')" :style="`background: ${getColValue(props.row, 'color') || '#eee'}`" text-color="white" size="40px">
                     <q-icon :name="getColValue(props.row, 'icon')" size="20px" />
                   </q-avatar>
                   
                   <q-avatar v-else color="grey-3" text-color="navy" size="40px">
                     <span class="text-weight-bold" v-if="props.row.first_name">{{ props.row.first_name[0] }}</span>
                     <q-icon v-else name="person" />
                   </q-avatar>
                 </q-item-section>

                 <q-item-section class="col" style="min-width: 0;">
                   
                   <q-item-label class="text-weight-bold text-navy ellipsis">
                      {{ props.row.name || getFullName(props.row) || props.row.username || 'Sem nome' }}
                   </q-item-label>
                   
                   <q-item-label caption class="ellipsis text-grey-8">
                      <span v-if="props.row.account_type">{{ getAccountTypeLabel(props.row.account_type) }}</span>
                      <span v-else-if="getColValue(props.row, 'category')">{{ getColValue(props.row, 'category') }}</span>
                      <span v-else-if="props.row.limit">Limite: R$ {{ props.row.limit }}</span>
                   </q-item-label>

                 </q-item-section>

                 <q-item-section side style="padding-left: 0;">
                   <div class="row items-center no-wrap">
                     <q-badge 
                        v-if="props.row.is_active !== undefined" 
                        rounded 
                        :color="props.row.is_active ? 'green' : 'grey-4'" 
                        class="q-mr-xs"
                        style="width: 8px; height: 8px; padding: 0"
                     />
                     
                     <q-btn flat round dense icon="more_vert" color="grey-7" @click.stop>
                       <q-menu auto-close anchor="bottom right" self="top right">
                         <q-list style="min-width: 120px">
                           <q-item clickable @click="$emit('edit', props.row)">
                             <q-item-section avatar style="min-width: 30px"><q-icon name="edit" size="xs" /></q-item-section>
                             <q-item-section>Editar</q-item-section>
                           </q-item>
                           <q-separator />
                           <q-item clickable @click="$emit('delete', props.row)" class="text-red">
                             <q-item-section avatar style="min-width: 30px"><q-icon name="delete" size="xs" /></q-item-section>
                             <q-item-section>Excluir</q-item-section>
                           </q-item>
                         </q-list>
                       </q-menu>
                     </q-btn>
                   </div>
                 </q-item-section>
              </q-item>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn flat round icon="edit" color="grey-7" size="sm" @click="$emit('edit', props.row)" />
            <q-btn flat round icon="delete" color="red-4" size="sm" @click="$emit('delete', props.row)" />
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props" class="text-center">
            <q-badge 
              v-if="props.value === 'INCOME'" 
              color="green-1" 
              text-color="green-8" 
              label="Receita" 
              rounded 
              class="text-weight-bold"
            />
            <q-badge 
              v-else-if="props.value === 'EXPENSE'" 
              color="red-1" 
              text-color="red-8" 
              label="Despesa" 
              rounded 
              class="text-weight-bold"
            />
            <span v-else>{{ props.value }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-color="props">
          <q-td :props="props">
            <div class="row items-center justify-center">
              <div :style="`background:${props.value}; width:18px; height:18px; border-radius:50%; border:1px solid #ddd`"></div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-bank="props">
          <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="24px" class="q-mr-sm" square>
                  <img :src="props.row.brand_logo_base64 || 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'" style="object-fit: contain;">
                </q-avatar>
                <span>{{ props.row.name }}</span>
              </div>
          </q-td>
        </template>

        <template v-slot:body-cell-bank_logo="props">
          <q-td :props="props" align="center">
              <q-avatar size="32px" square>
                <img :src="props.row.brand_logo_base64 || 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png'" style="object-fit: contain;">
              </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-brand_img="props">
          <q-td :props="props" align="center">
              <q-img :src="getBrandImage(props.row.brand)" width="40px" height="25px" fit="contain">
                <q-tooltip>{{ props.row.brand }}</q-tooltip>
              </q-img>
          </q-td>
        </template>
        
        <template v-slot:body-cell-account_type="props"><q-td :props="props">{{ getAccountTypeLabel(props.value) }}</q-td></template>
        
        <template v-slot:body-cell-icon="props">
          <q-td :props="props" align="center">
            <q-icon 
              :name="props.value" 
              size="sm" 
              :style="`color: ${props.row.color || getCategoryObj(props.row.category, allCategories).color || '#757575'}`" 
            />
          </q-td>
        </template>

        <template v-slot:body-cell-is_active="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value ? 'green-5' : 'grey-5'" :label="props.value ? 'Ativo' : 'Inativo'" rounded />
          </q-td>
        </template>
        
        <template v-slot:body-cell-is_staff="props">
          <q-td :props="props" class="text-center">
              <q-icon v-if="props.value" name="verified_user" color="primary" size="sm">
                <q-tooltip>Administrador</q-tooltip>
              </q-icon>
              <span v-else class="text-grey-4">-</span>
          </q-td>
        </template>

      </q-table>
    </div>
  </q-card>
</template>

<script>
import { ref } from 'vue'
import { useUtils } from 'src/composables/useUtils'

export default {
  props: {
    rows: Array,
    columns: Array,
    loading: Boolean,
    selectedItem: Object,
    allCategories: { type: Array, default: () => [] },
    grid: Boolean,
    hideHeader: Boolean
  },
  emits: ['add', 'refresh', 'edit', 'delete'],
  setup(props) {
    const localFilter = ref('')
    const { getBrandImage, getCategoryObj } = useUtils()

    const accountTypeOptions = [
      { label: 'Conta Corrente', value: 'CHECKING' }, { label: 'Poupança', value: 'SAVINGS' },
      { label: 'Carteira/Dinheiro', value: 'WALLET' }, { label: 'Investimentos', value: 'INVESTMENT' }
    ]
    const getAccountTypeLabel = (val) => accountTypeOptions.find(opt => opt.value === val)?.label || val

    const getColValue = (row, fieldName) => {
       const colDef = props.columns.find(c => c.name === fieldName)
       if (!colDef) return row[fieldName]
       if (typeof colDef.field === 'function') return colDef.field(row)
       return row[colDef.field]
    }

    const getFullName = (row) => {
      if (row.first_name || row.last_name) return `${row.first_name} ${row.last_name}`.trim()
      return ''
    }

    return { 
      localFilter, 
      getBrandImage, 
      getCategoryObj, 
      getAccountTypeLabel,
      getColValue,
      getFullName
    }
  }
}
</script>

<style scoped>
.text-navy { color: #051933; }
.border-bottom { border-bottom: 1px solid #e0e0e0; }
</style>