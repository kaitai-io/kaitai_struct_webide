///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";

@Component
export class DummyComponent extends Vue {
    value = 5;

    created() {
        setInterval(() => this.value++, 1000);
    }

    mounted() {
        document.body.appendChild(this.$el);
    }
}
