<script setup lang="ts">

import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {FileActionsWrapper} from "../v1/utils/Files/FileActionsWrapper";
import {useHexViewerConfigStore} from "./HexViewer/Store/HexViewerConfigStore";
import {computed} from "vue";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();

const selectionPath = computed(() => {
  if (!currentBinaryFileStore.parsedFileFlattened) return "";
  const foundRange = currentBinaryFileStore.parsedFileFlattened
      .find(range => {
        const rangeStart =  range.start + range.ioOffset;
        const rangeEnd =  range.end + range.ioOffset + 1;
        return currentBinaryFileStore.selectionStart <= rangeStart && rangeEnd >= currentBinaryFileStore.selectionStart;
      });
  if (!foundRange) return "";

  return (foundRange.path || []).join("/");
});

const about = () => {
  (<any>$("#welcomeModal")).modal();
};
</script>

<template>
  <div id="infoPanel">
    <div>Selection: </div>
    <!--    <selection-input :start="selectionStart" :end="selectionEnd" @selectionChanged="selectionChanged"></selection-input>-->
    <div id="SelectionInput"></div>
    <div id="selectionLengthDiv">
      Selection <span>[{{
        currentBinaryFileStore.selectionEnd - currentBinaryFileStore.selectionStart + 1
      }}] {{currentBinaryFileStore.selectionStart}} - {{currentBinaryFileStore.selectionEnd}}</span>
    </div>
    <div id="disableLazyParsingDiv">
      <input type="checkbox" id="disableLazyParsing" v-model="disableLazyParsing"/>
      <label for="disableLazyParsing">disable lazy parsing</label>
    </div>
    <div id="unparsedDiv">
      Unparsed parts:
      <!--      <Stepper/>-->
      <!--        <stepper :items="unparsed" @changed="selectInterval"></stepper>-->
    </div>
    <div id="bytesDiv">
      Byte arrays:
      <!--      <Stepper/>-->
      <!--        <stepper :items="byteArrays" @changed="selectInterval"></stepper>-->
    </div>
    <div id="parsedPathDiv">Selected: <span id="parsedPath">{{ selectionPath }}</span></div>
    <div id="exportToJsonDiv">
      <a onclick="kaitaiIde.app.vm.exportToJson(false)" href="#">export to JSON</a> (<a
        onclick="kaitaiIde.app.vm.exportToJson(true)" href="#">hex</a>)
      <br/>
      <a @click="FileActionsWrapper.downloadBinFromSelection()" href="#">Download selection as BIN</a>
      <br/>
      <span>Set editor split columns each n bytes:
      <a @click="hexViewerConfigStore.setColumns(columns)" href="#" v-for="(columns, i) in [0,2,4,8]">{{ columns }}&nbsp;</a>
      <br/>
      </span>
      <span>Set editor row size:
      <a @click="hexViewerConfigStore.setRowSize(rowSize)" href="#" v-for="(rowSize) in [1, 10, 16, 20, 32]">{{
          rowSize
        }}&nbsp;</a>
      </span>
      <br/>
      <span>
        <a @click="hexViewerConfigStore.setEmojiMode(!hexViewerConfigStore.emojiMode)" href="#">
          {{ hexViewerConfigStore.emojiMode ? "🥰" : "😭" }}
        </a>
        Emoji mode
      </span>
      <br/>
      <span>
        <a @click="hexViewerConfigStore.setUseHexForAddresses(!hexViewerConfigStore.useHexForAddresses)" href="#">
          {{ hexViewerConfigStore.useHexForAddresses ? "✅" : "❎" }}
        </a>
        Use HEX for addresses
      </span>
    </div>
    <div>
      <a id="aboutWebIde" @click="about" href="#">about webide</a>
    </div>
  </div>
</template>

<style scoped>

</style>