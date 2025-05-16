<script setup lang="ts">

import {ref} from "vue";
import {processUploadedFileList} from "../../GlobalActions/UploadFiles";
import {useFileDialog} from "@vueuse/core";

const draggingOver = ref(false);
const canDrop = ref(false);

const {open: openFileUpload, onChange: onChangeFile} = useFileDialog();
const {open: openDirectoryUpload, onChange: onChangeDirectory} = useFileDialog({
  directory: true
});
onChangeFile((files) => processUploadedFileList(files, false, "UploadModal"));
onChangeDirectory((files) => processUploadedFileList(files, true, "UploadModal"));


const drop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (canDrop) {
    const files = event.dataTransfer.files;
    processUploadedFileList(files, false, "Drag&Drop");
  }
  draggingOver.value = false;
  canDrop.value = false;
};

const dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  draggingOver.value = true;
  canDrop.value = !!event.dataTransfer && !event.dataTransfer.getData("draggedFileTreeItem");
};

const dragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  draggingOver.value = false;
  canDrop.value = false;
};

</script>

<template>
  <div class="file-drop-inner" :class="{'dragging-over': draggingOver && canDrop, 'active': !draggingOver}" @drop="drop"
       @dragover="dragOver"
       @click="openFileUpload()"
       @dragleave="dragLeave">
    <span>Drop a file here to upload or click to browse</span>
  </div>
  <div class="file-drop-inner active"
       @click="openDirectoryUpload()">
    <span>Click here to upload directory</span>
  </div>
</template>

<style scoped>

.file-drop-inner {
  border: 2px dashed #ccc;
  border-radius: 10px;
  color: #ccc;
  padding: 10px 5px;
  margin: 5px;
  text-align: center;
}

.active:hover {
  color: white;
  border-color: white;
  cursor: pointer;
}

.dragging-over {
  color: white;
  border-color: white;
}

</style>