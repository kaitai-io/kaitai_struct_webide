import * as Vue from "vue";
import { Layout, LayoutHelper } from "./AppLayout";
import { ParsedTree } from "./ui/Parts/ParsedTree";
import { ConverterPanel } from "./ui/Components/ConverterPanel";
import { InfoPanel } from "./ui/Parts/InfoPanel";
import { AboutModal } from "./ui/Parts/AboutModal";
import { HexViewer } from "./HexViewer";
import { FileTree } from "./ui/Parts/FileTree";

export class AppView {
    layout: Layout;

    fileTree: FileTree;
    ksyEditor: AceAjax.Editor;
    jsCode: AceAjax.Editor;
    jsCodeDebug: AceAjax.Editor;
    hexViewer: HexViewer;
    aboutModal: AboutModal;
    infoPanel: InfoPanel;
    converterPanel: ConverterPanel;
    parsedTree: ParsedTree;

    constructor() {
        this.layout = new Layout();

        this.fileTree = new FileTree();
        this.fileTree.init();
        this.fileTree.$mount(this.layout.fileTree.element);

        this.ksyEditor = LayoutHelper.setupEditor(this.layout.ksyEditor, "yaml");
        this.jsCode = LayoutHelper.setupEditor(this.layout.jsCode, "javascript");
        this.jsCodeDebug = LayoutHelper.setupEditor(this.layout.jsCodeDebug, "javascript");
        this.aboutModal = new AboutModal();

        this.hexViewer = new HexViewer(this.layout.inputBinary.element);
        this.layout.inputBinary.container.on("resize", () => this.hexViewer.resize());

        this.infoPanel = new InfoPanel();
        this.infoPanel.$mount(this.layout.infoPanel.element);
        this.infoPanel.aboutModal = this.aboutModal;
        
        this.converterPanel = new ConverterPanel();
        this.converterPanel.$mount(this.layout.converterPanel.element);

        this.parsedTree = new ParsedTree();
        this.parsedTree.$mount(this.layout.objectTree.element);
    }

    nextTick(action: () => void) {
        return new Promise<void>((resolve, reject) => {
            Vue.nextTick(() => {
                try {
                    action();
                    resolve();
                } catch(e) {
                    reject(e);
                }
            });
        });
    }
}
