<script setup lang="ts">
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
    <a @click="toggle(!state)" href="#">
      {{ state ? checkedEmoji : unCheckedEmoji }}
    </a>
    {{ text }}
  </div>
</template>

<style scoped>
.local {
  display: block;
  font-size: 13px;
  margin-top: 5px
}
</style>