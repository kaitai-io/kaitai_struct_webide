<script setup lang="ts">
import {IExportedValue} from "../../../entities";

const props = defineProps<{
  node: IExportedValue
  isSelected: boolean
}>();

</script>

<template>
  <div>
    <span class="variable-name" :class="{isSelected}">{{ node.path[node.path.length - 1] }}</span>
    <span>[</span>
    <span class="main-value" :class="{isSelected}">UNKNOWN TYPE</span>
    <span>]</span>
  </div>
</template>

<style scoped>
.variable-name {
  color: #57A6A1;
}

.main-value {
  color: #577B8D;
  font-weight: bold;
}

.isSelected {
  color: white;
}

</style>