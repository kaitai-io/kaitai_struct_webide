<script setup lang="ts">
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import HexViewerHeader from "./HexViewerHeader.vue";
import {computed} from "vue";
import {useVirtualList} from "@vueuse/core";
import HexViewerRow from "./HexViewerRow.vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {prepareOddEvenRangesForRows} from "./Services/HexViewerProcessorOddEven";
import {handleSelectionUpdatedEvents} from "./Services/HexViewerActions";
import {HandleCursorMoveAndSelect} from "./Services/HexViewerKeyboardActions";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();


const currentFileRowsCount = computed(() => {
  const rowsCount = Math.ceil(currentBinaryFileStore.fileContent.byteLength / hexViewerConfigStore.rowSize);
  return [...Array(rowsCount).keys()];
});

const oddEvenRanges = computed(() => {
  return prepareOddEvenRangesForRows(currentBinaryFileStore.parsedFileFlattened, hexViewerConfigStore.rowSize);
});

const {list, containerProps, wrapperProps, scrollTo} = useVirtualList(currentFileRowsCount, {
  itemHeight: 21,
  overscan: 2
});

currentBinaryFileStore.$onAction(({name, args}) => {
  handleSelectionUpdatedEvents(name, args, scrollTo);
});

</script>

<template>
  <div tabindex="-1" id="hex-viewer" class="hex-viewer" @keydown="HandleCursorMoveAndSelect">
    <HexViewerHeader/>
    <div v-bind="containerProps" class="wrapper">
      <div v-bind="wrapperProps" class="wrapper-inner">
        <HexViewerRow :processed-data="oddEvenRanges" :row-index="listItem.data" v-for="listItem in list"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hex-viewer {
  display: flex;
  flex-direction: column;

  height: 100%;
  background: white;
  color: #333;
  font-family: Courier, monospace;
  font-size: 12px;
  font-variant-ligatures: none;
  user-select: none;
}


.wrapper {
  flex-grow: 1;
}

.wrapper-inner {

}

</style>