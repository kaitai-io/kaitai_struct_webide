<script setup lang="ts">
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import HexViewerHeader from "./HexViewerHeader.vue";
import {computed} from "vue";
import {useVirtualList} from "@vueuse/core";
import {HEX_VIEWER_GO_TO_INDEX, MittEmitter} from "../../v1/utils/MittEmitter";
import HexViewerRow from "./HexViewerRow.vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {prepareOddEvenRangesForRows} from "./Services/HexViewerProcessorOddEven";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();


const currentFileRowsCount = computed(() => {
  const rowsCount = Math.ceil(currentBinaryFileStore.fileContent.byteLength / hexViewerConfigStore.rowSize);
  const rowsCountAndOverflow = rowsCount + 1;
  return [...Array(rowsCountAndOverflow).keys()];
});

const oddEvenRanges = computed(() => {
  return prepareOddEvenRangesForRows(currentBinaryFileStore.parsedFileFlattened, hexViewerConfigStore.rowSize);
});

const {list, containerProps, wrapperProps, scrollTo} = useVirtualList(currentFileRowsCount, {
  itemHeight: 21,
  overscan: 5
});

MittEmitter.on(HEX_VIEWER_GO_TO_INDEX, (goToIndexEvent: number) => {
  scrollTo(Math.floor(goToIndexEvent / hexViewerConfigStore.rowSize));
});

</script>

<template>
  <div id="hex-viewer" class="hex-viewer">
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
  height: 100%;

  display: block;
  background: white;
  color: #333;
  font-family: Courier, monospace;
  font-size: 12px;
  font-variant-ligatures: none;
  user-select: none;

}

.wrapper {
  height: 100%;
}

.wrapper-inner {

}

</style>