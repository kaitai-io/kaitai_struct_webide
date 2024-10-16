<script setup lang="ts">
import {computed, ref} from "vue";
import {IExportedValue, ObjectType} from "../../DataManipulation/ExportedValueTypes";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import OpenNodeIcon from "./Icons/OpenNodeIcon.vue";
import IExportedDescription from "./Descriptions/GenericIExportedValueDescription.vue";
import ParsingErrorIcon from "./Icons/ParsingErrorIcon.vue";
import ParsingWarrningIcon from "./Icons/ParsingWarrningIcon.vue";
import {TreeNodeSelectedAction} from "./Services/ParsedTreeActions";

const store = useCurrentBinaryFileStore();

const props = defineProps<{
  depth: number,
  node: IExportedValue
}>();

const children = computed(() => {
  switch (props.node.type) {
    case ObjectType.Object: {
      return Object.values(props.node.object.fields);
    }
    case ObjectType.Array: {
      return props.node.arrayItems;
    }
    default:
      return [];
  }
});

const styleObject = computed(() => ({
  marginLeft: `${(props.depth || 0) * 16}px`
}));

const isSelected = computed(() => {
  return props.node === store.range;
});

const isOpen = ref(false);

</script>

<template>
  <div class="row" :style="styleObject">
    <OpenNodeIcon :isOpen="isOpen" :isParentEmpty="children.length == 0" :onClick="() => isOpen = !isOpen"/>

    <div @click="() => TreeNodeSelectedAction(node)" class="row-description" :class="{isSelected}">
      <IExportedDescription :node="node" :isSelected="isSelected"/>
    </div>

    <ParsingWarrningIcon v-if="node.incomplete" :node="node" :isSelected="isSelected"/>
    <ParsingErrorIcon v-if="node.validationError || node.instanceError" :node="node" :isSelected="isSelected"/>
  </div>

  <ParsedTreeNode :node="childNode" :depth="depth + 1" v-for="childNode in children" v-if="isOpen"
                  :key="childNode.path.join('/')"/>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  height: 16px;
  border-left: 1px dotted white;
  font: 12px/normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
}

.isSelected {
  background-color: #57A6A1 !important;
}

.row-description {
  cursor: pointer;
  padding: 0 4px;
  border-radius: 2px;
}

.row-description:hover {
  background-color: #344C64;
  transition: background-color 200ms;
}


</style>