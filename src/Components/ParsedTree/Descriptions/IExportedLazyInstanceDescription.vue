<script setup lang="ts">
import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();


</script>

<template>
  <span class="variable-name" :class="{isSelected}">{{ node.path[node.path.length - 1] }}</span>
  <span>[</span>
  <span class="main-value" :class="{isSelected}">UNLOADED INSTANCE</span>
  <span>]</span>
</template>

<style scoped>
.variable-name {
  color: #57A6A1;
}

.main-value {
  color: #577B8D;
  font-weight: bold;
}

.secondary-value {
  opacity: 80%;
}

.isSelected {
  color: white;
}
</style>