<script setup lang="ts">
import {computed} from "vue";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {prepareEmptyModel, prepareModelData} from "./ConverterPanelModelFactory";
import {GL_CONVERTER_PANEL_ID} from "../Dockview/DockviewerConfig";

const MAX_SELECTION_LENGTH_FOR_CONVERTER = 64;

const model = computed(() => {
  const store = useCurrentBinaryFileStore();

  const content = store.fileContent;
  const offset = store.selectionStart;
  const remainingFileContentLengthFromOffset = store.fileContent.byteLength - offset;
  const length = Math.min(remainingFileContentLengthFromOffset, MAX_SELECTION_LENGTH_FOR_CONVERTER);
  if (offset === -1 || remainingFileContentLengthFromOffset < 0) return prepareEmptyModel();

  const data = new Uint8Array(content, offset, length).slice(0);
  return prepareModelData(data);
});

</script>

<template>
  <div :id="GL_CONVERTER_PANEL_ID" class="converterPanel">
    <table>
      <thead>
      <tr class="tableRow">
        <th class="header">Type</th>
        <th class="header">Value(unsigned)</th>
        <th class="header">Value(signed)</th>
      </tr>
      </thead>

      <tr class="tableRow" v-for="simpleType in model.simpleTypes">
        <td class="typeCol">{{simpleType.label}}</td>
        <td class="typeValue">{{ simpleType.unsignedValue }}</td>
        <td class="typeValue">{{ simpleType.signedValue }}</td>
      </tr>

      <tr class="tableRow" v-for="complexType in model.complexTypes">
        <td class="typeCol">{{complexType.label}}</td>
        <td class="typeValue" colspan="2">{{ complexType.value }}</td>
      </tr>

      <tr class="tableRow"  v-for="str in model.strings">
        <td class="typeCol">{{str.label}}</td>
        <td class="typeValue" colspan="2">
          <div class="str">{{str.value}}</div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.converterPanel {
  color: #eee;
  overflow-y: auto;
  height: 100%;
  font-family: "JetBrains Mono";
  font-size: 12px;
  padding: 10px;
}

.tableRow {
  height: 10px;
  line-height: 10px;
}

.header {
  text-align: left;
  font-weight: bold;
}

.typeValue {
  min-width: 155px;
  font-weight: lighter;
}

.typeCol {
  min-width: 60px;
  font-weight: lighter;
}

.str {
  display: block;
  overflow: hidden;
  font-weight: normal;
}
</style>