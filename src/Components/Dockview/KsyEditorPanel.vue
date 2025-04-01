<script setup lang="ts">
import {CreateMonacoEditorComponent,} from "../KsyEditor/CreateMonacoEditorComponent";
import {onMounted, onUnmounted, useTemplateRef} from "vue";
import {IDockviewPanelProps} from "dockview-vue";
import {IDockviewPanel} from "dockview-core";
import {useAppStore} from "../../Stores/AppStore";
import {loadKsyFileAction} from "../../GlobalActions/LoadKsyFile";
import {useKsyEditorStore} from "../KsyEditor/Store/KsyEditorStore";
import {editor, KeyCode, KeyMod} from "monaco-editor";
import {DelayAction} from "../../Utils/DelayAction";
import {mainEditorOnChange} from "../KsyEditor/KsyEditorActions";
import {KaitaiCodeWorkerApi} from "../../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const props = defineProps<{
  params: IDockviewPanelProps<{ panel: IDockviewPanel }>,
}>();

const editorElement = useTemplateRef("monaco");
const store = useKsyEditorStore();
let ksyEditor: IStandaloneCodeEditor;

onMounted(async () => {
  ksyEditor = CreateMonacoEditorComponent(editorElement.value, {
    lang: "yaml"
  });
  const editDelay = new DelayAction(500);

  ksyEditor.onDidChangeModelContent((event) => {
    editDelay.do(() => mainEditorOnChange(event, ksyEditor.getValue()));
  });

  ksyEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, (args) => {
    KaitaiCodeWorkerApi.parseAction();
  });

  const appStore = useAppStore();
  await loadKsyFileAction(appStore.selectedKsyInfo);
});

store.$onAction(async ({name, store, args}) => {
  if (name !== "setValue") return;
  if (args[0] === props.params.api.id) {
    ksyEditor.setValue(args[1]);
  }
});

onUnmounted(() => {
  ksyEditor?.dispose()
});
</script>

<template>
  <div class="editor" ref="monaco"/>
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
}
</style>