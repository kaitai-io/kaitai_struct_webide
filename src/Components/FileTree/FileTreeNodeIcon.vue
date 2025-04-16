<script setup lang="ts">
import {TreeNodeDisplayType} from "./FileSystemVisitors/FileSystemFileTreeMapper";
import {DocumentIcon, DocumentTextIcon, FolderIcon, FolderMinusIcon, FolderPlusIcon} from "@heroicons/vue/16/solid";
import {FILE_SYSTEM_TYPE_DIST} from "./FileSystems/LocalStorageFileSystem";
import {computed} from "vue";

const props = defineProps<{
  type: TreeNodeDisplayType
  storeId: string
}>();

const dist = computed(() => {
  return props.storeId === FILE_SYSTEM_TYPE_DIST
})

</script>

<template>
  <FolderIcon class="icon" :class="{dist}" v-if="type === TreeNodeDisplayType.EMPTY_FOLDER"/>
  <FolderMinusIcon class="icon" :class="{dist}" v-else-if="type === TreeNodeDisplayType.OPEN_FOLDER"/>
  <FolderPlusIcon class="icon" :class="{dist}" v-else-if="type === TreeNodeDisplayType.CLOSED_FOLDER"/>
  <DocumentIcon class="icon" :class="{dist}" v-else-if="type === TreeNodeDisplayType.BINARY_FILE"/>
  <DocumentTextIcon class="icon" :class="{dist}" v-else-if="type === TreeNodeDisplayType.KSY_FILE"/>
</template>

<style scoped>

.icon {
  width: 16px;
  flex-shrink: 0;
  color: #577B8D;
}

.dist {
  color: #ba6532;
}
</style>