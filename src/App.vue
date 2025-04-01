<script setup lang="ts">
import {useAppStore} from "./Stores/AppStore";
import {useFileSystems} from "./Components/FileTree/Store/FileSystemsStore";
import {loadBinaryFileAction} from "./GlobalActions/LoadBinaryFile";
import {loadKsyFileAction} from "./GlobalActions/LoadKsyFile";
import {KaitaiFileSystem} from "./Components/FileTree/FileSystems/KaitaiFileSystem";
import {
  initStorageFileSystemRoot,
  LocalStorageFileSystem
} from "./Components/FileTree/FileSystems/LocalStorageFileSystem";
import {onBeforeMount} from "vue";
import WelcomeModal from "./Components/Modals/WelcomeModal/WelcomeModal.vue";
import TextInputModal from "./Components/Modals/TextInputModal/TextInputModal.vue";
import DockviewApp from "./Components/Dockview/DockviewApp.vue";


const store = useAppStore();
const fileSystemsStore = useFileSystems();

store.$onAction(async ({name, args}) => {
  switch (name) {
    case "updateSelectedBinaryFile": {
      await loadBinaryFileAction(args[0]);
      return;
    }
    case "updateSelectedKsyFile": {
      await loadKsyFileAction(args[0]);
      return;
    }
  }
});


onBeforeMount(async () => {
  fileSystemsStore.addFileSystem(new KaitaiFileSystem());
  const oldStorageRoot = await initStorageFileSystemRoot();
  fileSystemsStore.addFileSystem(new LocalStorageFileSystem(oldStorageRoot));
});


</script>

<template>
  <TextInputModal/>
  <WelcomeModal/>

  <DockviewApp/>

</template>

<style scoped>

</style>