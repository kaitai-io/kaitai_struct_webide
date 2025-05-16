<script setup lang="ts">
import "./HexViewerColorSheet.css";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import HexViewerHeader from "./HexViewerHeader.vue";
import {computed, onMounted} from "vue";
import {useVirtualList} from "@vueuse/core";
import HexViewerRow from "./HexViewerRow.vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {handleOnPageReloadScrollToSelection, handleSelectionUpdatedEvents} from "./Services/HexViewerActions";
import {handleCursorMoveAndSelect} from "./Services/HexViewerKeyboardActions";
import {GL_HEX_VIEWER_ID} from "../Dockview/DockviewerConfig";
import {loadBinaryFileAction} from "../../GlobalActions/LoadBinaryFile";
import {useAppStore} from "../../Stores/AppStore";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();


const currentFileRowsCount = computed(() => {
  const rowsCount = Math.ceil((currentBinaryFileStore.fileContent.byteLength || 0) / hexViewerConfigStore.rowSize);
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

hexViewerConfigStore.$onAction(({name, store, args}) => {
  if (name !== "jumpToAddress") return;
  const jumpIndex = args[0] as number;
  scrollTo(Math.floor(jumpIndex / store.rowSize));
});

onMounted(async () => {
  const fileSystemsStore = useAppStore();
  loadBinaryFileAction(fileSystemsStore.selectedBinaryInfo);
});

</script>

<template>
  <div :id="GL_HEX_VIEWER_ID" tabindex="-1" class="hex-viewer"
       @keydown="(e) => handleCursorMoveAndSelect(e, hexViewerConfigStore.rowSize)">
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
  font-family: "JetBrains Mono", monospace;
  font-weight: lighter;

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