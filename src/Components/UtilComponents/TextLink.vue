<script setup lang="ts">
defineProps<{
  link: string;
  text: string;
}>();
</script>

<template>
  <a class="text-button" :href="link" target="_blank">{{ text }}</a>
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