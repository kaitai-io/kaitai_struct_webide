<script setup lang="ts">
import {processUploadedFileList} from "../../GlobalActions/UploadFiles";
import {useFileDialog} from "@vueuse/core";
import {useTextModalInputStore} from "../Modals/TextInputModal/TextInputModalStore";
import {FILE_SYSTEM_TYPE_LOCAL} from "./FileSystems/LocalStorageFileSystem";
import {createNewKsyAction} from "../../GlobalActions/CreateNewKsyAction";
import { DocumentIcon, CloudArrowDownIcon, CloudArrowUpIcon } from '@heroicons/vue/16/solid'

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
    <button class="action-button" @click="addKsyFile()">
      <DocumentIcon class="icon"/>
    </button>
    <button class="action-button" @click="open()">
      <CloudArrowUpIcon class="icon"/>
    </button>
    <button class="action-button" @click="downloadFile()">
      <CloudArrowDownIcon class="icon"/>
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
  font-size: 12px;
  flex-grow: 1;
  color: #cccccc;
  background-color: rgb(70, 70, 70);
  border:none;
  padding: 5px;
}

.icon {
  width: 20px;
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