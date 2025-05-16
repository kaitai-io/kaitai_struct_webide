<script setup lang="ts">
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {computed} from "vue";
import {useHexViewerConfigStore} from "../HexViewer/Store/HexViewerConfigStore";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();

const formatAddressIndex = (index: number, useHex: boolean) => {
  if (index === -1) return "N/A";
  return useHex
      ? `0x${index.toString(16)}`
      : index.toString();
};

const formatLength = (start: number, end: number) => {
  return start !== -1
      ? `0x${(end - start + 1).toString(16).padStart(2, "0")}`
      : "N/A";
};

const selection = computed(() => {
  return {
    start: formatAddressIndex(currentBinaryFileStore.selectionStart, hexViewerConfigStore.useHexForAddresses),
    end: formatAddressIndex(currentBinaryFileStore.selectionEnd, hexViewerConfigStore.useHexForAddresses),
    length: formatLength(currentBinaryFileStore.selectionStart, currentBinaryFileStore.selectionEnd),
  };
});
</script>

<template>
  <div id="selectionLengthDiv">
    <span>Selection: [{{ selection.length }}] {{ selection.start }} - {{ selection.end }}</span>
  </div>
</template>

<style scoped>

</style>