import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export function useGenericCrud() {
  const $q = useQuasar()
  const loading = ref(false)
  const saving = ref(false)
  const rows = ref([])

  const loadData = async (endpoint) => {
    if (!endpoint) return
    loading.value = true
    try {
      const response = await api.get(endpoint)
      
      // --- CORREÇÃO DO BUG DOS USUÁRIOS ---
      // APIs diferentes retornam formatos diferentes. Vamos normalizar:
      const data = response.data
      
      if (Array.isArray(data)) {
        // Caso 1: Retorno é um array direto [{}, {}]
        rows.value = data
      } else if (data && Array.isArray(data.results)) {
        // Caso 2: Paginado Django/DRF { count: 10, results: [{}, {}] }
        rows.value = data.results
      } else if (data && Array.isArray(data.data)) {
        // Caso 3: Padrão Laravel/Outros { data: [{}, {}] }
        rows.value = data.data
      } else {
        // Fallback
        console.warn('Formato de resposta da API desconhecido:', data)
        rows.value = []
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      $q.notify({ type: 'negative', message: 'Erro ao carregar dados.' })
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  const saveGenericItem = async (endpoint, formData, callback) => {
    saving.value = true
    const isEdit = !!formData.id
    const url = isEdit ? `${endpoint}${formData.id}/` : endpoint
    const method = isEdit ? 'put' : 'post'

    try {
      await api[method](url, formData)
      $q.notify({ type: 'positive', message: 'Salvo com sucesso!' })
      if (callback) callback()
    } catch (error) {
      const detail = error.response?.data?.detail || 'Erro ao salvar.'
      $q.notify({ type: 'negative', message: detail })
    } finally {
      saving.value = false
    }
  }

  const deleteGenericItem = (endpoint, id, callback) => {
    $q.dialog({ 
      title: 'Confirmar', 
      message: 'Deseja realmente excluir este item?', 
      cancel: true, 
      persistent: true, 
      ok: { label: 'Excluir', color: 'negative', flat: true } 
    }).onOk(async () => {
      try {
        await api.delete(`${endpoint}${id}/`)
        $q.notify({ type: 'positive', message: 'Excluído com sucesso.' })
        if (callback) callback()
      } catch{
        $q.notify({ type: 'negative', message: 'Erro ao excluir.' })
      }
    })
  }

  return {
    rows,
    loading,
    saving,
    loadData,
    saveGenericItem,
    deleteGenericItem
  }
}