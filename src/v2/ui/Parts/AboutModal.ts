import * as Vue from "vue";
import Component from "../../../ui/Component";
import * as $ from "jquery";
import "bootstrap";
import { localSettings } from "../../LocalSettings";

@Component
export class AboutModal extends Vue {
    webideVersion = "?";
    webideCommitUrl = "https://github.com/kaitai-io/kaitai_struct_webide/commits";
    webideCommitId = "?";
    webideCommitDate = "?";
    compilerVersion = "?";
    compilerBuildDate = "?";

    created() {
        this.$mount(document.createElement("div"));
    }

    mounted() {
        if(localSettings.showAboutOnStart)
            this.show();
    }

    doNotShowOnStart() {
        localSettings.showAboutOnStart = false;
    }

    show() {
        $(this.$el).modal();
    }
}