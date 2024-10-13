<script setup lang="ts">
import LetterCellHex from "./Common/LetterCellHex.vue";
import AddressPart from "./Common/AddressPart.vue";
import LetterCellAscii from "./Common/LetterCellAscii.vue";
import LetterSpacer from "./Common/LetterSpacer.vue";
import {computed} from "vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {ProcessedLetter} from "./Types";

const store = useHexViewerConfigStore();

const letters = computed(() => {
  return Array.from(Array(store.rowSize))
      .map((_, index) => index.toString(16).toUpperCase())
      .map((letter, index): ProcessedLetter => {
        return {
          hex: letter,
          char: letter,
          letterAddress: index,
          matchingRangeIndex: -1,
        };
      });
});

</script>

<template>
  <div class="header">
    <AddressPart :hidden="true" :address="0"/>

    <LetterSpacer/>

    <LetterCellHex v-for="(letter, index) in letters" :letter="letter" :inRowIndex="index"/>

    <LetterSpacer/>

    <LetterCellAscii v-for="(letter) in letters" :letter="letter"/>
  </div>
</template>

<style scoped>

.header {
  font-weight: bold;
  background: var(--hex-viewer-header-bg-color);
  color: var(--hex-viewer-header-color);
}

</style>