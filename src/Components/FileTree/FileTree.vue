<script setup lang="ts">

import FileTreeBottomActions from "./FileTreeActionButtons.vue";
import {useFileSystems} from "./Store/FileSystemsStore";
import FileTreeNodes from "./FileTreeNodes.vue";
import FileDrop from "./FileDrop.vue";

const store = useFileSystems();


</script>

<template>
  <div id="fileTreeNew" class="file-tree-component">
    <div class="file-tree-list-container">
      <div class="file-tree-list-container-inner">
        <FileTreeNodes :fileSystem="fileSystem" v-for="fileSystem in store.fileSystems"/>
        <div class="spacer"/>
      </div>
    </div>
    <FileDrop/>
    <FileTreeBottomActions/>
  </div>
</template>

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

.file-tree-list-container-inner {
  min-width: 100%;
  width: max-content;
}

.spacer {
  height: 10px;
}

</style>