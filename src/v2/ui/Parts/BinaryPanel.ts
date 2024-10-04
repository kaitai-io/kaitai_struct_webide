import * as Vue from "vue";
import Component from "../../../ui/Component";
import { HexViewer, IDataProvider } from "../../../HexViewer";
import { ContextMenu } from "../Components/ContextMenu";
import { FileUtils } from "../../utils/FileUtils";
import { FsUri } from "../../FileSystem/FsUri";

@Component
export class BinaryPanel extends Vue {
    uri: string;
    hexViewer: HexViewer;

    mounted() {
        this.hexViewer = new HexViewer(<HTMLElement> this.$el.querySelector(".hexViewer"));
    }

    openContextMenu(e: any) {
        (<ContextMenu>this.$refs["ctxMenu"]).open(e, null);
    }

    setInput(dataProvider: IDataProvider, uri: string = null) {
        this.uri = uri;
        this.hexViewer.setDataProvider(dataProvider);
    }

    async downloadSelected() {
        const start = this.hexViewer.selectionStart, end = this.hexViewer.selectionEnd;
        const data = await this.hexViewer.dataProvider.get(start, end - start + 1);
        const uri = new FsUri(this.uri);
        await FileUtils.saveFile(`${uri.nameWoExtension}_0x${start.toString(16)}-0x${end.toString(16)}.${uri.extension}`, data);
    }
}