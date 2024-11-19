<script setup lang="ts">
import {CurrentGoldenLayout} from "./GoldenLayoutUI";
import "./ErrorPanelStyle.css";
import {useErrorStore} from "../../Stores/ErrorStore";
import {GL_MAIN_VIEW_ID} from "./GoldenLayoutUIConfig";

const errorStore = useErrorStore();

const htmlescape = (str: string) => $("<div/>").text(str).html().replace(/\n|\\n/g, "<br>");
const formatErrorMessage = (error: any) => {
  console.log(error)
  const isCompileError = "getMessage__T" in error && error.toString().startsWith("io.kaitai.struct");
  if (isCompileError) {
    return error.getMessage__T();
  }
  const isCustomError = error.toString !== Object.prototype.toString && error.toString !== Error.prototype.toString;
  if (isCustomError) {
    return error.toString();
  }

  return "Parse error" + (error.name ? ` (${error.name})` : "") + `${error.message ? ": " + error.message : ""}\nCall stack: ${error.stack}`;
};
const createNewErrorPanel = async () => {
  const newPanel = CurrentGoldenLayout.addPanel();
  const errorComponentConfig = {
    type: "component",
    componentName: newPanel.componentName,
    title: "Errors",
    isClosable: true
  };
  CurrentGoldenLayout.getLayoutNodeById(GL_MAIN_VIEW_ID).addChild(errorComponentConfig);
  CurrentGoldenLayout.errorPanel = await newPanel.donePromise;
  CurrentGoldenLayout.errorPanel.setSize(0, 100);
  CurrentGoldenLayout.errorPanel.getElement().addClass("errorWindow");
  let x;
  CurrentGoldenLayout.errorPanel.on("resize", () => x = CurrentGoldenLayout.errorPanel.getElement().outerHeight());
  CurrentGoldenLayout.errorPanel.on("destroy", () => {
    CurrentGoldenLayout.errorPanel = null;
  });
  CurrentGoldenLayout.errorPanel.on("close", () => {
    CurrentGoldenLayout.errorPanel = null;
  });
};

errorStore.$onAction(async ({name, store, args}) => {
  switch (name) {
    case "setError": {
      if (!CurrentGoldenLayout.errorPanel) {
        await createNewErrorPanel();
      }
      const errMsg = formatErrorMessage(args[0]);
      const messageHtml = htmlescape(errMsg);
      CurrentGoldenLayout.errorPanel.getElement()
          .empty()
          .append($("<div class='error-panel'>").html(messageHtml));
      return;
    }
    case "clearErrors": {
      if (!CurrentGoldenLayout.errorPanel) return;
      try {
        CurrentGoldenLayout.errorPanel.close();
      } catch (e) {
      }
      CurrentGoldenLayout.errorPanel = null;
    }
  }
});

</script>

<template>
</template>

<style scoped>

</style>