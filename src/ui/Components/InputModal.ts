///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";
import * as $ from "jquery";

@Component({ props: { title: {}, okText: { default: "OK" }, paramName: { } } })
export class InputModal extends Vue {
    title: string;
    value: string = "";

    get inputEl() { return (<HTMLInputElement>(this.$refs["input"])); }

    show(action: "show" | "hide" = "show") {
        if (action === "show")
            this.value = "";

        (<any>$(this.$el)).modal(action);
    }

    mounted() {
        $(this.$el).on("shown.bs.modal", () => this.inputEl.focus());
    }

    okClick() {
        this.show("hide");
        this.$emit('ok', this.value);
    }
}
