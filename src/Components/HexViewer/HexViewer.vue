<script setup lang="ts">
import "./HexViewerColorSheet.css";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import HexViewerHeader from "./HexViewerHeader.vue";
import {computed, h} from "vue";
import {useVirtualList} from "@vueuse/core";
import HexViewerRow from "./HexViewerRow.vue";
import {useHexViewerConfigStore} from "./Store/HexViewerConfigStore";
import {handleOnPageReloadScrollToSelection, handleSelectionUpdatedEvents} from "./Services/HexViewerActions";
import {handleCursorMoveAndSelect} from "./Services/HexViewerKeyboardActions";
import ContextMenu from "@imengyu/vue3-context-menu";
import {FileActionsWrapper} from "../../v1/utils/Files/FileActionsWrapper";
import {exportToJson} from "../../GlobalActions/ExportToJson";
import {CurrentGoldenLayout} from "../../v1/GoldenLayout/GoldenLayoutUI";

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

const contextMenu = (e: MouseEvent) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    customClass: "menu-trick",
    theme: "flat dark",
    clickCloseOnOutside: true,
    items: [
      {
        label: "Download(selection)",
        onClick: () => {
          FileActionsWrapper.downloadBinFromSelection();
        },
        disabled: currentBinaryFileStore.selectionStart === -1,
        icon: () => h("i", {class: "glyphicon glyphicon-cloud-download", style: {height: "20px"}})
      },
      {
        label: "Export to JSON",
        onClick: async () => {
          const json = await exportToJson();
          CurrentGoldenLayout.addExportedToJsonTab("json export", json);
        }
      },
      {
        label: "Export to JSON(HEX)",
        onClick: async () => {
          const json = await exportToJson(true);
          CurrentGoldenLayout.addExportedToJsonTab("json export(HEX)", json);
        }
      }
    ]
  });
};


</script>

<template>
  <div tabindex="-1" id="hex-viewer" class="hex-viewer"
       @keydown="(e) => handleCursorMoveAndSelect(e, hexViewerConfigStore.rowSize)"
       @contextmenu="contextMenu">
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