<script setup lang="ts">

import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {FileActionsWrapper} from "../../v1/utils/Files/FileActionsWrapper";
import {useHexViewerConfigStore} from "../HexViewer/Store/HexViewerConfigStore";
import {computed} from "vue";
import SelectionPreview from "./SelectionPreview.vue";
import IntervalDisplay from "./IntervalDisplay.vue";
import EmojiCheckbox from "./EmojiCheckbox.vue";
import ListOptionsToggle from "./ListOptionsToggle.vue";
import ExportToJsonComponent from "./ExportToJsonComponent.vue";
import {useIdeSettingsStore} from "../../Stores/IdeSettingsStore";
import {RangeHelper} from "../../v1/utils/RangeHelper";

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

  const foundRange = currentBinaryFileStore.parsedFileFlatInfo.leafs
      .find(leaf => RangeHelper.exportedContainsPoint(leaf, currentBinaryFileStore.selectionStart));

  return foundRange
      ? (foundRange.path || []).join("/")
      : "";
});

const about = () => {
  (<any>$("#welcomeModal")).modal();
};
</script>

<template>
  <div id="infoPanel">
    <SelectionPreview/>


    <IntervalDisplay :intervals="emptyIntervals" intervalName="Unparsed parts"/>
    <IntervalDisplay :intervals="byteArrays" intervalName="Byte arrays"/>
    <div id="parsedPathDiv">Selected: <span id="parsedPath">{{ selectionPath }}</span></div>
    <ExportToJsonComponent/>
    <a @click="FileActionsWrapper.downloadBinFromSelection()" href="#">Download selection as BIN</a>
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
    <div>
      <a id="aboutWebIde" @click="about" href="#">about webide</a>
    </div>
  </div>
</template>

<style scoped>

</style>