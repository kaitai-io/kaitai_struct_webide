<script setup lang="ts">

import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {computed} from "vue";

const props = defineProps<{
  address: number,
  hidden: boolean
}>();

const store = useHexViewerConfigStore();
const addressFormatted = computed(() => {
  return store.useHexForAddresses
      ? props.address.toString(16).padStart(8, "0")
      : props.address.toString().padStart(8, "0");
});
</script>

<template>
  <div class="address">
    <span v-if="!props.hidden">{{ addressFormatted }}</span>
  </div>
</template>

<style scoped>
.address {
  color: red;
  width: 60px;
  display: inline-block;
}
</style>