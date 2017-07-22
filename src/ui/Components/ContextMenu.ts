///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";
import UIHelper from "../UIHelper";

@Component
export class ContextMenu extends Vue {
    visible = false;
    item: any = null;
    top = "0";
    left = "0";

    open(event: MouseEvent, model: any) {
        this.item = model;
        const parentRect = this.$el.parentElement.getBoundingClientRect();
        this.top = (event.pageY - parentRect.top) + "px";
        this.left = (event.pageX - parentRect.left) + "px";
        this.visible = true;
        window.addEventListener("click", this.clickHandler, true);
        window.addEventListener("keyup", this.escapeHandler, true);
    }

    escapeHandler(e: KeyboardEvent) {
        if (e.keyCode === 27)
            this.hide();
    }

    clickHandler(e: MouseEvent) {
        if (!this.$el.contains(<Node>e.target))
            this.hide();
    }

    hide() {
        window.removeEventListener("click", this.clickHandler, true);
        window.removeEventListener("keyup", this.escapeHandler, true);
        this.visible = false;
    }
}

@Component({ props: { "icon": {}, "enabled": { default: true } } })
export class MenuItem extends Vue {
    enabled: boolean;

    get ctxMenu() { return UIHelper.findParent(this, ContextMenu); }

    public click(event: MouseEvent) {
        if (!this.enabled || !("click" in this["_events"])) return;

        this.ctxMenu.visible = false;
        this.$emit("click");
        event.preventDefault();
    }
}
