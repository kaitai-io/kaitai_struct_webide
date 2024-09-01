<script setup lang="ts">
import {useFileSystems} from "./Store/FileSystemsStore";
import {
  BINARY_FILE,
  CLOSED_FOLDER,
  EMPTY_FOLDER,
  KSY_FILE,
  OPEN_FOLDER,
  TreeNodeDisplay
} from "./FileSystemVisitors/FileSystemVisitor";
import FileStoreTreeNodeIcon from "./FileTreeNodeIcon.vue";
import {computed} from "vue";
import {useAppStore} from "../../Stores/AppStore";

const store = useFileSystems();
const appStore = useAppStore();
const props = defineProps<{
  item: TreeNodeDisplay
}>();

const activateRow = () => {
  store.selectPath(props.item.fullPath);
};

const doubleClick = () => {
  switch (props.item.type) {
    case KSY_FILE: {
      appStore.updateSelectedKsyFile({
        storeId: props.item.storeId,
        filePath: prepareFilePathFromNode(props.item)
      });
      return;
    }
    case BINARY_FILE: {
      appStore.updateSelectedBinaryFile({
        storeId: props.item.storeId,
        filePath: prepareFilePathFromNode(props.item)
      });
      return;
    }
    case EMPTY_FOLDER: {
      return;
    }
    case OPEN_FOLDER: {
      store.closePath(props.item.fullPath);
      return;
    }
    case CLOSED_FOLDER: {
      store.openPath(props.item.fullPath);
      return;
    }
  }
};

const prepareFilePathFromNode = (node: TreeNodeDisplay) => node.fullPath.split("/").slice(1).join("/");


const isSelected = computed(() => {
  return store.selectedPath === props.item.fullPath;
});


</script>

<template>
  <div class="row-wrapper" :class="{isSelected}">
    <div class="roww" :style="{marginLeft: item.depth * 16 + 'px'}"
         @click="() => activateRow()"
         @dblclick="() => doubleClick()">
      <FileStoreTreeNodeIcon :type="item.type"/>
      <span class="row-description">{{ item.fileName }}</span>
    </div>
  </div>

</template>

<style scoped>

.row-wrapper {
  transition: background-color 200ms;
  border-radius: 2px;

}

.row-wrapper:hover {
  background-color: #344C64;
}

.roww {
  display: flex;
  flex-direction: row;
  text-wrap: nowrap;
  height: 16px;

  animation:  100ms ease-out 0s 1 unshrink;
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