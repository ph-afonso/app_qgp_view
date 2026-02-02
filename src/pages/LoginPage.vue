<template>
  <q-page class="row window-height">
    
    <div 
      class="col-md-5 col-lg-4 column justify-center items-center gt-sm q-pa-xl text-center"
      style="background-color: #051933;" 
    >
      <div class="row justify-center q-mb-md">
          <img class="" src="public/icons/favicon-128x128.png" alt="Meu Gestor Logo" style="width: 80px; height: 80px;" />
      </div>
      
      <div class="text-h3 text-white text-weight-bold q-mb-sm">QG Enterprise</div>
      <div class="text-h6 text-cyan-4 text-weight-regular" style="opacity: 0.8; line-height: 1.4;">
        Just One System to Manage Them All
      </div>
    </div>

    <div class="col-12 col-md-7 col-lg-8 column bg-white relative-position">
      
      <div class="lt-md full-width q-pa-lg text-center text-white" style="background-color: #051933;">
        <div class="text-h5 text-weight-bold">Meu Gestor</div>
        <div class="text-caption text-cyan-4">Financeiro</div>
      </div>

      <div class="column flex-center full-height q-px-md">
        <div class="login-card full-width" style="max-width: 400px;">
          
          <div class="text-h5 text-weight-bold q-mb-xs" style="color: #051933;">Bem-vindo!</div>
          <div class="text-body2 text-grey-7 q-mb-xl">Insira seus dados para acessar o painel.</div>

          <q-form @submit="handleLogin" class="q-gutter-md">
            
            <div>
              <label class="text-weight-bold q-mb-xs block text-grey-9">E-mail</label>
              <q-input 
                v-model="form.email" 
                outlined 
                dense 
                placeholder="exemplo@email.com" 
                bg-color="grey-1"
                :rules="[val => !!val || 'Campo obrigatório']"
              >
                <template v-slot:prepend><q-icon name="mail" size="xs" color="grey-6" /></template>
              </q-input>
            </div>

            <div>
              <label class="text-weight-bold q-mb-xs block text-grey-9">Senha</label>
              <q-input 
                v-model="form.password" 
                outlined 
                dense 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Sua senha"
                bg-color="grey-1"
                :rules="[val => !!val || 'Campo obrigatório']"
              >
                <template v-slot:prepend><q-icon name="lock" size="xs" color="grey-6" /></template>
                <template v-slot:append>
                  <q-icon 
                    :name="showPassword ? 'visibility' : 'visibility_off'" 
                    class="cursor-pointer text-grey-6" 
                    @click="showPassword = !showPassword" 
                  />
                </template>
              </q-input>
            </div>

            <q-btn 
              label="Acessar Sistema" 
              type="submit" 
              class="full-width text-white text-weight-bold q-py-sm shadow-1"
              style="background-color: #051933;"
              unelevated
              :loading="loading"
            />

            <div class="text-center q-mt-md">
               <a href="#" style="color: #051933; text-decoration: none; font-size: 13px;" class="text-weight-medium">Esqueceu a senha?</a>
            </div>

          </q-form>
        </div>
      </div>
      
      <div class="absolute-bottom text-center q-pb-md text-caption text-grey-5">
        &copy; 2026 Meu Gestor Financeiro
      </div>

    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth' // <--- 1. Importar a Store

export default {
  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore() // <--- 2. Usar a Store
    
    const form = ref({ email: '', password: '' })
    const showPassword = ref(false)
    const loading = ref(false)

    return {
      form,
      showPassword,
      loading,

      async handleLogin () {
        loading.value = true
        
        try {
          // <--- 3. Usar a ação da Store em vez de chamar api.post direto
          // A Store vai fazer o POST, pegar o token e salvar no LocalStorage pra você
          await authStore.login(form.value.email, form.value.password)

          $q.notify({ type: 'positive', message: 'Acesso permitido!' })
          router.push('/') 

        } catch (error) {
          console.error(error)
          $q.notify({ type: 'negative', message: 'E-mail ou senha incorretos' })
        } finally {
          loading.value = false
        }
      }
    }
  }
}
</script>

<style scoped>
/* Ajustes finos */
.text-cyan-4 { color: #2eb7e6; }
</style>