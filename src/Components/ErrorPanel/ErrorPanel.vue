<script setup lang="ts">
import "./ErrorPanelStyle.css";
import {useErrorStore} from "./Store/ErrorStore";
import {CurrentGoldenLayout} from "../GoldenLayout/GoldenLayoutUI";

const errorStore = useErrorStore();

const formatErrorMessage = (error: any) => {
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

errorStore.$onAction(async ({name, store, args}) => {
  switch (name) {
    case "setError": {
      const errMsg = formatErrorMessage(args[0]);
      CurrentGoldenLayout.handleErrorMessage(errMsg);
      break;
    }
    case "clearErrors": {
      CurrentGoldenLayout.handleErrorMessage();
      break;
    }
  }
});

</script>

<template>
</template>

<style scoped>

</style>