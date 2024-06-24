<script setup lang="ts">

import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {FileActionsWrapper} from "../v1/utils/Files/FileActionsWrapper";
import {useHexViewerConfigStore} from "./HexViewer/Store/HexViewerConfigStore";

const currentBinaryFileStore = useCurrentBinaryFileStore();
const hexViewerConfigStore = useHexViewerConfigStore();

const about = () => {
  (<any>$("#welcomeModal")).modal();
};
</script>

<template>
  <div id="infoPanel">
    <!--    <selection-input :start="selectionStart" :end="selectionEnd" @selectionChanged="selectionChanged"></selection-input>-->
    <div id="SelectionInput"></div>
    <div id="selectionLengthDiv">
      Selection length: <span>{{
        currentBinaryFileStore.selectionEnd - currentBinaryFileStore.selectionStart + 1
      }}</span>
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
    <div id="parsedPathDiv">Selected: <span id="parsedPath"></span></div>
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
      <a @click="hexViewerConfigStore.setRowSize(rowSize)" href="#" v-for="(rowSize) in [10, 16, 20, 32]">{{ rowSize }}&nbsp;</a>
      </span>
      <br/>
      <span>Set emoji mode:
      <a @click="hexViewerConfigStore.setEmojiMode(false)" href="#">❌</a>
      <a @click="hexViewerConfigStore.setEmojiMode(true)" href="#">🥰</a>
      </span>
      <br/>
      <span>Use decimals for addresses:
      <a @click="hexViewerConfigStore.setUseHexForAddresses(false)" href="#">❌</a>
      <a @click="hexViewerConfigStore.setUseHexForAddresses(true)" href="#">✅</a>
      </span>
    </div>
    <div>
      <a id="aboutWebIde" @click="about" href="#">about webide</a>
    </div>
  </div>
</template>

<style scoped>

</style>