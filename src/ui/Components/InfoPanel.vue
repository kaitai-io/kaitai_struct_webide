<script setup lang="ts">

const about = () => {
  (<any>$("#welcomeModal")).modal();
};
</script>

<template>
  <div id="infoPanel">
    <!--    <selection-input :start="selectionStart" :end="selectionEnd" @selectionChanged="selectionChanged"></selection-input>-->

    <div id="SelectionInput"></div>
    <div id="selectionLengthDiv">
      Selection length: <span>{{ selectionEnd - selectionStart + 1 }}</span>
    </div>
    <div id="disableLazyParsingDiv">
      <input type="checkbox" id="disableLazyParsing" v-model="disableLazyParsing"/>
      <label for="disableLazyParsing">disable lazy parsing</label>
    </div>
    <div id="unparsedDiv">
      Unparsed parts:
      <!--        <stepper :items="unparsed" @changed="selectInterval"></stepper>-->
    </div>
    <div id="bytesDiv">
      Byte arrays:
      <!--        <stepper :items="byteArrays" @changed="selectInterval"></stepper>-->
    </div>
    <div id="parsedPathDiv">Selected: <span id="parsedPath"></span></div>
    <div id="exportToJsonDiv">
      <a onclick="kaitaiIde.app.vm.exportToJson(false)" href="#">export to JSON</a> (<a
        onclick="kaitaiIde.app.vm.exportToJson(true)" href="#">hex</a>)
    </div>
    <div>
      <a id="aboutWebIde" @click="about" href="#">about webide</a>
    </div>
  </div>
</template>

<style scoped>

</style>