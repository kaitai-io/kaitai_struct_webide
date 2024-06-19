<script setup lang="ts">

import ConverterPanel from "./ui/Components/ConverterPanel.vue";
import FileTree from "./ui/Components/FileTree.vue";
import InfoPanel from "./ui/Components/InfoPanel.vue";
import UnsupportedBrowser from "./ui/Components/UnsupportedBrowser.vue";
import WelcomeModal from "./ui/Components/WelcomeModal.vue";
import NoScript from "./ui/Components/NoScript.vue";
import FileDrop from "./ui/Components/FileDrop.vue";
import NewKsyModal from "./ui/Components/NewKsyModal.vue";
import InputContextMenu from "./ui/Components/InputContextMenu.vue";
</script>

<template>
  <NoScript/>
  <UnsupportedBrowser/>
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