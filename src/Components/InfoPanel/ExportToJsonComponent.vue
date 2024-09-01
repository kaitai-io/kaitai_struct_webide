<script setup lang="ts">

import {exportToJson} from "../../GlobalActions/ExportToJson";
import {IAceEditorComponentOptions} from "../../v1/GoldenLayout/AceEditorComponent";

const exportToJsonThenPrintToConsole = (useHexForNumbers: boolean) => {
  exportToJson(useHexForNumbers)
      .then((json: string) => {
        console.log(json)
        const options: IAceEditorComponentOptions = {
          lang: "json",
          isReadOnly: true,
          data: json
        };
        // this.ui.layoutManager.addDynamicAceCodeEditorTab("json export", options);
      });
}
</script>

<template>
  <div id="exportToJsonDiv">
    <a @click="exportToJsonThenPrintToConsole(false)" href="#">export to JSON</a>
    (<a @click="exportToJsonThenPrintToConsole(true)" href="#">hex</a>)
    <br/>
  </div>
</template>

<style scoped>

</style>