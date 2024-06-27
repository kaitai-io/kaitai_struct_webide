<script setup lang="ts">
import LetterCellHex from "./Common/LetterCellHex.vue";
import AddressPart from "./Common/AddressPart.vue";
import LetterCellAscii from "./Common/LetterCellAscii.vue";
import LetterSpacer from "./Common/LetterSpacer.vue";
import {computed} from "vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {OddStatus, RangePlacementStatus} from "./Types";
const store = useHexViewerConfigStore();

const letters = computed(() => {
  return Array.from(Array(store.rowSize))
      .map((_, index) => index.toString(16).toUpperCase())
      .map((letter, index) => {
        return {
          hex: letter,
          char: letter,
          rangePlacement: RangePlacementStatus.NONE,
          oddStatus: OddStatus.NONE,
          index: index,
          isSelected: false
        };
      });
});

</script>

<template>
  <div class="header">
    <AddressPart :hidden="true" :address="0"/>
    <LetterSpacer/>

    <span>
      <LetterCellHex v-for="(letter, index) in letters" :letter="letter" :inRowIndex="index"/>
    </span>

    <LetterSpacer/>
    <span>
      <LetterCellAscii v-for="(letter) in letters" :letter="letter"/>
    </span>
  </div>
</template>

<style scoped>

.header {
  font-weight: bold;
  background: var(--hex-viewer-header-bg-color);
  color: var(--hex-viewer-header-color);
}

</style>