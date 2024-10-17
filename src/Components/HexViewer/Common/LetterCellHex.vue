<script setup lang="ts">
import LetterSpacer from "./LetterSpacer.vue";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {ProcessedLetter} from "../Types";
import {
  onDoubleClickAction,
  onDragStartAction,
  onMouseEnterAction,
  onMouseUpAction,
  onSingleClickAction
} from "../Services/HexViewerMouseActions";
import {computed} from "vue";
import {UpdateSelectionEvent, useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {RangeHelper} from "../../../Utils/RangeHelper";
import {prepareContextMenuOptions} from "../ContextMenu/HexViewerContextMenu";
import ContextMenu from "@imengyu/vue3-context-menu";
import {HEX_VIEWER_SOURCE} from "../Services/HexViewerActions";

const store = useHexViewerConfigStore();
const binStore = useCurrentBinaryFileStore();

const props = defineProps<{
  interactive?: boolean
  inRowIndex: number
  letter: ProcessedLetter
}>();

const isSelected = computed(() => {
  return props.interactive && RangeHelper.containsPoint({
    start: binStore.selectionStart,
    end: binStore.selectionEnd
  }, props.letter.letterAddress);
});


const isOdd = computed(() => {
  if (!props.interactive || props.letter.matchingRangeIndex === -1) return "";
  return props.letter.matchingRangeIndex % 2 === 0
      ? "odd"
      : "even";
});

const rangePlacement = computed(() => {
  if (!props.interactive || !props.letter.matchingRange) return "";
  const matchingRange = RangeHelper.getSimpleRange(props.letter.matchingRange);
  const matchOnTheLeft = matchingRange.start === props.letter.letterAddress;
  const matchOnTheRight = matchingRange.end === props.letter.letterAddress;
  if (matchOnTheLeft && matchOnTheRight) {
    return "round-both";
  } else if (matchOnTheLeft) {
    return "round-left";
  } else if (matchOnTheRight) {
    return "round-right";
  } else {
    return "";
  }
});

const isGapAfter = () => {
  if (store.columns == 0 || store.columns == 1) return false;
  const isLastInRow = props.inRowIndex + 1 == store.rowSize;
  if (isLastInRow) return false;
  return (props.inRowIndex + 1) % store.columns === 0;
};

const onContextMenu = (e: MouseEvent, letter: ProcessedLetter) => {
  e.preventDefault();
  if (!isSelected.value) {
    const event: UpdateSelectionEvent = {
      startNew: letter.letterAddress,
      endNew: letter.letterAddress,
      range: letter.matchingRange,
      pivot: letter.letterAddress,
      source: HEX_VIEWER_SOURCE
    };
    binStore.updateSelectionEvent(event);
  }
  const contextMenuOptions = prepareContextMenuOptions(e);
  ContextMenu.showContextMenu(contextMenuOptions);
};

</script>

<template>
  <div class="cell-wrapper" :class="rangePlacement"
       :draggable="props.interactive"

       @click="(e) => props.interactive && onSingleClickAction(e,  props.letter)"
       @dblclick="(e) => props.interactive && onDoubleClickAction(e, props.letter)"

       @dragstart="(e) => props.interactive && onDragStartAction(e, props.letter)"
       @mouseenter="(e) => props.interactive && onMouseEnterAction(e, props.letter)"
       @mouseup="(e) => props.interactive && onMouseUpAction(e)"
       @contextmenu="(e) => props.interactive && onContextMenu(e, props.letter)"
  >
    <div class="cell"
         :class="`${isOdd} ${isSelected ? 'selected' : ''} ${rangePlacement}`">
      <span>{{ props.letter.hex }}</span>
    </div>

  </div>
  <LetterSpacer v-if="isGapAfter()"/>

</template>

<style scoped>
.cell-wrapper {
  height: 19px;
  display: inline-block;
  vertical-align: middle;

  width: 22px;
  padding-top: 1px;
  padding-bottom: 1px;
}

.cell {
  width: 100%;
  height: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
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

.cell-wrapper.round-left {
  padding-left: 1px;
  width: 21px;
}


.cell-wrapper.round-right {
  padding-right: 1px;
  width: 21px;
}

.cell-wrapper.round-both {
  padding: 1px;
  width: 20px;
}

.cell.round-left {
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
}


.cell.round-right {
  border-bottom-right-radius: 4px;
  border-top-right-radius: 4px;
}

.cell.round-both {
  border-radius: 4px;
}
</style>