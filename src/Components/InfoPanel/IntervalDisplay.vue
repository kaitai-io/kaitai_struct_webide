<script setup lang="ts">
import {UpdateSelectionEvent, useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {computed} from "vue";
import {RangeHelper, SimpleRange} from "../../Utils/RangeHelper";
import TextButton from "../UtilComponents/TextButton.vue";

const props = defineProps<{
  intervalName: string,
  intervals: SimpleRange[]
}>();

const store = useCurrentBinaryFileStore();
const currentlySelectedIntervalIndex = computed(() => {
  const start = store.selectionStart;
  const foundIndex = props.intervals.findIndex(interval => RangeHelper.containsPoint(interval, start));
  return foundIndex !== -1
      ? (foundIndex + 1).toString()
      : "-"
});

const next = () => {
  const foundInterval = props.intervals.find(interval => interval.start > store.selectionStart);
  const fallbackToFirstInterval = props.intervals.length > 0 && props.intervals[0]
  const nextInterval = foundInterval || fallbackToFirstInterval;

  if (!nextInterval) return;
  const event: UpdateSelectionEvent = {
    startNew: nextInterval.start,
    endNew: nextInterval.end,
    source: "INFO_PANEL"
  }
  store.updateSelectionEvent(event);
};

const prev = () => {
  const foundInterval = props.intervals.filter(interval => interval.end < store.selectionStart).pop();
  const fallbackToLastInterval = props.intervals.length > 0 && props.intervals[props.intervals.length - 1]
  const prevInterval = foundInterval || fallbackToLastInterval;

  if (!prevInterval) return;
  const event: UpdateSelectionEvent = {
    startNew: prevInterval.start,
    endNew: prevInterval.end,
    source: "INFO_PANEL"
  }
  store.updateSelectionEvent(event);
};

</script>

<template>
  <div class="local">{{ intervalName }}:
    <TextButton text="<<" :click="prev"/>
    <span> {{ currentlySelectedIntervalIndex }} / {{ intervals.length }} </span>
    <TextButton text=">>" :click="next"/>
  </div>
</template>

<style scoped>
.local {
  display: flex;
  flex-direction: row;
}
</style>