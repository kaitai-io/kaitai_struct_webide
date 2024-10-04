import { LayoutManager, Container, Component, ClosableComponent } from "./LayoutManagerV2";
import * as ace from "ace/ace";

export class Layout {
    manager: LayoutManager;

    files: Container;
    fileTree: Component;
    ksyEditor: Component;
    templateEditor: Component;
    objectTree: Component;
    infoPanel: Component;
    converterPanel: Component;
    jsCode: Component;
    jsCodeDebug: Component;
    inputBinary: Component;
    errors: ClosableComponent;

    constructor(enableTemplateEditor = false) {
        this.manager = new LayoutManager();

        this.manager.root
            .addHorizontal(mainCols => mainCols
                .addComponent("files", { width: 200 }, c => this.fileTree = c)
                .addVertical(errorArea => errorArea
                    .addHorizontal(middleArea => middleArea
                        .addVertical(middleCol => middleCol
                            .addTabs(ksyTab => {
                                if (enableTemplateEditor)
                                    ksyTab = ksyTab.addComponent("template editor", c => this.templateEditor = c);
                                return ksyTab.addComponent(".ksy editor", c => this.ksyEditor = c);
                            })
                            .addComponent("object tree", c => this.objectTree = c)
                        )
                        .addVertical(rightCol => rightCol.setConfig({ width: 48 })
                            .addTabs(files => this.files = files
                                .addComponent("JS code", c => this.jsCode = c)
                                .addComponent("JS code (debug)", c => this.jsCodeDebug = c)
                                .addComponent("input binary", c => this.inputBinary = c)
                            )
                            .addHorizontal(rightPanel => rightPanel.setConfig({ height: 25 })
                                .addComponent("info panel", { width: 220 }, c => this.infoPanel = c)
                                .addComponent("converter", c => this.converterPanel = c)
                            )
                        )
                    )
                    .addClosableComponent(c => c.addComponent("errors", { height: 100, isClosable: true }), false, c => this.errors = c)
                )
            );

        this.manager.root.init();
    }
}

export class LayoutHelper {
    static setupEditor(parent: Component, lang: string) {
        var editor = ace.edit(parent.element);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode(`ace/mode/${lang}`);
        if (lang === "yaml")
            editor.setOption("tabSize", 2);
        editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
        parent.container.on("resize", () => editor.resize());
        return editor;
    }
}
