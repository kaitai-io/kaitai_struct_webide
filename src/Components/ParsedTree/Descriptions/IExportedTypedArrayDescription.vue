<script setup lang="ts">
import {IExportedValue} from "../../../entities";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();

const concatted = props.node.bytes.length > 8
    ? props.node.bytes.subarray(0, 8).join(", ") + ", ..."
    : props.node.bytes.join(", ");


</script>

<template>
  <span class="variable-name" :class="{isSelected}">{{ node.path[node.path.length - 1] }}</span>
  <span> = </span>
  <span>[</span>
  <span class="main-value" :class="{isSelected}">{{ concatted }}</span>
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

.isSelected {
  color: white;
}
</style>