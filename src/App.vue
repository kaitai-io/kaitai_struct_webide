<script setup lang="ts">

import ConverterPanel from "./Components/ConverterPanel/ConverterPanel.vue";
import FileTree from "./Components/FileTree/FileTree.vue";
import InfoPanel from "./Components/InfoPanel.vue";
import UnsupportedBrowser from "./Components/UnsupportedBrowser.vue";
import WelcomeModal from "./Components/WelcomeModal.vue";
import FileDrop from "./Components/FileDrop.vue";
import NewKsyModal from "./Components/NewKsyModal.vue";
import InputContextMenu from "./Components/InputContextMenu.vue";
import HexViewer from "./Components/HexViewer/HexViewer.vue";
</script>

<template>
  <UnsupportedBrowser/>
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