<script setup lang="ts">
import {createEmptyLettersToFillRow, createLetters} from "./Services/HexViewerProcessor";
import LetterCellHex from "./Common/LetterCellHex.vue";
import AddressPart from "./Common/AddressPart.vue";
import LetterCellAscii from "./Common/LetterCellAscii.vue";
import LetterSpacer from "./Common/LetterSpacer.vue";
import {computed} from "vue";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";

import {IExportedValueRangesForRow} from "./Types";

const hexConfig = useHexViewerConfigStore();
const currentFileStore = useCurrentBinaryFileStore();

const props = defineProps<{
  rowIndex: number,
  processedData?: IExportedValueRangesForRow[]
}>();

const processedRow = computed<{ rowFirstByteIndex: number, letters: any, emptyLetters: any }>(() => {
  const rowAddress = props.rowIndex * hexConfig.rowSize;
  const remainingFileBytes = currentFileStore.fileContent.byteLength - rowAddress;

  const data = remainingFileBytes >= 0
      ? new Uint8Array(currentFileStore.fileContent, rowAddress, Math.min(hexConfig.rowSize, remainingFileBytes)).slice(0)
      : new Uint8Array([]);

  const letters = createLetters(data, {
    rowIndex: rowAddress,
    selectionStart: currentFileStore.selectionStart,
    selectionEnd: currentFileStore.selectionEnd,
    oddEvenRanges: props.processedData?.find(item => item.rowAddress === rowAddress)?.data || [],
    emojiMode: hexConfig.emojiMode
  });
  const emptyLetters = createEmptyLettersToFillRow(letters.length, hexConfig.rowSize);
  return {rowFirstByteIndex: rowAddress, letters, emptyLetters};
});

</script>

<template>
  <div class="hexRow">
    <AddressPart :hidden="false" :address="processedRow.rowFirstByteIndex"/>

    <LetterSpacer/>

    <span>
      <LetterCellHex :letter="letter" :inRowIndex="index" v-for="(letter, index) in processedRow.letters" interactive/>
      <LetterCellHex :letter="emptyLetter" :inRowIndex="index"
                     v-for="(emptyLetter, index) in processedRow.emptyLetters"/>
    </span>

    <LetterSpacer/>

    <span>
      <LetterCellAscii :letter="letter" v-for="letter in processedRow.letters" interactive/>
    </span>
  </div>
</template>

<style scoped>
.hexRow {
  line-height: 19px;
  height: 21px;
}
</style>