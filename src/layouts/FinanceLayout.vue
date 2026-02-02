<template>
  <div class="q-pa-md">
    <div class="text-h4 q-mb-md text-primary">Módulo Financeiro</div>

    <q-card>
      <q-tabs
        align="justify"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
        dense
        >
        <q-route-tab to="/finance" label="Dashboard" icon="dashboard" exact />
        <q-route-tab to="/finance/transactions" label="Lançamentos" icon="list" exact />
        
        <q-route-tab to="/finance/accounts" label="Carteira" icon="account_balance_wallet" exact />
        
        <q-route-tab to="/finance/categories" label="Categorias" icon="category" exact />
        </q-tabs>

      <q-separator />

      <div class="q-pa-md">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </q-card>
  </div>
</template>

<script setup>
// Não precisamos mais de v-model="tab" nem refs, 
// pois o q-route-tab gerencia o estado baseado na URL automaticamente.
</script>

<style scoped>
/* Transição suave simples */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>