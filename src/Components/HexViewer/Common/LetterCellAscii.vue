<script setup lang="ts">
import {ProcessedLetter} from "../Types";
import {
  DragSelectionMoveEvent,
  EndDragSelection,
  SelectRangeToWhichByteBelongs,
  SingleByteClickAction,
  StartDragSelection
} from "../Services/HexViewerMouseActions";

const props = defineProps<{
  interactive?: boolean
  letter: ProcessedLetter
}>();


</script>

<template>
  <span
      :class="`cell ${props.letter.isSelected ? 'selected' : ''}`"
      @click="(e) => props.interactive && SingleByteClickAction(e,  props.letter)"
      @mousedown="(e) => props.interactive && StartDragSelection(e, props.letter)"
      @mouseenter="(e) => props.interactive && DragSelectionMoveEvent(e, props.letter)"
      @mouseup="(e) => props.interactive && EndDragSelection(e)"
      @dblclick="(e) => props.interactive && SelectRangeToWhichByteBelongs(e, props.letter)"
  >
              {{ props.letter.char[props.letter.char.length - 1] }}
      </span>

</template>

<style scoped>
.cell {
  width: 8px;
  height: 100%;
  display: inline-block;
  border-radius: inherit;
}

.selected {
  background-color: #0076e0;
  color: white;
}
</style>