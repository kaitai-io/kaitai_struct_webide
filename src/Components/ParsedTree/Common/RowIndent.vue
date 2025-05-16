<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  depth: number
}>();

const indentElementWidth = computed(() => ({
  width: `${(props.depth || 0) * 16}px`
}));


</script>

<template>
  <div class="spacer" :style="indentElementWidth"/>
</template>

<style scoped>
.spacer {
  border-right: 1px dotted white;
  display: block;
  height: 100%;
  flex-shrink: 0;
}
</style>