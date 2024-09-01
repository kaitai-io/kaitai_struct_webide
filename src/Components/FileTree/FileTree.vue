<script setup lang="ts">

import FileTreeBottomActions from "./FileTreeActionButtons.vue";
import {useFileSystems} from "./Store/FileSystemsStore";
import FileTreeNodes from "./FileTreeNodes.vue";
import {onMounted} from "vue";
import {FILE_SYSTEM_TYPE_LOCAL, IFsItem, ITEM_MODE_DIRECTORY} from "../../v1/FileSystems/FileSystemsTypes";
import {LocalForageWrapper} from "../../v1/utils/LocalForageWrapper";
import {initKaitaiFs} from "../../v1/FileSystems/KaitaiFileSystem";
import {OldLocalStorageFileSystem} from "../../v1/FileSystems/OldLocalStorageFileSystem";

const store = useFileSystems();

onMounted(async () => {
  const defaultItem: IFsItem = {
    fsType: FILE_SYSTEM_TYPE_LOCAL,
    type: ITEM_MODE_DIRECTORY,
    children: {},
    fn: "Local storage"
  };
  const storedItem = await LocalForageWrapper.getFsItem(`fs_files`);
  if (storedItem) {
    storedItem.fn = "Local storage";
  }
  store.addFileSystem(initKaitaiFs());
  store.addFileSystem(new OldLocalStorageFileSystem(storedItem || defaultItem));
});

</script>

<template>
  <div id="fileTreeNew" class="file-tree-component">
    <div class="file-tree-list-container">
      <FileTreeNodes :fileSystem="fileSystem" v-for="fileSystem in store.fileSystems"/>
    </div>
    <FileTreeBottomActions/>
  </div>
</template>

<!--font: 12px/normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;-->

<style scoped>
.file-tree-component {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Arial;
  font-size: 12px;
  color: #ccc;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.file-tree-list-container {
  overflow: scroll;
  width: 100%;
  flex-grow: 1;
}

</style>