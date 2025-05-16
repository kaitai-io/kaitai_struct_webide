<script setup lang="ts">
import {IExportedValue, ObjectType} from "../../../DataManipulation/ExportedValueTypes";
import IExportedObjectDescription from "./IExportedObjectDescription.vue";
import IExportedArrayDescription from "./IExportedArrayDescription.vue";
import IExportedGenericDescription from "./IExportedUnknownDescription.vue";
import IExportedTypedArrayDescription from "./IExportedTypedArrayDescription.vue";
import IExportedPrimitiveDescription from "./IExportedPrimitiveDescription.vue";
import IExportedUnloadedInstanceDescription from "./IExportedLazyInstanceDescription.vue";

const props = defineProps<{
  node: IExportedValue,
  isSelected: boolean
}>();

</script>

<template>
  <IExportedObjectDescription v-if="node.type == ObjectType.Object" :node="node" :isSelected="isSelected"/>
  <IExportedArrayDescription v-else-if="node.type == ObjectType.Array" :node="node" :isSelected="isSelected"/>
  <IExportedTypedArrayDescription v-else-if="node.type == ObjectType.TypedArray" :node="node" :isSelected="isSelected"/>
  <IExportedPrimitiveDescription v-else-if="node.type == ObjectType.Primitive" :node="node" :isSelected="isSelected"/>
  <IExportedUnloadedInstanceDescription v-else-if="node.type == ObjectType.LazyInstance" :node="node" :isSelected="isSelected"/>
  <IExportedGenericDescription v-else :node="node" :isSelected="isSelected"/>
</template>

<style scoped>

</style>