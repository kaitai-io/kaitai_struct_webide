<script setup lang="ts">

import ConverterPanel from "./Components/ConverterPanel/ConverterPanel.vue";
import InfoPanel from "./Components/InfoPanel/InfoPanel.vue";
import UnsupportedBrowser from "./Components/UnsupportedBrowser.vue";
import WelcomeModal from "./Components/WelcomeModal/WelcomeModal.vue";
import NewKsyModal from "./Components/NewKsyModal.vue";
import InputContextMenu from "./Components/InputContextMenu.vue";
import HexViewer from "./Components/HexViewer/HexViewer.vue";
import ParsedTree from "./Components/ParsedTree/ParsedTree.vue";
import FileTree from "./Components/FileTree/FileTree.vue";
import {useAppStore} from "./Stores/AppStore";
import {loadBinaryFileAction} from "./GlobalActions/LoadBinaryFile";
import {loadKsyFileAction} from "./GlobalActions/LoadKsyFile";
import {onMounted} from "vue";
import {parseAction} from "./GlobalActions/ParseAction";
import {FILE_SYSTEM_TYPE_LOCAL, IFsItem, ITEM_MODE_DIRECTORY} from "./v1/FileSystems/FileSystemsTypes";
import {LocalForageWrapper} from "./v1/utils/LocalForageWrapper";
import {initKaitaiFs} from "./v1/FileSystems/KaitaiFileSystem";
import {OldLocalStorageFileSystem} from "./v1/FileSystems/OldLocalStorageFileSystem";
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
  fileSystemsStore.addFileSystem(initKaitaiFs());
  fileSystemsStore.addFileSystem(new OldLocalStorageFileSystem(storedItem || defaultItem));
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
  <InputContextMenu/>
  <FileTree/>
  <InfoPanel/>
  <ConverterPanel/>

  <NewKsyModal/>
  <WelcomeModal/>
</template>

<style scoped>

</style>