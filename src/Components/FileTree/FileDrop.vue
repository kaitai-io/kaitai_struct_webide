<script setup lang="ts">

import {ref} from "vue";
import {processUploadedFileList} from "../../GlobalActions/UploadFiles";

const draggingOver = ref(false);
const drop = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  // @ts-ignore - Property 'dataTransfer' does not exist on type 'Event'.
  const files = event.dataTransfer.files;
  draggingOver.value = false;
  processUploadedFileList(files, "Drag&Drop");
};

const dragOver = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  draggingOver.value = true;
};

const dragLeave = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  draggingOver.value = false;
};


</script>

<template>
  <div class="file-drop-inner" :class="{'dragging-over': draggingOver}" @drop="drop" @dragover="dragOver"
       @dragleave="dragLeave">
    <span>Drag &amp; drop a file here to upload</span>
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

.dragging-over {
  color: white;
  border-color: white;
}

</style>