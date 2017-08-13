import * as Vue from "vue";
import * as $ from "jquery";
import { Layout, LayoutHelper } from "./AppLayout";
import { ParsedTree } from "./ui/Parts/ParsedTree";
import { ConverterPanel } from "./ui/Components/ConverterPanel";
import { InfoPanel } from "./ui/Parts/InfoPanel";
import { AboutModal } from "./ui/Parts/AboutModal";
import { HexViewer } from "./HexViewer";
import { FileTree } from "./ui/Parts/FileTree";
import { ErrorWindow } from "./ui/Parts/ErrorWindow";
import { DragAndDrop } from "./ui/Components/DragAndDrop";
import { BinaryPanel } from "./ui/Parts/BinaryPanel";
import { KsyAutoCompleter } from "./KsyAutoCompleter";

export class AppView {
    layout: Layout;

    fileTree: FileTree;
    ksyEditor: AceAjax.Editor;
    templateEditor: AceAjax.Editor;
    jsCode: AceAjax.Editor;
    jsCodeDebug: AceAjax.Editor;
    binaryPanel: BinaryPanel;
    hexViewer: HexViewer;
    aboutModal: AboutModal;
    infoPanel: InfoPanel;
    converterPanel: ConverterPanel;
    parsedTree: ParsedTree;
    dragAndDrop: DragAndDrop;

    constructor() {
        this.layout = new Layout();

        this.fileTree = new FileTree();
        this.fileTree.init();
        this.fileTree.$mount(this.layout.fileTree.element);

        this.ksyEditor = LayoutHelper.setupEditor(this.layout.ksyEditor, "yaml");
        KsyAutoCompleter.setup(this.ksyEditor);

        if (this.layout.templateEditor)
            this.templateEditor = LayoutHelper.setupEditor(this.layout.templateEditor, "yaml");

        this.jsCode = LayoutHelper.setupEditor(this.layout.jsCode, "javascript");
        this.jsCodeDebug = LayoutHelper.setupEditor(this.layout.jsCodeDebug, "javascript");
        this.aboutModal = new AboutModal();

        this.binaryPanel = new BinaryPanel();
        this.binaryPanel.$mount(this.layout.inputBinary.element);
        this.hexViewer = this.binaryPanel.hexViewer;
        this.layout.inputBinary.container.on("resize", () => this.hexViewer.resize());

        this.infoPanel = new InfoPanel();
        this.infoPanel.$mount(this.layout.infoPanel.element);
        this.infoPanel.aboutModal = this.aboutModal;

        this.converterPanel = new ConverterPanel();
        this.converterPanel.$mount(this.layout.converterPanel.element);

        this.parsedTree = new ParsedTree();
        this.parsedTree.$mount(this.layout.objectTree.element);

        this.dragAndDrop = new DragAndDrop();
        this.dragAndDrop.$mount($("<div>").appendTo(document.body).get(0));
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

    showError(errorMsg: string) {
        this.layout.errors.show();

        var errorWnd = new ErrorWindow();
        errorWnd.errorMsg = errorMsg;
        errorWnd.$mount($("<div>").appendTo(this.layout.errors.component.element).get(0));
    }

    hideErrors() {
        this.layout.errors.hide();
    }

    addFileView(title: string, content: string, lang: string) {
        const component = this.layout.files.addComponent(title, { isClosable: true });
        const editor = LayoutHelper.setupEditor(component, lang);
        editor.setValue(content, -1);
        return editor;
    }
}
