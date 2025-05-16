<script setup lang="ts">
import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();


const isEnum = (node: IExportedValue) => node.enumName || node.enumStringValue;

</script>

<template>
  <span class="variable-name" :class="{isSelected}">{{ node.path[node.path.length - 1] }}</span>

  <span v-if="isEnum(node)">
    <span> = </span>
    <span class="main-value" :class="{isSelected}">{{ node.enumStringValue }}</span>
    <span class="secondary-value" :class="{isSelected}"> ({{ "0x" + node.primitiveValue.toString(16).toUpperCase() }} = {{ node.primitiveValue }})</span>
  </span>

  <span v-else-if="Number.isInteger(node.primitiveValue)">
    <span> = </span>
    <span class="main-value" :class="{isSelected}">{{ "0x" + node.primitiveValue.toString(16).toUpperCase() }}</span>
    <span class="secondary-value" :class="{isSelected}"> = {{ node.primitiveValue }}</span>
  </span>

  <span v-else>
    <span> = </span>
    <span class="main-value" :class="{isSelected}">{{ node.primitiveValue }}</span>
  </span>

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