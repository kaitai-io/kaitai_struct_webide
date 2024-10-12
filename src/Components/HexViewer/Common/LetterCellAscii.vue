<script setup lang="ts">
import {ProcessedLetter} from "../Types";
import {
  onMouseUpAction,
  onSingleClickAction,
  onMouseEnterAction,
  onDoubleClickAction,
  onDragStartAction
} from "../Services/HexViewerMouseActions";
import {computed} from "vue";
import {RangeHelper} from "../../../v1/utils/RangeHelper";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";

const binStore = useCurrentBinaryFileStore();

const props = defineProps<{
  interactive?: boolean
  letter: ProcessedLetter
}>();

const isSelected = computed(() => {
  return props.interactive && RangeHelper.containsPoint({start: binStore.selectionStart, end: binStore.selectionEnd}, props.letter.index);
});

</script>

<template>
  <span
      :class="`cell ${isSelected ? 'selected' : ''}`"
      :draggable="props.interactive"

      @click="(e) => props.interactive && onSingleClickAction(e,  props.letter)"
      @dblclick="(e) => props.interactive && onDoubleClickAction(e, props.letter)"

      @dragstart="(e) => props.interactive && onDragStartAction(e, props.letter)"
      @mouseenter="(e) => props.interactive && onMouseEnterAction(e, props.letter)"
      @mouseup="(e) => props.interactive && onMouseUpAction(e)"
  >
              {{ props.letter.char[props.letter.char.length - 1] }}
      </span>

</template>

<style scoped>
.cell {
  width: 7px;
  font-size: 12px;
  height: 100%;
  display: inline-block;
  border-radius: inherit;
}

.selected {
  background-color: var(--hex-viewer-selected-bg-color);
  color: var(--hex-viewer-selected-color);
}
</style>