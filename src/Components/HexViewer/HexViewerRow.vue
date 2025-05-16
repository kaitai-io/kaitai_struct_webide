<script setup lang="ts">
import {createEmptyLettersToFillRow, processContent} from "./Services/HexViewerProcessor";
import AddressPart from "./Common/AddressPart.vue";
import LetterCellAscii from "./Common/LetterCellAscii.vue";
import LetterSpacer from "./Common/LetterSpacer.vue";
import {computed} from "vue";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";

import {ProcessedLetter} from "./Types";
import LetterCellHex from "./Common/LetterCellHex.vue";

const hexConfig = useHexViewerConfigStore();
const currentFileStore = useCurrentBinaryFileStore();

const props = defineProps<{
  rowIndex: number,
}>();

const processedRow = computed<{
  rowFirstByteIndex: number,
  letters: ProcessedLetter[],
  emptyLetters: ProcessedLetter[]
}>(() => {
  const rowAddress = props.rowIndex * hexConfig.rowSize;
  const remainingFileBytes = currentFileStore.fileContent.byteLength - rowAddress;

  const content = remainingFileBytes >= 0
      ? new Uint8Array(currentFileStore.fileContent, rowAddress, Math.min(hexConfig.rowSize, remainingFileBytes)).slice(0)
      : new Uint8Array([]);

  const letters = processContent(content, {
    rowAddress: rowAddress,
    emojiMode: hexConfig.emojiMode,
    leafs: currentFileStore.parsedFileFlatInfo?.leafs || []
  });
  const emptyLetters = createEmptyLettersToFillRow(letters.length, hexConfig.rowSize);
  return {rowFirstByteIndex: rowAddress, letters, emptyLetters};
});

</script>

<template>
  <div class="hexRow" v-if="processedRow.letters.length > 0">
    <AddressPart v-if="processedRow.letters.length > 0" :hidden="false" :address="processedRow.rowFirstByteIndex"/>

    <LetterSpacer/>

    <LetterCellHex :letter="letter" :inRowIndex="index" v-for="(letter, index) in processedRow.letters" interactive/>
    <LetterCellHex :letter="emptyLetter" :inRowIndex="index + processedRow.letters.length" v-for="(emptyLetter, index) in processedRow.emptyLetters"/>

    <LetterSpacer/>

    <LetterCellAscii :letter="letter" v-for="letter in processedRow.letters" interactive/>
  </div>
</template>

<style scoped>
.hexRow {
  display: block;
  height: 21px;
}
</style>