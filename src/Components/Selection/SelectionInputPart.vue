<script setup lang="ts">
export class SelectionInputPart {
  text = "";
  focused: boolean = false;
  inputSizeEl: JQuery;

  get parent() {
    return <SelectionInput>this.$parent;
  }

  get width() {
    return this.getTextWidth(this.text);
  }

  mounted() {
    this.inputSizeEl = $("<span>").css({display: "none"}).appendTo(this.parent.$el);
    this.$watch("text", () => this.parent.inputChanged(this));
  }

  getTextWidth(text: string) {
    return this.inputSizeEl ? this.inputSizeEl.text(text).width() : 0;
  }

  move(dir: number) {
    this.parent.move(this, dir);
  }

  get value() {
    var result = parseInt(this.text);
    return isNaN(result) ? null : result;
  }
}

</script>

<template>
  <input type="text" v-model="text"
         class="form-control" :style="{ width: width + 20 + 'px' }"
         @focus="focused=true" @blur="focused=false"
         @keydown.up.prevent="move(+1)" @keydown.down.prevent="move(-1)">
</template>

<style scoped>

</style>