<script setup lang="ts">
import {computed} from "vue";
import {IDockviewPanelHeaderProps} from "dockview-vue";
import {useErrorStore} from "../../ErrorPanel/Store/ErrorStore";
import {ExclamationTriangleIcon} from "@heroicons/vue/16/solid";

const store = useErrorStore();
const props = defineProps<{
  params: IDockviewPanelHeaderProps
}>();

const error = computed(() => {
  return store.error;
});

</script>

<template>
  <div class="dv-default-tab">
    <div class="dv-default-tab-content title">
      <ExclamationTriangleIcon v-if="error" class="icon error"/>
      Errors
    </div>
  </div>
</template>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  overflow: scroll;
}

.icon {
  height: 12px;
}

.error {
  color: #BB5050;
}
</style>