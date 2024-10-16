<script setup lang="ts">
import {processUploadedFileList} from "../../GlobalActions/UploadFiles";
import {useFileDialog} from "@vueuse/core";
import {useTextModalInputStore} from "../Modals/TextInputModal/TextInputModalStore";
import {FILE_SYSTEM_TYPE_LOCAL} from "./FileSystems/LocalStorageFileSystem";
import {createNewKsyAction} from "../../GlobalActions/CreateNewKsyAction";

const {open, onChange} = useFileDialog();
onChange((files) => processUploadedFileList(files, "UploadModal"));

const addKsyFile = () => {
  const store = useTextModalInputStore();
  store.open({
    title: "Add new KSY",
    onAccept: (fileName) => {
      createNewKsyAction(FILE_SYSTEM_TYPE_LOCAL, fileName);
    },
  });
};


const downloadFile = () => {
  // RestoreOldFileTreeAction();
};


</script>

<template>
  <div class="footer btn-group" role="group">
    <button type="button" class="action-button" @click="addKsyFile()">
      <i class="glyphicon glyphicon-file"/>
    </button>
    <button type="button" class="action-button" @click="open()">
      <i class="glyphicon glyphicon-cloud-upload"/>
    </button>
    <button type="button" class="action-button" @click="downloadFile()">
      <i class="glyphicon glyphicon-cloud-download"/>
    </button>
  </div>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.action-button {
  font-size: 13px;
  padding: 7px 10px;
  flex-grow: 1;
  border-radius: 0;
  background-color: rgb(70, 70, 70);
  border: none;
}

.action-button:hover {
  color: white;
  background-color: rgb(30, 30, 30);
}

.action-button:disabled {
  background-color: rgb(60, 60, 60);
  color: inherit;
}

</style>