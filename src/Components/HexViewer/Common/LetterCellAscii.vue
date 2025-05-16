<script setup lang="ts">
import {ProcessedLetter} from "../Types";
import {
  onDoubleClickAction,
  onDragStartAction,
  onMouseEnterAction,
  onMouseUpAction,
  onSingleClickAction
} from "../Services/HexViewerMouseActions";
import {computed} from "vue";
import {RangeHelper} from "../../../Utils/RangeHelper";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";

const binStore = useCurrentBinaryFileStore();

const props = defineProps<{
  interactive?: boolean
  letter: ProcessedLetter
}>();

const isSelected = computed(() => {
  return props.interactive && RangeHelper.containsPoint({
    start: binStore.selectionStart,
    end: binStore.selectionEnd
  }, props.letter.letterAddress);
});

</script>

<template>
  <div class="cell-wrapper" :class="`${isSelected ? 'selected' : ''}`">
    <span
        :class="`cell`"
        :draggable="props.interactive"

        @click="(e) => props.interactive && onSingleClickAction(e,  props.letter)"
        @dblclick="(e) => props.interactive && onDoubleClickAction(e, props.letter)"

        @dragstart="(e) => props.interactive && onDragStartAction(e, props.letter)"
        @mouseenter="(e) => props.interactive && onMouseEnterAction(e, props.letter)"
        @mouseup="(e) => props.interactive && onMouseUpAction(e)"
    >
              {{ props.letter.char[props.letter.char.length - 1] }}
      </span>
  </div>

</template>

<style scoped>
.cell-wrapper {
  height: 21px;
  display: inline-block;
  vertical-align:middle;
  width: 7px;


  font-size: 12px;
  text-align: center;
}

.cell {
  width: 100%;
  height: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.selected {
  background-color: var(--hex-viewer-selected-bg-color);
  color: var(--hex-viewer-selected-color);
}
</style>