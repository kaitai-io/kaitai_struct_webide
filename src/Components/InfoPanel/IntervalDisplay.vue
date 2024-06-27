<script setup lang="ts">
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {computed} from "vue";
import {SimpleRange} from "../../v1/utils/RangeHelper";

const props = defineProps<{
  intervalName: string,
  intervals: SimpleRange[]
}>();

const store = useCurrentBinaryFileStore();
const currentIndex = computed(() => {
  const start = store.selectionStart;
  const foundIndex = props.intervals.findIndex(interval => interval.start <= start && start <= interval.end);
  return foundIndex !== -1
      ? (foundIndex + 1).toString()
      : "-"
});

const next = () => {
  const foundInterval = props.intervals.find(interval => interval.start > store.selectionStart);
  const fallbackToFirstInterval = props.intervals.length > 0 && props.intervals[0]
  const nextInterval = foundInterval || fallbackToFirstInterval;

  if (!nextInterval) return;
  store.updateSelectionRange(nextInterval.start, nextInterval.end, "INFO_PANEL");
};

const prev = () => {
  const foundInterval = props.intervals.filter(interval => interval.end < store.selectionStart).pop();
  const fallbackToLastInterval = props.intervals.length > 0 && props.intervals[props.intervals.length - 1]
  const prevInterval = foundInterval || fallbackToLastInterval;

  if (!prevInterval) return;
  store.updateSelectionRange(prevInterval.start, prevInterval.end, "INFO_PANEL");
};

</script>

<template>
  <div class="local">{{ intervalName }}:
    <a href="#" class="but" @click="prev()"><<</a>
    <span> {{ currentIndex }} / {{ intervals.length }} </span>
    <a href="#" class="but" @click="next()">>></a>
  </div>
</template>

<style scoped>
.local {
  font-size: 13px;
  margin-top: 5px
}

.but {
  display: inline-block;
}
</style>