import { defineStore } from 'pinia';
import { api } from 'boot/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || '',
    user: JSON.parse(localStorage.getItem('user_data')) || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    // Recebe email e password como argumentos
    async login(email, password) {
      try {
        // 1. URL: Adicionei a barra no final '/auth/login/' (Padrão Django)
        // 2. Payload: { email, password } cria o JSON exato que você precisa
        const response = await api.post('/auth/login/', { email, password });
        
        // Mapeamento do retorno (ajuste conforme seu JSON de resposta real)
        const { access, refresh, user_name, user_email, user_id } = response.data;
        
        this.token = access;
        this.user = {
          id: user_id,
          name: user_name,
          email: user_email
        };

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_data', JSON.stringify(this.user));

        // Atualiza o header para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        return true;
      } catch (error) {
        console.error('Erro no Login:', error);
        throw error;
      }
    },

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      delete api.defaults.headers.common['Authorization'];
    }
  }
});