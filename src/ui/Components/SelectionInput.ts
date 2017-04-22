///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";

@Component
export class SelectionInputPart extends Vue {
    value: string = "";
    width: number = 30;
    focused: boolean = false;

    get parent() { return <SelectionInput>this.$parent; }

    created() {
        this.$watch("value", () => this.parent.selectionInputChanged(this));
    }
}

@Component({ props: ["start", "end" ]})
export class SelectionInput extends Vue {
    start: number = -1;
    end: number = -1;
    maxLength = Infinity;
    userChange = false;
    useHexAddr = true;
    hasSelection = false;

    get startPart() { return <SelectionInputPart>this.$refs["startPart"]; }
    get endPart() { return <SelectionInputPart>this.$refs["endPart"]; }

    getTextWidth(text: string) {
        var inputSizeElement = $(this.$refs["inputSizeElement"]);
        inputSizeElement.text(text);
        var width = inputSizeElement.width();
        return width;
    }

    mounted() {
        this.$watch("start", () => this.refreshSelectionInput());
        this.$watch("end", () => this.refreshSelectionInput());
        this.resetInputWidth(this.startPart);
        this.resetInputWidth(this.endPart);
    }

    resetInputWidth(ctrl: SelectionInputPart) {
        ctrl.width = this.getTextWidth(ctrl.value);
    }

    selectionInputChanged(ctrl: SelectionInputPart) {
        this.resetInputWidth(ctrl);

        this.useHexAddr = !ctrl.value || ctrl.value.startsWith("0x");

        var start = parseInt(this.startPart.value), end = parseInt(this.endPart.value);
        if (!isNaN(start)) {
            this.userChange = true;
            this.$emit("selectionchanged", start, isNaN(end) || end < start ? start : end);
            this.userChange = false;
        }
    }

    setAddrInput(ctrl: SelectionInputPart, value: number) {
        if (value < 0) value = 0;
        if (value >= this.maxLength) value = this.maxLength - 1;
        ctrl.value = value === null ? "" : this.useHexAddr ? `0x${value.toString(16)}` : `${value}`;
        this.resetInputWidth(ctrl);
    }

    refreshSelectionInput() {
        this.hasSelection = this.start !== -1;

        if (!(this.userChange && this.startPart.focused))
            this.setAddrInput(this.startPart, this.hasSelection ? this.start : null);

        if (!(this.userChange && this.endPart.focused))
            this.setAddrInput(this.endPart, this.hasSelection && this.start !== this.end ? this.end : null);
    }

    keydown(e: any) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            var target = $(e.target);
            this.setAddrInput(<any>target, (parseInt(target.val() || this.startPart.value) || 0) +
                (e.key === "ArrowDown" ? -1 : +1));
            //this.selectionInputChanged(e);
            return false;
        }
    }
}
