<script setup lang="ts">
import "./HexViewerColorSheet.css";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import HexViewerHeader from "./HexViewerHeader.vue";
import {computed} from "vue";
import {useVirtualList} from "@vueuse/core";
import HexViewerRow from "./HexViewerRow.vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {handleOnPageReloadScrollToSelection, handleSelectionUpdatedEvents} from "./Services/HexViewerActions";
import {handleCursorMoveAndSelect} from "./Services/HexViewerKeyboardActions";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();


const currentFileRowsCount = computed(() => {
  const rowsCount = Math.ceil(currentBinaryFileStore.fileContent.byteLength / hexViewerConfigStore.rowSize);
  return [...Array(rowsCount).keys()];
});


const {list, containerProps, wrapperProps, scrollTo} = useVirtualList(currentFileRowsCount, {
  itemHeight: 21,
  overscan: 1
});

currentBinaryFileStore.$onAction(({name, store, args}) => {
  return handleSelectionUpdatedEvents(name, args, list.value, scrollTo)
      || handleOnPageReloadScrollToSelection(name, store, args, scrollTo);
});

</script>

<template>
  <div tabindex="-1" id="hex-viewer" class="hex-viewer" @keydown="(e) => handleCursorMoveAndSelect(e, hexViewerConfigStore.rowSize)">
    <HexViewerHeader/>
    <div v-bind="containerProps" class="backdrop">
      <div v-bind="wrapperProps" class="wrapper-inner">
        <HexViewerRow :row-index="listItem.data" v-for="listItem in list"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hex-viewer {
  display: flex;
  flex-direction: column;

  height: 100%;
  background: var(--hex-viewer-bg-color);
  color: var(--hex-viewer-color);
  font-family: Courier, monospace;
  font-size: 12px;
  font-variant-ligatures: none;
  user-select: none;
  text-wrap: nowrap;
}


.backdrop {
  flex-grow: 1;
}

.wrapper-inner {

}

</style>