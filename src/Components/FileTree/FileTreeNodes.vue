<script setup lang="ts">
import {IFileSystem} from "../../v1/FileSystems/FileSystemsTypes";
import {computed} from "vue";
import FileStoreTreeNode from "./FileTreeNode.vue";
import {FileSystemVisitor} from "./FileSystemVisitors/FileSystemVisitor";
import {useFileSystems} from "./Store/FileSystemsStore";

const store = useFileSystems();
const props = defineProps<{
  fileSystem: IFileSystem
}>();

const childrenItems = computed(() => {
  return new FileSystemVisitor().collectVisibleFileTreeItems(props.fileSystem, store.openPaths);
});


</script>

<template>
  <FileStoreTreeNode v-for="item in childrenItems" :item="item" :key="item.fullPath"/>
</template>

<style scoped>

</style>
