<script setup lang="ts">
defineProps<{
  text: string;
  values: number[];
  onChange(newValue: number): void
}>();
</script>

<template>
  <div class="local">{{ text }}:
    <span v-for="(value) in values">
        <a @click="onChange(value)" href="#">
      {{ value }}
    </a>
    &nbsp;
    </span>
  </div>
</template>

<style scoped>
.local {
  display: block;
  font-size: 13px;
  margin-top: 5px
}
</style>