<script setup lang="ts">

import ConverterPanel from "./Components/ConverterPanel/ConverterPanel.vue";
import InfoPanel from "./Components/InfoPanel/InfoPanel.vue";
import UnsupportedBrowser from "./Components/UnsupportedBrowser.vue";
import WelcomeModal from "./Components/WelcomeModal/WelcomeModal.vue";
import NewKsyModal from "./Components/NewKsyModal.vue";
import HexViewer from "./Components/HexViewer/HexViewer.vue";
import ParsedTree from "./Components/ParsedTree/ParsedTree.vue";
import FileTree from "./Components/FileTree/FileTree.vue";
import {useAppStore} from "./Stores/AppStore";
import {loadBinaryFileAction} from "./GlobalActions/LoadBinaryFile";
import {loadKsyFileAction} from "./GlobalActions/LoadKsyFile";
import {onMounted} from "vue";
import {parseAction} from "./GlobalActions/ParseAction";
import {initKaitaiFs, KaitaiFileSystem} from "./v1/FileSystems/KaitaiFileSystem";
import {initStorageFileSystemRoot, LocalStorageFileSystem} from "./v1/FileSystems/LocalStorageFileSystem";
import {useFileSystems} from "./Components/FileTree/Store/FileSystemsStore";
import {CurrentGoldenLayout} from "./v1/GoldenLayout/GoldenLayoutUI";

const store = useAppStore();
const fileSystemsStore = useFileSystems();

store.$onAction(async ({name, store, args}) => {
  switch (name) {
    case "updateSelectedBinaryFile": {
      await loadBinaryFileAction(args[0]);
      await parseAction();
      return;
    }
    case "updateSelectedKsyFile": {
      await loadKsyFileAction(args[0]);
      await parseAction();
      return;
    }
  }
});

const initFileSystems = async () => {
  fileSystemsStore.addFileSystem(new KaitaiFileSystem());
  const oldStorageRoot = await initStorageFileSystemRoot();
  fileSystemsStore.addFileSystem(new LocalStorageFileSystem(oldStorageRoot));
};

const initFileParsing = async () => {
  await loadKsyFileAction(store.selectedKsyInfo);
  await loadBinaryFileAction(store.selectedBinaryInfo);
  await parseAction();
};


onMounted(async () => {
  CurrentGoldenLayout.init();

  await initFileSystems();
  await initFileParsing();
});

</script>

<template>
  <UnsupportedBrowser/>

  <ParsedTree/>
  <HexViewer/>
  <FileTree/>
  <InfoPanel/>
  <ConverterPanel/>

  <NewKsyModal/>
  <WelcomeModal/>
</template>

<style scoped>

</style>