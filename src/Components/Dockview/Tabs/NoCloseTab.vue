<script setup lang="ts">
import {IDockviewPanelHeaderProps} from "dockview-vue";
import {useDockviewStore} from "../Store/DockviewStore";
import {computed} from "vue";

const store = useDockviewStore()
const props = defineProps<{
  params: IDockviewPanelHeaderProps
}>();

const title = computed(() => {
  return store.titles[props.params.api.id] || props.params.api.title || props.params.api.id
})

</script>

<template>
  <div class="dv-default-tab">
    <div class="dv-default-tab-content title">
      {{ title }}
    </div>
  </div>
</template>

<style scoped>
</style>