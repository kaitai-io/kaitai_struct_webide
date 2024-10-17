<script setup lang="ts">
defineProps<{
  text: string;
  click(): void
}>();
</script>

<template>
  <div class="text-button" @click="click">{{ text }}</div>
</template>

<style scoped>
.text-button {
  color: #57A6A1;
  text-decoration: underline;
  cursor: pointer;
}

.text-button:hover {
  color: #76dfd8;
  text-decoration: underline;
  cursor: pointer;
}
</style>