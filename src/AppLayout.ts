import { LayoutManager, Container, Component, ClosableComponent } from "./LayoutManagerV2";

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
    static errors: ClosableComponent;
}

Layout.manager = new LayoutManager();

Layout.manager.root
    .addHorizontal(mainCols => mainCols
        .addComponent("files", { width: 200 }, c => Layout.fileTree = c)
        .addVertical(errorArea => errorArea
            .addHorizontal(middleArea => middleArea
                .addVertical(middleCol => middleCol
                    .addComponent(".ksy editor", c => Layout.ksyEditor = c)
                    .addComponent("object tree", c => Layout.objectTree = c))
                .addVertical(rightCol => rightCol
                    .addTabs(files => Layout.files = files
                        .addComponent("JS code", c => Layout.jsCode = c)
                        .addComponent("JS code (debug)", c => Layout.jsCodeDebug = c))
                    .addHorizontal(rightPanel => rightPanel
                        .addComponent("info panel", c => Layout.infoPanel = c)
                        .addComponent("converter", c => Layout.converterPanel = c))))
            .addClosableComponent(c => c.addComponent("errors", { height: 100, isClosable: true }), false, c => Layout.errors = c)));

Layout.manager.root.init();
