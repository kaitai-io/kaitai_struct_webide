<script setup lang="ts">
import {GL_PARSED_DATA_TREE_ID} from "../GoldenLayout/GoldenLayoutUIConfig";
import {computed} from "vue";
import {ExportedValueMappers} from "../../DataManipulation/ExportedValueMappers";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import ParsedTreeRow from "./ParsedTreeRow.vue";
import {useParsedTreeStore} from "./Store/ParsedTreeStore";
import {useVirtualList} from "@vueuse/core";
import {handleSelectionUpdatedEvents} from "./Services/ParsedTreeActions";

const binaryStore = useCurrentBinaryFileStore();
const parsedTreeStore = useParsedTreeStore();

const parsedTreeLeafs = computed(() => {
  return ExportedValueMappers.collectParsedTreeLeafs(binaryStore.parsedFile, parsedTreeStore.openPaths);
});

const {list, containerProps, wrapperProps, scrollTo} = useVirtualList(parsedTreeLeafs, {
  itemHeight: 16,
  overscan: 1
});

binaryStore.$onAction(({name, args}) => {
  return handleSelectionUpdatedEvents(name, args, scrollTo);
});

</script>

<template>
  <div :id="GL_PARSED_DATA_TREE_ID" class="parsed-tree">
    <div v-bind="containerProps" class="backdrop">
      <div v-bind="wrapperProps" class="wrapper-inner">
        <ParsedTreeRow :node="listItem.data" v-for="listItem in list"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parsed-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.backdrop {
  flex-grow: 1;
}

.wrapper-inner {

}
</style>