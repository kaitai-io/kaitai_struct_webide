<script setup lang="ts">
import LetterSpacer from "./LetterSpacer.vue";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {OddStatus, ProcessedLetter, RangePlacementStatus} from "../Types";
import {
  onDoubleClickAction,
  onDragStartAction,
  onMouseEnterAction,
  onMouseUpAction,
  onSingleClickAction
} from "../Services/HexViewerMouseActions";

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

const isGapAfter = () => {
  if (store.columns == 0 || store.columns == 1) return false;
  const isLastInRow = props.inRowIndex + 1 == store.rowSize;
  if (isLastInRow) return false;
  return (props.inRowIndex + 1) % store.columns === 0;
};
</script>

<template>
  <div :class="`letter-container ${rangePlacementClass(props.letter)}`"
       :draggable="props.interactive"

       @click="(e) => props.interactive && onSingleClickAction(e,  props.letter)"
       @dblclick="(e) => props.interactive && onDoubleClickAction(e, props.letter)"

       @dragstart="(e) => props.interactive && onDragStartAction(e, props.letter)"
       @mouseenter="(e) => props.interactive && onMouseEnterAction(e, props.letter)"
       @mouseup="(e) => props.interactive && onMouseUpAction(e)"
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
  width: 22px;
  display: inline-block;
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
  background-color: var(--hex-viewer-odd-bg-color);
  color: var(--hex-viewer-odd-color);
}

.even {
  background-color: var(--hex-viewer-even-bg-color);
  color: var(--hex-viewer-even-color);
}

.selected {
  background-color: var(--hex-viewer-selected-bg-color);
  color: var(--hex-viewer-selected-color);
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