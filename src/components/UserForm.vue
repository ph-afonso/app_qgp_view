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
          {{ isEdit ? 'Editar' : 'Novo' }} Usuário
        </div>
        
        <q-space />
        
        <q-btn v-if="!isMobile" icon="close" flat round dense v-close-popup color="grey-7" />

        <q-btn 
          v-if="isMobile" 
          flat round dense
          icon="save" 
          color="navy" 
          size="lg"
          @click="save" 
          :loading="loading"
        />
      </q-card-section>

      <q-card-section class="q-pa-none column" style="height: calc(100vh - 130px)">
        
        <div class="row justify-center q-py-lg bg-grey-1 border-bottom relative-position">
           <q-avatar size="100px" class="shadow-1 bg-white">
             <img v-if="previewUrl" :src="previewUrl" style="object-fit: cover" />
             <q-icon v-else name="person" size="80px" color="grey-4" />
             
             <q-btn
                round
                color="navy"
                text-color="white"
                icon="photo_camera"
                size="xs"
                class="absolute-bottom-right"
                style="bottom: 0; right: 0"
                @click="$refs.fileInput.pickFiles()"
              />
           </q-avatar>
           
           <q-file
              ref="fileInput"
              v-model="avatarFile"
              accept=".jpg, .png, image/*"
              style="display: none"
              @update:model-value="handleFileUpdate"
           />
        </div>

        <q-tabs 
          v-model="tab" 
          dense 
          class="text-grey bg-white border-bottom" 
          active-color="navy" 
          indicator-color="navy" 
          align="justify"
          narrow-indicator
        >
          <q-tab name="general" label="Dados Gerais" />
          <q-tab name="access" label="Acesso" />
          <q-tab name="profile" label="Perfil" />
        </q-tabs>

        <q-scroll-area class="col">
          <q-tab-panels v-model="tab" animated class="q-pa-none">
            
            <q-tab-panel name="general" class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.first_name" label="Nome" outlined dense class="bg-white" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.last_name" label="Sobrenome" outlined dense class="bg-white" />
                </div>
                <div class="col-12">
                  <q-input v-model="form.email" label="E-mail" outlined dense type="email" class="bg-white">
                    <template v-slot:prepend><q-icon name="mail" color="grey-6" /></template>
                  </q-input>
                </div>
                <div class="col-12">
                  <q-input 
                    v-model="form.profile.phone" 
                    label="Telefone / WhatsApp" 
                    outlined dense 
                    mask="(##) #####-####"
                    class="bg-white"
                  >
                    <template v-slot:prepend><q-icon name="smartphone" color="grey-6" /></template>
                  </q-input>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="access" class="q-pa-md">
               <q-input v-model="form.username" label="Login de Acesso" outlined dense class="bg-white q-mb-md">
                 <template v-slot:prepend><q-icon name="person" color="grey-6" /></template>
               </q-input>
               
               <div class="text-subtitle2 text-navy q-mb-xs">Segurança</div>
               <q-input 
                 v-model="form.password" 
                 label="Senha" 
                 outlined dense 
                 type="password" 
                 class="bg-white"
                 :hint="isEdit ? 'Deixe em branco para manter a atual' : 'Defina a senha inicial'"
               >
                 <template v-slot:prepend><q-icon name="key" color="grey-6" /></template>
               </q-input>

               <div class="row q-col-gutter-md q-mt-md">
                 <div class="col-12">
                   <q-item tag="label" v-ripple class="bg-grey-1 rounded-borders border-grey">
                      <q-item-section>
                        <q-item-label>Status da Conta</q-item-label>
                        <q-item-label caption>Permitir acesso ao sistema</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle v-model="form.is_active" color="green" />
                      </q-item-section>
                   </q-item>
                 </div>
                 <div class="col-12">
                   <q-item tag="label" v-ripple class="bg-grey-1 rounded-borders border-grey">
                      <q-item-section>
                        <q-item-label>Administrador</q-item-label>
                        <q-item-label caption>Acesso total a configurações</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle v-model="form.is_staff" color="orange" />
                      </q-item-section>
                   </q-item>
                 </div>
               </div>
            </q-tab-panel>

            <q-tab-panel name="profile" class="q-pa-md">
              <q-select 
                v-model="form.profile.currency" 
                :options="currencyOptions" 
                label="Moeda Padrão" 
                outlined dense 
                emit-value map-options
                class="bg-white"
              >
                <template v-slot:prepend><q-icon name="paid" color="grey-6" /></template>
              </q-select>
            </q-tab-panel>

          </q-tab-panels>
        </q-scroll-area>
      </q-card-section>

      <div v-if="!isMobile">
        <q-separator />
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup class="q-mr-sm" />
          <q-btn 
            icon="save"
            :label="isEdit ? 'Salvar Alterações' : 'Criar Usuário'" 
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
  name: 'UserForm',
  props: {
    modelValue: Boolean, 
    userToEdit: Object,  
    loading: Boolean
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const tab = ref('general')
    const fileInput = ref(null)
    const avatarFile = ref(null)
    const previewUrl = ref(null)
    
    // --- ESTILIZAÇÃO RESPONSIVA (Igual ao SettingsForm) ---
    const isMobile = computed(() => $q.screen.lt.sm)
    const dialogPosition = computed(() => isMobile.value ? 'standard' : 'right')
    const transitionShow = computed(() => isMobile.value ? 'slide-up' : 'slide-left')
    const transitionHide = computed(() => isMobile.value ? 'slide-down' : 'slide-right')
    const cardStyle = computed(() => isMobile.value ? 'width: 100vw; height: 100vh;' : 'width: 500px; max-width: 100vw;')

    // --- LÓGICA DO FORMULÁRIO ---
    const defaultForm = {
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      is_active: true,
      is_staff: false,
      profile: {
        phone: '',
        currency: 'BRL',
        avatar: null
      }
    }

    const form = ref({ ...defaultForm })
    const isEdit = ref(false)

    const currencyOptions = [
      { label: 'Real (BRL)', value: 'BRL' },
      { label: 'Dólar (USD)', value: 'USD' },
      { label: 'Euro (EUR)', value: 'EUR' }
    ]

    watch(() => props.userToEdit, (newVal) => {
      if (newVal) {
        isEdit.value = true
        form.value = JSON.parse(JSON.stringify(newVal))
        form.value.password = '' 
        if (!form.value.profile) form.value.profile = { ...defaultForm.profile }
        previewUrl.value = newVal.profile?.avatar || null
      } else {
        isEdit.value = false
        form.value = JSON.parse(JSON.stringify(defaultForm))
        previewUrl.value = null
      }
      avatarFile.value = null
      tab.value = 'general'
    }, { immediate: true })

    const handleFileUpdate = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64String = e.target.result
          previewUrl.value = base64String
          if (!form.value.profile) form.value.profile = {}
          form.value.profile.avatar = base64String
        }
        reader.readAsDataURL(file)
      }
    }

    const save = () => {
      emit('save', { ...form.value })
    }

    return {
      tab, form, isEdit, fileInput, avatarFile, previewUrl, currencyOptions, 
      handleFileUpdate, save, 
      isMobile, dialogPosition, transitionShow, transitionHide, cardStyle // Retornos de estilo
    }
  }
}
</script>

<style scoped>
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.border-bottom { border-bottom: 1px solid #e0e0e0; }
.border-grey { border: 1px solid #e0e0e0; }
</style>