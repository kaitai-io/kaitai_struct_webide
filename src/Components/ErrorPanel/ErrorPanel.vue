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

  return "Parse error" + (error.name ? ` (${error.name})` : "") + `${error.message ? ": " + error.message : ""}\nCall stack: ${error.stack}`;
};

const error = computed(() => {
  if (errorStore.error) {
    return formatErrorMessage(errorStore.error);
  }
});

</script>

<template>
  <div v-if="error" class="error-panel">{{ error }}</div>
</template>

<style scoped>
.error-panel {
  background: #222222;
  color: #dc6f6f;
  padding: 10px;
  font-size: 14px;
  font-family: "JetBrains Mono";
  white-space: pre;
  text-wrap: auto;
  overflow-y: scroll;
}
</style>