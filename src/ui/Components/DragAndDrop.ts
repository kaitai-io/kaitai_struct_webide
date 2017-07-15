import * as Vue from "vue";
import * as $ from "jquery";
import Component from "../Component";
import { FileUtils } from "../../utils/FileUtils";

@Component
export class DragAndDrop extends Vue {
    visible = false;

    mounted() {
        var dragLeaveClear: number;
        var fileDropShadow = $(this.$el);
        var parent = $(this.$el.parentElement);
        console.log("dragAndDrop parent", parent);
        parent.on("dragover", event => {
            event.preventDefault();
            event.stopPropagation();

            if (dragLeaveClear) { clearTimeout(dragLeaveClear); dragLeaveClear = null; }

            fileDropShadow.show();
        });

        parent.on("dragleave", event => {
            event.preventDefault();
            event.stopPropagation();

            if (dragLeaveClear)
                clearTimeout(dragLeaveClear);

            dragLeaveClear = setTimeout(function () { fileDropShadow.hide(); }, 100);
        });

        parent.on("drop", async event => {
            event.preventDefault();
            event.stopPropagation();
            fileDropShadow.hide();

            var fileList = (<DragEvent>event.originalEvent).dataTransfer.files;
            var files = await FileUtils.processFileList(fileList);
            this.$emit("files-uploaded", files);
        });
    }
}
