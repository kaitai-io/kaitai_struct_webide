<script setup lang="ts">
import {TreeNodeDisplayType} from "./FileSystemVisitors/FileSystemFileTreeMapper";
import {DocumentTextIcon, DocumentIcon, FolderIcon, FolderPlusIcon, FolderMinusIcon} from "@heroicons/vue/16/solid";

const props = defineProps<{
  type: TreeNodeDisplayType
}>();

</script>

<template>
  <FolderIcon class="icon" v-if="type === TreeNodeDisplayType.EMPTY_FOLDER"/>
  <FolderMinusIcon class="icon" v-else-if="type === TreeNodeDisplayType.OPEN_FOLDER"/>
  <FolderPlusIcon class="icon" v-else-if="type === TreeNodeDisplayType.CLOSED_FOLDER"/>
  <DocumentIcon class="icon" v-else-if="type === TreeNodeDisplayType.BINARY_FILE"/>
  <DocumentTextIcon class="icon" v-else-if="type === TreeNodeDisplayType.KSY_FILE"/>
</template>

<style scoped>

.icon {
  width: 16px;
  flex-shrink: 0;
  color: #577B8D;
}
</style>