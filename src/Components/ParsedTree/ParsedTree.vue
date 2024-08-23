<script setup lang="ts">
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {computed} from "vue";
import {ObjectType} from "../../entities";
import ParsedTreeNode from "./ParsedTreeNode.vue";

const store = useCurrentBinaryFileStore();
const parsedFile = computed(() => {
  return store.parsedFile;
});

const children = computed(() => {
  if (!parsedFile) return [];
  switch (parsedFile.value.type) {
    case ObjectType.Object: {
      return Object.values(parsedFile.value.object.fields);
    }
    case ObjectType.Array: {
      return parsedFile.value.arrayItems;
    }
    default:
      return [];
  }
});

</script>

<template>
  <div class="local" id="parsedDataTree">
    <div class="overflow-wrapper">
      <ParsedTreeNode :node="node" v-if="parsedFile" v-for="node in children" :depth="0"/>
    </div>
  </div>
</template>

<style scoped>
.local {
  color: white;
  overflow-y: scroll;
  height: 100%;
}

.overflow-wrapper {
  height: 100%;
}
</style>