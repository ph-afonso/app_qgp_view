<template>
  <q-card :flat="flat" :bordered="!flat" class="rounded-borders bg-white" style="min-height: 600px;">
    
    <div v-if="!flat" class="q-pa-md bg-navy text-white rounded-top">
      <div class="row items-center">
        <q-icon name="settings" size="24px" class="q-mr-sm text-cyan-brand" />
        <div class="text-h6 text-weight-bold">Configurações</div>
      </div>
      <div class="text-caption text-grey-4">Gerencie os módulos do sistema</div>
    </div>

    <q-list padding class="text-navy">
      <q-expansion-item
        v-for="module in modules"
        :key="module.id"
        :icon="module.icon"
        :label="module.name"
        default-opened
        header-class="text-weight-bold text-subtitle1"
      >
        <q-list class="q-pl-md">
          <q-item 
            v-for="item in module.items" 
            :key="item.id"
            clickable
            v-ripple
            :active="selectedId === item.id"
            active-class="active-setting-item"
            @click="$emit('select', item)"
            class="rounded-borders q-mb-xs q-mr-sm q-py-md"
          >
            <q-item-section avatar style="min-width: 30px">
              <div class="dot" :class="selectedId === item.id ? 'bg-cyan-brand' : 'bg-grey-4'"></div>
            </q-item-section>
            <q-item-section class="text-weight-medium">{{ item.label }}</q-item-section>
            <q-item-section side v-if="flat">
               <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </q-card>
</template>

<script>
export default {
  props: {
    modules: Array,
    selectedId: String,
    flat: Boolean
  },
  emits: ['select']
}
</script>

<style scoped>
.text-navy { color: #051933; }
.bg-navy { background-color: #051933; }
.text-cyan-brand { color: #2eb7e6; }
.bg-cyan-brand { background-color: #2eb7e6; }
.rounded-top { border-top-left-radius: 8px; border-top-right-radius: 8px; }
.rounded-borders { border-radius: 8px; }
.active-setting-item { background-color: v-bind('flat ? "transparent" : "#e6f7ff"'); color: #051933; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
</style>