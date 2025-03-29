<script setup lang="ts">
import {computed} from "vue";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {ParsedTreeLeaf} from "../../DataManipulation/ExportedValueMappers/IExportedValueParsedTreeLeafMapper";
import RowIndent from "./Common/RowIndent.vue";
import OpenNodeIcon from "./Common/OpenNodeIcon.vue";
import RowMargin from "./Common/RowMargin.vue";
import {useParsedTreeStore} from "./Store/ParsedTreeStore";
import {TreeNodeSelectedAction} from "./Services/ParsedTreeActions";
import ParsingErrorIcon from "./Common/ParsingErrorIcon.vue";
import IExportedDescription from "./Descriptions/GenericIExportedValueDescription.vue";
import ParsingWarrningIcon from "./Common/ParsingWarningIcon.vue";

const store = useCurrentBinaryFileStore();

const props = defineProps<{
  node: ParsedTreeLeaf,
}>();

const isSelected = computed(() => {
  return props.node.exportedValue === store.range;
});

const type = computed(() => {
  return props.node.exportedValue.type;
});

const path = computed(() => {
  return props.node.exportedValue.path.join("/");
});

</script>

<template>
  <div class="row">
    <RowIndent :depth="node.depth"/>
    <OpenNodeIcon :isOpen="!node.isClosed" v-if="node.hasChildren" :path="path"/>

    <div @click="() => TreeNodeSelectedAction(node.exportedValue)" class="row-description" :class="{isSelected}">
      <IExportedDescription :node="node.exportedValue" :isSelected="isSelected"/>
      <RowMargin/>
      <ParsingWarrningIcon v-if="node.exportedValue.incomplete" :node="node" :isSelected="isSelected"/>
      <ParsingErrorIcon v-if="node.exportedValue.validationError || node.exportedValue.instanceError"
                        :node="node.exportedValue" :isSelected="isSelected"/>
    </div>


  </div>

</template>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  height: 16px;
  font: 12px/normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
  color: white;
}

.isSelected {
  background-color: #57A6A1 !important;
}

.row-description {
  cursor: pointer;
  padding: 0 4px;
  border-radius: 2px;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  white-space: preserve;

}

.row-description:hover {
  background-color: #344C64;
  transition: background-color 200ms;
}
</style>