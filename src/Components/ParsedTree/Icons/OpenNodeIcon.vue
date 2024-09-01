<script setup lang="ts">

const props = defineProps<{
  isParentEmpty: boolean,
  isOpen: boolean,
  onClick(): void
}>();

</script>

<template>
  <div v-if="!isParentEmpty" @click="onClick" class="icon icon-width">
    <svg v-if="isOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
         stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
    </svg>
    <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
         stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
    </svg>
  </div>
</template>

<style scoped>
.icon {
  cursor: pointer;
}
.icon:hover{
  color: #57A6A1;
  transition: color 200ms;
}
.icon-width {
  width: 16px;
}
</style>