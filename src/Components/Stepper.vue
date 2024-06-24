<script setup lang="ts">
export class Stepper {
  curr: number = -1;
  items: any[];

  move(direction: number) {
    if (this.items.length <= 0) return;
    var idx = this.curr === -1 ? (direction < 0 ? 0 : -1) : this.curr - 1;
    idx = (this.items.length + idx + direction) % this.items.length;
    this.curr = idx + 1;
    this.$emit("changed", this.items[idx]);
  }

  prev() {
    this.move(-1);
  }

  next() {
    this.move(+1);
  }
}

</script>

<template>
<span>
        <a @click="prev" href="#">&lt;&lt;</a>
        {{ curr == -1 ? "-" : curr }} / {{ items ? items.length : "-" }}
        <a @click="next" href="#">&gt;&gt;</a>
 </span>
</template>

<style scoped>

</style>