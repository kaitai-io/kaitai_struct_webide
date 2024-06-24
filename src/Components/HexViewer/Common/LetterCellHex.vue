<script setup lang="ts">
import {
  DragSelectionMoveEvent,
  EndDragSelection,
  SelectRangeToWhichByteBelongs,
  SingleByteClickAction,
  StartDragSelection
} from "../Services/HexViewerActions";
import LetterSpacer from "./LetterSpacer.vue";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {computed} from "vue";
import {OddStatus, ProcessedLetter, RangePlacementStatus} from "../Types";

const store = useHexViewerConfigStore();

const props = defineProps<{
  interactive?: boolean
  inRowIndex: number
  letter: ProcessedLetter
}>();


const oddEvenClass = (letter: ProcessedLetter) => {
  switch (letter.oddStatus) {
    case OddStatus.ODD:
      return "odd";
    case OddStatus.EVEN:
      return "even";
    default:
      return "";
  }
};
const rangePlacementClass = (letter: ProcessedLetter) => {
  switch (letter.rangePlacement) {
    case RangePlacementStatus.FULL_RANGE:
      return "lr2";
    case RangePlacementStatus.END_OF_RANGE:
      return "r2";
    case RangePlacementStatus.START_OF_RANGE:
      return "l2";
    default:
      return "";
  }
};

const splitters = computed(() => {
  return Math.floor(store.rowSize / store.columns);
});

const isGapAfter = () => {
  if(store.columns == 0 || store.columns == 1) return false;
  const isLastInRow = props.inRowIndex + 1 == store.rowSize;
  if (isLastInRow) return false;
  return (props.inRowIndex + 1) % store.columns === 0;
};
</script>

<template>
  <div :class="`letter-container ${rangePlacementClass(props.letter)}`"
       @click="(e) => props.interactive && SingleByteClickAction(e,  props.letter)"
       @mousedown="(e) => props.interactive && StartDragSelection(e, props.letter)"
       @mouseenter="(e) => props.interactive && DragSelectionMoveEvent(e, props.letter)"
       @mouseup="(e) => props.interactive && EndDragSelection(e)"
       @dblclick="(e) => props.interactive && SelectRangeToWhichByteBelongs(e, props.letter)"
  >
  <span
      :class="`cell ${oddEvenClass(props.letter)}  ${props.letter.isSelected ? 'selected' : ''}`"

  >
              {{ props.letter.hex }}
      </span>
  </div>
  <LetterSpacer v-if="isGapAfter()"/>

</template>

<style scoped>
.letter-container {
  width: 24px;
  display: inline-block;
  color: black;
  margin: auto;
  text-align: center;
  padding-top: 1px;
  padding-bottom: 1px;
}

.cell {
  width: 100%;
  height: 100%;
  display: inline-block;
  border-radius: inherit;
}

.odd {
  background-color: #ddddff;
}

.even {
  background-color: #c4c4ff;
}

.selected {
  background-color: #0076e0;
  color: white;
}

.l2 {
  border-radius: 4px 0 0 4px;
  padding-left: 1px;
}


.r2 {
  border-radius: 0 4px 4px 0;
  padding-right: 1px;
}

.lr2 {
  border-radius: 4px 4px 4px 4px;
  padding: 1px;
}
</style>