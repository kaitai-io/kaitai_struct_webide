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
  <div class="address-wrapper">
    <div class="address" v-if="!props.hidden">
      <span>{{ addressFormatted }}</span>
    </div>
  </div>
</template>

<style scoped>
.address-wrapper {
  display: inline-block;
  height: 21px;
  vertical-align: middle;

  width: 60px;
  text-align: center;
  color: var(--hex-viewer-address-color);
}

.address {
  width: 100%;
  height: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
}
</style>