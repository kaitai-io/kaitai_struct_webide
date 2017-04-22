///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";

@Component({ props: ["items"] })
export class Stepper extends Vue {
    curr: number = -1;
    items: any[];

    move(direction: number) {
        if (this.items.length <= 0) return;
        var idx = this.curr === -1 ? (direction < 0 ? 0 : -1) : this.curr - 1;
        idx = (this.items.length + idx + direction) % this.items.length;
        this.curr = idx + 1;
        this.$emit("changed", this.items[idx]);
    }

    prev() { this.move(-1); }
    next() { this.move(+1); }
}
