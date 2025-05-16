<script setup lang="ts">

import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "../HexViewer/Store/HexViewerConfigStore";
import {computed} from "vue";
import SelectionPreview from "./SelectionPreview.vue";
import IntervalDisplay from "./IntervalDisplay.vue";
import EmojiCheckbox from "./EmojiCheckbox.vue";
import ListOptionsToggle from "./ListOptionsToggle.vue";
import {useIdeSettingsStore} from "../../Stores/IdeSettingsStore";
import {ExportedValueUtils} from "../../Utils/ExportedValueUtils";
import {useWelcomeModalStore} from "../Modals/WelcomeModal/WelcomeModalStore";
import TextButton from "../UtilComponents/TextButton.vue";
import {RestoreBackupConfigFromBackup} from "../../GlobalActions/RestoreBackupConfigFromBackup";
import {GL_INFO_PANEL_ID} from "../Dockview/DockviewerConfig";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();
const ideSettingsStore = useIdeSettingsStore();

const emptyIntervals = computed(() => {
  if (!currentBinaryFileStore.parsedFileFlatInfo) return [];
  return currentBinaryFileStore.parsedFileFlatInfo.emptyIntervals;
});

const byteArrays = computed(() => {
  if (!currentBinaryFileStore.parsedFileFlatInfo) return [];
  return currentBinaryFileStore.parsedFileFlatInfo.byteArrays;
});

const selectionPath = computed(() => {
  if (!currentBinaryFileStore.parsedFileFlatInfo) return "";
  const rangeIndex = ExportedValueUtils.findLeafIndexUsingBinarySearch(currentBinaryFileStore.selectionStart, currentBinaryFileStore.parsedFileFlatInfo.leafs);

  return rangeIndex !== -1
      ? (currentBinaryFileStore.parsedFileFlatInfo.leafs[rangeIndex].path || []).join("/")
      : "";
});
const isLocalEnv = process.env.NODE_ENV === "development";

const about = () => {
  useWelcomeModalStore().open();
};
</script>

<template>
  <div :id="GL_INFO_PANEL_ID" class="info-panel">
    <SelectionPreview/>


    <IntervalDisplay :intervals="emptyIntervals" intervalName="Unparsed parts"/>
    <IntervalDisplay :intervals="byteArrays" intervalName="Byte arrays"/>
    <div>Selected: <span id="parsedPath">{{ selectionPath }}</span></div>
    <ListOptionsToggle :on-change="hexViewerConfigStore.setColumns" :values="[0,2,4,5,8]"
                       text="Split editor each n bytes"/>
    <ListOptionsToggle :on-change="hexViewerConfigStore.setRowSize" :values="[1,10,16,20,24,32]"
                       text="Set editor row size"/>
    <EmojiCheckbox checked-emoji="🥰" un-checked-emoji="😭" :state="hexViewerConfigStore.emojiMode"
                   :toggle="hexViewerConfigStore.setEmojiMode" text="Emoji mode"/>
    <EmojiCheckbox checked-emoji="✅" un-checked-emoji="❌" :state="hexViewerConfigStore.useHexForAddresses"
                   :toggle="hexViewerConfigStore.setUseHexForAddresses" text="Use HEX for addresses"/>
    <EmojiCheckbox checked-emoji="✅" un-checked-emoji="❌" :state="ideSettingsStore.eagerMode"
                   :toggle="ideSettingsStore.setEagerMode" text="Eager parsing mode"/>
    <TextButton :click="about" text="about webide"/>
    <TextButton :click="RestoreBackupConfigFromBackup" text="Restore old config" v-if="isLocalEnv"/>
  </div>
</template>

<style scoped>
.info-panel {
  background: #222222;
  color: #eee;
  padding: 10px;
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
}
</style>