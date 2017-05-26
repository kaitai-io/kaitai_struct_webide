import * as GoldenLayout from "goldenlayout";

var layout = new GoldenLayout({ settings: { showCloseIcon: false, showPopoutIcon: false }, content: [] });
layout.registerComponent("fakeComponent", function() { });
layout.init();

class LayoutItem {
    constructor(public contentItem: GoldenLayout.ContentItem) { }

    init() { }
}

class Component extends LayoutItem {
    get component() { return <GoldenLayout.Component>this.contentItem.contentItems[0]; }
    get container() { return this.component.container; }

    init() {
        var config = this.component && this.component.config;
        if (config && (typeof config.width === "number" || typeof config.height === "number"))
            this.container.setSize(config.width, config.height);
    }
}

type ContainerType = "row" | "column" | "stack";

class Container extends LayoutItem {
    public children: LayoutItem[] = [];

    addChild<T extends LayoutItem>(creator: { new (c: GoldenLayout.ContentItem): T }, props: any, cb?: (c: T) => void) {
        this.contentItem.addChild(Object.assign({ isClosable: false, children: [] }, props));
        var newItem = new creator(this.contentItem.contentItems.last());
        newItem.init();
        this.children.push(newItem);
        cb && cb(newItem);
        return typeof (cb) === "undefined" ? newItem : this;
    }

    addContainer(type: ContainerType, cb?: (c: Container) => void) {
        return this.addChild(Container, { type: type }, cb);
    }

    addHorizontal(cb?: (c: Container) => void) { return this.addContainer("row", cb); }
    addVertical(cb?: (c: Container) => void) { return this.addContainer("column", cb); }
    addTabs(cb?: (c: Container) => void) { return this.addContainer("stack", cb); }

    remove(item: LayoutItem) {
        this.children.remove(item);
        this.contentItem.removeChild(item.contentItem);
    }

    addComponent(): Component;
    addComponent(cb: (c: Component) => void): Container;
    addComponent(title?: string): Component;
    addComponent(title?: string, cb?: (c: Component) => void): Container;
    addComponent(title?: string, props?: any): Component;
    addComponent(title?: string, props?: any, cb?: (c: Component) => void): Container;
    addComponent(): Container|Component {
        var args = Array.from(arguments);
        var title = args.filter(x => typeof x === "string")[0] || "-";
        var cb = args.filter(x => typeof x === "function")[0];
        var props = args.filter(x => typeof x === "object")[0];

        return this.addChild(Component, Object.assign({ type: "component", componentName: "fakeComponent", title: title }, props), cb);
    }

    init() {
        for (var child of this.children)
            child.init();
    }
}

class Layout {
    static root: Container;
    static errorArea: Container;
    static files: Container;

    static fileTree: Component;
    static ksy: Component;
    static objectTree: Component;
    static infoPanel: Component;
    static converterPanel: Component;
    static jsCode: Component;
    static jsCodeDebug: Component;
    static errors: Component;
}

Layout.root = new Container(layout.root)
    .addHorizontal(mainCols => mainCols
        .addComponent("files", { width: 200 }, c => Layout.fileTree = c)
        .addVertical(errorArea => Layout.errorArea = errorArea
            .addHorizontal(middleArea => middleArea
                .addVertical(middleCol => middleCol
                    .addComponent(c => Layout.ksy = c)
                    .addComponent("object tree", c => Layout.objectTree = c))
                .addVertical(rightCol => rightCol
                    .addTabs(files => Layout.files = files
                        .addComponent("JS code", c => Layout.jsCode = c)
                        .addComponent("JS code (debug)", c => Layout.jsCodeDebug = c))
                    .addHorizontal(rightPanel => rightPanel
                        .addComponent("info panel", c => Layout.infoPanel = c)
                        .addComponent("converter", c => Layout.converterPanel = c))))));

var newFile = Layout.files.addComponent("new file");
Layout.root.init();
Layout.errorArea.addComponent("errors", { height: 100 }, c => Layout.errors = c);
Layout.errorArea.remove(Layout.errors);
Layout.errorArea.addComponent("errors", { height: 100 }, c => Layout.errors = c);