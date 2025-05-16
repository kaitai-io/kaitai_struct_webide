<script setup lang="ts">
import TextButton from "../UtilComponents/TextButton.vue";

defineProps<{
  text: string;
  state: boolean
  checkedEmoji: string;
  unCheckedEmoji: string;
  toggle(newValue: boolean): void
}>();
</script>

<template>
  <div class="local">
    <TextButton :text="state ? checkedEmoji : unCheckedEmoji" :click="() => toggle(!state)"/>
    {{ text }}
  </div>
</template>

<style scoped>
.local {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>