<script setup lang="ts">
import TextButton from "../UtilComponents/TextButton.vue";

defineProps<{
  text: string;
  values: number[];
  onChange(newValue: number): void
}>();
</script>

<template>
  <div class="local">{{ text }}:
    <span v-for="(value) in values">
      <TextButton :text="value.toString()" :click="() => onChange(value)"/>
    </span>
  </div>
</template>

<style scoped>
.local {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>