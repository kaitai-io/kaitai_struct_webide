<script setup lang="ts">
import {FileSystem} from "./FileSystemsTypes";
import {computed} from "vue";
import FileStoreTreeNode from "./FileTreeNode.vue";
import {FileSystemFileTreeMapper} from "./FileSystemVisitors/FileSystemFileTreeMapper";
import {useFileSystems} from "./Store/FileSystemsStore";

const store = useFileSystems();
const props = defineProps<{
  fileSystem: FileSystem
}>();

const childrenItems = computed(() => {
  return FileSystemFileTreeMapper.mapToFileTreeNodes(props.fileSystem, store.openPaths);
});


</script>

<template>
  <FileStoreTreeNode v-for="item in childrenItems" :item="item" :key="item.fullPath"/>
</template>

<style scoped>

</style>
