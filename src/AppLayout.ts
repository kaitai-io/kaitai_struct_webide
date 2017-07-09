import { LayoutManager, Container, Component, ClosableComponent } from "./LayoutManagerV2";
import * as ace from "ace/ace";

export class Layout {
    static manager: LayoutManager;

    static files: Container;

    static fileTree: Component;
    static ksyEditor: Component;
    static objectTree: Component;
    static infoPanel: Component;
    static converterPanel: Component;
    static jsCode: Component;
    static jsCodeDebug: Component;
    static inputBinary: Component;
    static errors: ClosableComponent;
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

Layout.manager = new LayoutManager();

Layout.manager.root
    .addHorizontal(mainCols => mainCols
        .addComponent("files", { width: 200 }, c => Layout.fileTree = c)
        .addVertical(errorArea => errorArea
            .addHorizontal(middleArea => middleArea
                .addVertical(middleCol => middleCol
                    .addComponent(".ksy editor", c => Layout.ksyEditor = c)
                    .addComponent("object tree", c => Layout.objectTree = c)
                )
                .addVertical(rightCol => rightCol.setConfig({ width: 48 })
                    .addTabs(files => Layout.files = files
                        .addComponent("JS code", c => Layout.jsCode = c)
                        .addComponent("JS code (debug)", c => Layout.jsCodeDebug = c)
                        .addComponent("input binary", c => Layout.inputBinary = c)
                    )
                    .addHorizontal(rightPanel => rightPanel.setConfig({ height: 25 })
                        .addComponent("info panel", { width: 220 }, c => Layout.infoPanel = c)
                        .addComponent("converter", c => Layout.converterPanel = c)
                    )
                )
            )
            .addClosableComponent(c => c.addComponent("errors", { height: 100, isClosable: true }), false, c => Layout.errors = c)
        )
    );

Layout.manager.root.init();
