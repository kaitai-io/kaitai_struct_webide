<script setup lang="ts">
import {IExportedValue} from "../../../entities";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();

</script>

<template>
  <span>{{ node.path[node.path.length - 1] }}</span>
  <span> [</span>
  <span class="variable-name" :class="{isSelected}">Object</span>
  <span>]</span>
</template>

<style scoped>
.variable-name {
  color: #577B8D;
}

.isSelected {
  color: white;
}
</style>