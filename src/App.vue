<script setup lang="ts">
import {useAppStore} from "./Stores/AppStore";
import {loadBinaryFileAction} from "./GlobalActions/LoadBinaryFile";
import {loadKsyFileAction} from "./GlobalActions/LoadKsyFile";
import WelcomeModal from "./Components/Modals/WelcomeModal/WelcomeModal.vue";
import TextInputModal from "./Components/Modals/TextInputModal/TextInputModal.vue";
import DockviewApp from "./Components/Dockview/DockviewApp.vue";
import InitializeIDE from "./Components/InitializeIDE/InitializeIDE.vue";
import {useInitializeIDEStore} from "./Components/InitializeIDE/Store/InitializeIDEStore";
import UnsupportedBrowser from "./Components/UnsupportedBrowser.vue";


const store = useAppStore();
const initializedStore = useInitializeIDEStore();

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

</script>

<template>
  <UnsupportedBrowser/>
  <InitializeIDE v-if="!initializedStore.isInitialized"/>
  <slot v-if="initializedStore.isInitialized">
    <TextInputModal/>
    <WelcomeModal/>
    <DockviewApp/>
  </slot>

</template>

<style scoped>

</style>