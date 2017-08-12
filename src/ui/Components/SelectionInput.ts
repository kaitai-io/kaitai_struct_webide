///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import * as $ from "jquery";
import Component from "../Component";

@Component
export class SelectionInputPart extends Vue {
    text = "";
    focused: boolean = false;
    inputSizeEl: JQuery;

    get parent() { return <SelectionInput>this.$parent; }
    get width() { return this.getTextWidth(this.text); }

    mounted() {
        this.inputSizeEl = $("<span>").css({ display: "none" }).appendTo(this.parent.$el);
        this.$watch("text", () => this.parent.inputChanged(this));
    }

    getTextWidth(text: string) {
        return this.inputSizeEl ? this.inputSizeEl.text(text).width() : 0;
    }

    move(dir: number) { this.parent.move(this, dir); }

    get value() {
        var result = parseInt(this.text);
        return isNaN(result) ? null : result;
    }
}

@Component({ props: ["start", "end" ]})
export class SelectionInput extends Vue {
    start: number;
    end: number;
    maxLength = Infinity;

    useHexAddr = true;
    hasSelection = false;

    get startPart() { return <SelectionInputPart>this.$refs["startPart"]; }
    get endPart() { return <SelectionInputPart>this.$refs["endPart"]; }

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
