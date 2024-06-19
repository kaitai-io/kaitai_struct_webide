<script setup lang="ts">

import {SelectionInputPart} from "./SelectionInputPart.vue";

export class SelectionInput {
  start: number;
  end: number;
  maxLength = Infinity;

  useHexAddr = true;
  hasSelection = false;

  get startPart() {
    return <SelectionInputPart>this.$refs["startPart"];
  }

  get endPart() {
    return <SelectionInputPart>this.$refs["endPart"];
  }

  mounted() {
    this.$watch("start", () => this.sourceChanged());
    this.$watch("end", () => this.sourceChanged());
  }

  sourceChanged() {
    this.hasSelection = this.start !== -1;
    this.setAddrInput(this.startPart, this.hasSelection ? this.start : null);
    this.setAddrInput(this.endPart, this.hasSelection && this.start !== this.end ? this.end : null);
  }

  setAddrInput(ctrl: SelectionInputPart, value: number) {
    const newValue = value < 0 ? 0 : value >= this.maxLength ? this.maxLength - 1 : value;
    ctrl.text = newValue === null ? "" : this.useHexAddr ? `0x${newValue.toString(16)}` : `${newValue}`;
  }

  move(ctrl: SelectionInputPart, dir: number) {
    this.setAddrInput(ctrl, (ctrl.value || this.startPart.value || 0) + dir);
  }

  inputChanged(ctrl: SelectionInputPart) {
    if (ctrl.value !== null)
      this.useHexAddr = ctrl.text.startsWith("0x");

    var start = this.startPart.value;
    var end = this.endPart.value;
    if (ctrl.focused)
      this.$emit("selection-changed", start !== null ? start : -1, end === null || end < start ? start : end);
  }
}

</script>

<template>
  <div class="selectionInput">
    <span>{{ hasSelection ? "selection:" : "no selection" }}</span>
    <span class="input-group">
            <selection-input-part ref="startPart" class="selStart"></selection-input-part><!--nobr-->
            <span class="input-group-addon">-</span><!--nobr-->
            <selection-input-part ref="endPart" class="selEnd"></selection-input-part>
        </span>
  </div>
</template>

<style scoped>
.selectionInput {
  font-size: 15px
}

.selectionInput .form-control {
  color: #eee;
  background-color: #464545;
  display: initial;
  width: initial;
  float: initial;
  height: 30px
}

.selectionInput .input-group {
  display: initial;
  margin-left: 6px
}

.selectionInput .input-group-addon {
  display: inline-block;
  padding: 0;
  vertical-align: top;
  height: 30px;
  line-height: 28px;
  width: initial
}

.selectionInput .form-control {
  padding: 6px 12px
}

.selectionInput .selStart {
  padding-right: 4px
}

.selectionInput .selEnd {
  padding-left: 6px
}

.selectionInput input.form-control {
  width: 30px
}
</style>