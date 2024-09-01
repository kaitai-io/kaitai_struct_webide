<script setup lang="ts">

import ConverterPanel from "./Components/ConverterPanel/ConverterPanel.vue";
import InfoPanel from "./Components/InfoPanel/InfoPanel.vue";
import UnsupportedBrowser from "./Components/UnsupportedBrowser.vue";
import WelcomeModal from "./Components/WelcomeModal/WelcomeModal.vue";
import FileDrop from "./Components/FileDrop.vue";
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

const store = useAppStore();
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

onMounted(async () => {
  await loadKsyFileAction(store.selectedKsyInfo);
  await loadBinaryFileAction(store.selectedBinaryInfo);
  await parseAction();
});
</script>

<template>
  <UnsupportedBrowser/>
  <ParsedTree/>
  <HexViewer/>
  <FileDrop/>
  <NewKsyModal/>
  <InputContextMenu/>
  <FileTree/>
  <InfoPanel/>
  <ConverterPanel/>
  <WelcomeModal/>
</template>

<style scoped>

</style>