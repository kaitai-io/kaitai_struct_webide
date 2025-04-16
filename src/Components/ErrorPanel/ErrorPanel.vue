<script setup lang="ts">
import {useErrorStore} from "./Store/ErrorStore";
import {computed} from "vue";

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

  const formattedStack = error.stack.split("\n")
      .map((item: string, index: number) => index > 0 ? item.replace(/^\s*/gi, "\t") : item)
      .join("\n");
  return "Parse error" + (error.name ? ` (${error.name})` : "") + `${error.message ? ": " + error.message : ""}\n\nCall stack: ${formattedStack}`;
};

const error = computed(() => {
  if (errorStore.error) {
    return formatErrorMessage(errorStore.error);
  }
});

</script>

<template>
  <div class="error-panel">
    <div v-if="error" class="error-panel-inner">{{ error }}</div>
  </div>
</template>

<style scoped>
.error-panel {
  display: flex;
  flex-direction: row;
  background: #222222;
  color: #dc6f6f;

  font-size: 14px;
  font-family: "JetBrains Mono", monospace;
  white-space: pre;
  text-wrap: auto;
  width: 100%;
  height: 100%;
  overflow: scroll;
}

.error-panel-inner {
  padding: 10px;
  display: flex;
}
</style>