<template>
  <q-page :class="$q.screen.lt.md ? 'bg-grey-1' : 'bg-grey-2 q-pa-md'">

    <div v-if="$q.screen.gt.sm" class="row q-col-gutter-md full-height">
      <div class="col-12 col-md-3">
        <SettingsMenu
          :modules="modules"
          :selected-id="selectedItem?.id"
          @select="handleSelectModuleDesktop"
        />
      </div>
      <div class="col-12 col-md-9">
        <SettingsTable
          :rows="rows"
          :columns="computedColumns"
          :loading="loading"
          :selected-item="selectedItem"
          :all-categories="allCategories"
          @edit="openForm"
          @delete="handleDelete"
          @add="openForm(null)"
          @refresh="refreshData"
        />
      </div>
    </div>

    <q-tab-panels
      v-else
      v-model="mobileView"
      animated
      transition-prev="slide-right"
      transition-next="slide-left"
      class="bg-grey-1 absolute-full" 
    >
      <q-tab-panel name="menu" class="q-pa-none column fit">
         <q-toolbar class="bg-navy text-white q-py-md shadow-2" style="z-index: 10">
           <q-icon name="settings" size="28px" class="text-cyan-brand q-mr-sm" />
           <q-toolbar-title class="text-weight-bold">Configurações</q-toolbar-title>
         </q-toolbar>

         <div class="col scroll bg-white">
            <SettingsMenu
              flat
              :modules="modules"
              :selected-id="selectedItem?.id"
              @select="handleSelectModuleMobile"
            />
         </div>
      </q-tab-panel>

      <q-tab-panel name="content" class="q-pa-none column fit">
        <q-toolbar class="bg-white text-navy shadow-1" style="z-index: 10">
          <q-btn flat round dense icon="arrow_back" @click="mobileView = 'menu'" color="primary" />
          <q-toolbar-title class="text-subtitle1 text-weight-bold q-ml-sm">
            {{ selectedItem?.label }}
          </q-toolbar-title>
          <q-btn round dense flat icon="add" color="primary" @click="openForm(null)" :disable="!selectedItem" />
        </q-toolbar>

        <div class="col scroll q-pa-sm">
           <SettingsTable
             grid
             flat
             :rows="rows"
             :columns="computedColumns"
             :loading="loading"
             :selected-item="selectedItem"
             :all-categories="allCategories"
             @edit="openForm"
             @delete="handleDelete"
             @add="openForm(null)"
             @refresh="refreshData"
             hide-header
           />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <SettingsForm
      v-model="showGenericDialog"
      :schema="currentSchema"
      :initial-data="formData"
      :singular-label="selectedItem?.singularLabel"
      :loading="saving"
      @save="handleSave"
    />
    <UserForm 
      v-model="showUserDialog" 
      :user-to-edit="userToEdit" 
      :loading="saving" 
      @save="handleSaveUser" 
    />
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useSettingsConfig } from 'src/composables/useSettingsConfig'
import { useGenericCrud } from 'src/composables/useGenericCrud'
import { useUtils } from 'src/composables/useUtils'

import SettingsMenu from 'src/components/settings/SettingsMenu.vue'
import SettingsTable from 'src/components/settings/SettingsTable.vue'
import SettingsForm from 'src/components/settings/SettingsForm.vue'
import UserForm from 'src/components/UserForm.vue'

export default {
  components: { SettingsMenu, SettingsTable, SettingsForm, UserForm },
  setup() {
    const $q = useQuasar()
    const { modules } = useSettingsConfig()
    
    // Desktop: Inicia selecionado | Mobile: Inicia nulo (Menu)
    const selectedItem = ref($q.screen.gt.sm ? modules.value[0].items[0] : null)
    const mobileView = ref('menu')

    const { rows, loading, saving, loadData, saveGenericItem, deleteGenericItem } = useGenericCrud()
    const { getCategoryObj } = useUtils()

    const allCategories = ref([])
    const showGenericDialog = ref(false)
    const showUserDialog = ref(false)
    const formData = ref({})
    const userToEdit = ref(null)

    const computedColumns = computed(() => {
      const cols = selectedItem.value?.columns || []
      if (selectedItem.value?.id === 'subcategories') {
        return cols.map(col => {
          if (col.name === 'icon') return { ...col, field: row => getCategoryObj(row.category, allCategories.value).icon }
          if (col.name === 'color') return { ...col, field: row => getCategoryObj(row.category, allCategories.value).color }
          if (col.name === 'category') return { ...col, field: row => getCategoryObj(row.category, allCategories.value).name }
          return col
        })
      }
      return cols
    })

    const currentSchema = computed(() => {
      const schema = selectedItem.value?.schema || []
      if (selectedItem.value?.id === 'subcategories') {
        return schema.map(field => {
          if (field.name === 'category') {
            return { ...field, options: allCategories.value.map(c => ({ label: c.name, value: c.id })) }
          }
          return field
        })
      }
      return schema
    })

    const loadCategories = async () => {
      try {
        const res = await api.get('/finance/categories/')
        allCategories.value = res.data.results || res.data
      } catch (e) { console.error(e) }
    }

    const refreshData = () => {
      if (!selectedItem.value) return
      if (selectedItem.value.id === 'subcategories') loadCategories()
      loadData(selectedItem.value.endpoint)
    }

    const handleSelectModuleDesktop = (item) => {
      selectedItem.value = item
      refreshData()
    }

    const handleSelectModuleMobile = (item) => {
      selectedItem.value = item
      mobileView.value = 'content'
      setTimeout(() => { refreshData() }, 50)
    }

    const openForm = (row = null) => {
      if (!selectedItem.value) return
      if (selectedItem.value.id === 'users') {
        userToEdit.value = row ? { ...row } : null
        showUserDialog.value = true
      } else {
        if (selectedItem.value.id === 'subcategories') loadCategories()
        if (row) formData.value = { ...row }
        else {
          const defaults = {}
          if (selectedItem.value.schema) {
            selectedItem.value.schema.forEach(field => {
              if (field.default !== undefined) defaults[field.name] = field.default
            })
          }
          formData.value = { ...defaults }
        }
        showGenericDialog.value = true
      }
    }

    const handleDelete = (row) => {
      deleteGenericItem(selectedItem.value.endpoint, row.id, refreshData)
    }

    const handleSave = (data) => {
      saveGenericItem(selectedItem.value.endpoint, data, () => {
        showGenericDialog.value = false
        refreshData()
      })
    }

    const handleSaveUser = (userData) => {
      saveGenericItem('/auth/users/', userData, () => {
        showUserDialog.value = false
        refreshData()
      })
    }

    onMounted(() => {
      if ($q.screen.gt.sm) refreshData()
      else loadCategories() // Garante que categorias existam pro menu mobile
    })

    return {
      modules, selectedItem, rows, computedColumns, currentSchema, loading, saving,
      allCategories, showGenericDialog, showUserDialog, formData, userToEdit,
      handleSelectModuleDesktop, handleSelectModuleMobile, refreshData, openForm, handleDelete, handleSave, handleSaveUser,
      mobileView
    }
  }
}
</script>

<style scoped>
/* Garante altura correta no Desktop */
.full-height {
  height: calc(100vh - 50px);
}
</style>