<script setup lang="ts">
import {CreateMonacoEditorComponent,} from "../KsyEditor/CreateMonacoEditorComponent";
import {onMounted, onUnmounted, useTemplateRef} from "vue";
import {IDockviewPanelProps} from "dockview-vue";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const props = defineProps<{
  params: IDockviewPanelProps<{ content: string, language: string }>,
}>();

const editorElement = useTemplateRef("monaco");
let ksyEditor: IStandaloneCodeEditor;

onMounted(async () => {
  ksyEditor = CreateMonacoEditorComponent(editorElement.value, {
    isReadOnly: true,
    lang: props.params.params.language,
    data: props.params.params.content,
  });

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