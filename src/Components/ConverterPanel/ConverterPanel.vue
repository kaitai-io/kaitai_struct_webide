<script setup lang="ts">
import {computed} from "vue";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {prepareEmptyModel, prepareModelData} from "./ConverterPanelModelFactory";

const MAX_SELECTION_LENGTH_FOR_CONVERTER = 64

const model = computed(() => {
  const store = useCurrentBinaryFileStore();

  const content = store.fileContent;
  const offset = store.selectionStart;
  const remainingFileContentLengthFromOffset = store.fileContent.byteLength - offset
  const length = Math.min(remainingFileContentLengthFromOffset, MAX_SELECTION_LENGTH_FOR_CONVERTER);
  if (offset === -1 || remainingFileContentLengthFromOffset < 0) return prepareEmptyModel();

  const data = new Uint8Array(content, offset, length).slice(0);
  return prepareModelData(data);
});

</script>

<template>
  <div id="converter-panel" class="converterPanel">
    <table>
      <thead>
      <tr>
        <th class="typeCol">Type</th>
        <th class="typeValue">Value (unsigned)</th>
        <th>(signed)</th>
      </tr>
      </thead>
      <tr>
        <td>i8</td>
        <td>{{ model.u8 }}</td>
        <td>{{ model.s8 }}</td>
      </tr>
      <tr>
        <td>i16le</td>
        <td>{{ model.u16le }}</td>
        <td>{{ model.s16le }}</td>
      </tr>
      <tr>
        <td>i32le</td>
        <td>{{ model.u32le }}</td>
        <td>{{ model.s32le }}</td>
      </tr>
      <tr>
        <td>i64le</td>
        <td>{{ model.u64le }}</td>
        <td>{{ model.s64le }}</td>
      </tr>
      <tr>
        <td>i16be</td>
        <td>{{ model.u16be }}</td>
        <td>{{ model.s16be }}</td>
      </tr>
      <tr>
        <td>i32be</td>
        <td>{{ model.u32be }}</td>
        <td>{{ model.s32be }}</td>
      </tr>
      <tr>
        <td>i64be</td>
        <td>{{ model.u64be }}</td>
        <td>{{ model.s64be }}</td>
      </tr>
      <tr>
        <td>float</td>
        <td colspan="2">{{ model.float }}</td>
      </tr>
      <tr>
        <td>double</td>
        <td colspan="2">{{ model.double }}</td>
      </tr>
      <tr>
        <td>unixts</td>
        <td colspan="2">{{ model.unixts }}</td>
      </tr>
      <tr>
        <td>ascii</td>
        <td colspan="2">
          <div class="str">{{ model.ascii }}</div>
        </td>
      </tr>
      <tr>
        <td>utf8</td>
        <td colspan="2">
          <div class="str">{{ model.utf8 }}</div>
        </td>
      </tr>
      <tr>
        <td>utf16le</td>
        <td colspan="2">
          <div class="str">{{ model.utf16le }}</div>
        </td>
      </tr>
      <tr>
        <td>utf16be</td>
        <td colspan="2">
          <div class="str">{{ model.utf16be }}</div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.converterPanel {
  color: #eee;
  overflow-y: auto;
  height: 100%
}

.converterPanel table {
  margin: 10px;
  font: 12px/normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
}

.converterPanel table th {
  padding-bottom: 3px
}

.converterPanel .typeCol {
  min-width: 54px
}

.converterPanel .typeValue {
  min-width: 155px
}

.converterPanel .str {
  overflow: hidden;
  line-height: 16px;
  height: 16px;
  display: block
}
</style>