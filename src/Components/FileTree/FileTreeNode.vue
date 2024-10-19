<script setup lang="ts">
import {useFileSystems} from "./Store/FileSystemsStore";
import {TreeNodeDisplay, TreeNodeDisplayType} from "./FileSystemVisitors/FileSystemFileTreeMapper";
import FileStoreTreeNodeIcon from "./FileTreeNodeIcon.vue";
import {computed, toRaw} from "vue";
import {useAppStore} from "../../Stores/AppStore";
import ContextMenu from "@imengyu/vue3-context-menu";
import {prepareContextMenuOptions} from "./ContextMenu/FileTreeNodeContextMenu";
import {FileSystemPath} from "./FileSystemsTypes";

const store = useFileSystems();
const appStore = useAppStore();
const props = defineProps<{
  item: TreeNodeDisplay
}>();

const activateRow = () => {
  store.selectPath(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
};

const doubleClick = () => {
  switch (props.item.type) {
    case TreeNodeDisplayType.KSY_FILE: {
      appStore.updateSelectedKsyFile(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
      return;
    }
    case TreeNodeDisplayType.BINARY_FILE: {
      appStore.updateSelectedBinaryFile(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
      return;
    }
    case TreeNodeDisplayType.EMPTY_FOLDER: {
      return;
    }
    case TreeNodeDisplayType.OPEN_FOLDER: {
      store.closePath(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
      return;
    }
    case TreeNodeDisplayType.CLOSED_FOLDER: {
      store.openPath(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
      return;
    }
  }
};

const contextMenu = (e: MouseEvent) => {
  e.preventDefault();
  store.selectPath(FileSystemPath.fromFullPathWithStore(props.item.fullPathWithStore));
  const contextMenuOptions = prepareContextMenuOptions(e, toRaw(props.item));
  ContextMenu.showContextMenu(contextMenuOptions);
};


const isSelected = computed(() => {
  return store.selectedPath === props.item.fullPathWithStore;
});


</script>

<template>
  <div class="row-wrapper" draggable="true" :class="{isSelected}"
       @click="activateRow"
       @dblclick="doubleClick"
       @contextmenu="contextMenu">
    <div class="row-content" :style="{marginLeft: item.depth * 16 + 'px'}">
      <FileStoreTreeNodeIcon :type="item.type"/>
      <span class="row-description">{{ item.fileName }}</span>
    </div>
  </div>
</template>

<style scoped>

.row-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transition: background-color 200ms;
  border-radius: 2px;
}

.row-wrapper:hover {
  background-color: #344C64;
}

.row-content {
  display: flex;
  flex-direction: row;

  text-wrap: nowrap;
  height: 16px;

  animation: 100ms ease-out 0s 1 unshrink;
}

.row-description {
  margin-left: 4px;
}

.isSelected {
  background-color: #57A6A1 !important;
  color: white;
}

@keyframes unshrink {
  0% {
    height: 0;
  }
  100% {
    height: 16px;
  }
}

</style>