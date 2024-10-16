<script setup lang="ts">
import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();
</script>

<template>
  <div class="icon icon-width" :title="node?.validationError?.message || node?.instanceError?.message">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  </div>
</template>

<style scoped>
.icon {
  cursor: pointer;
  color: red;
}

.icon:hover {
  color: brown;
  transition: color 200ms;
}

.icon-width {
  width: 16px;
}
</style>