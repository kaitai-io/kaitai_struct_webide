<script setup lang="ts">

import {DockviewReadyEvent, DockviewVue, themeVisualStudio} from "dockview-vue";
import {AddTabEvent, useDockviewStore} from "./Store/DockviewStore";
import {DockviewApi} from "dockview-core";
import {defaultLayout, GL_HEX_VIEWER_ID} from "./DockviewerConfig";

const dockviewStore = useDockviewStore();
let id = 0;
let api: DockviewApi = undefined;

const onReady = (event: DockviewReadyEvent) => {
  defaultLayout(event.api);
  api = event.api;
};

dockviewStore.$onAction(({name, args}) => {
  if (name !== "addTab") return;
  const event = args[0] as AddTabEvent;

  api.addPanel({
    id: `dyn-${id++}`,
    component: "DynamicCodePanel",
    title: event.title,
    position: {referencePanel: GL_HEX_VIEWER_ID, direction: "within"},
    params: {
      content: event.content,
      language: event.language
    }
  });
});

</script>

<template>
  <DockviewVue
      style="width:100%;height:100%"
      :theme="themeVisualStudio"
      @ready="onReady"
  >
  </DockviewVue>
</template>

<style scoped>

</style>