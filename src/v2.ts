import * as GoldenLayout from "goldenlayout";

var layout = new GoldenLayout({ settings: { showCloseIcon: false, showPopoutIcon: false }, content: [] });
layout.registerComponent("fakeComponent", function() { });
layout.init();

class LayoutItem {
    constructor(public parent: Container, public contentItem: GoldenLayout.ContentItem) { }

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

class ClosableComponent {
    lastHeight: number;
    lastWidth: number;
    component: Component = null;

    get visible() { return this.component !== null; }
    set visible(show: boolean) {
        if (show === this.visible) return;

        if (show)
            this.show();
        else
            this.hide();
    }

    constructor(public parent: Container, public generator: (c: Container) => Component) {
        this.show();
    }

    show() {
        this.component = this.generator(this.parent);
        if (this.lastHeight || this.lastWidth)
            this.component.container.setSize(this.lastWidth, this.lastHeight);

        this.component.container.on("resize", () => {
            var element = <JQuery><any>this.component.contentItem.element;
            this.lastHeight = element.outerHeight();
            this.lastWidth = element.outerWidth();
        });

        for (var event of ["destroy", "close"])
            this.component.container.on(event, () => {
                this.component = null;
                console.log('set');
            });
    }

    hide() {
        this.component.component.remove();
    }
}

type ContainerType = "row" | "column" | "stack";

class Container extends LayoutItem {
    public children: LayoutItem[] = [];

    addChild<T extends LayoutItem>(creator: { new (parent: Container, c: GoldenLayout.ContentItem): T }, props: any, cb?: (c: T) => void) {
        this.contentItem.addChild(Object.assign({ isClosable: false, children: [] }, props));
        var newItem = new creator(this, this.contentItem.contentItems.last());
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

    addClosableComponent(generator: (c: Container) => Component, cb: (c: ClosableComponent) => void): Container {
        cb(new ClosableComponent(this, generator));
        return this;
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
    static errors: ClosableComponent;
}

Layout.root = new Container(null, layout.root)
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
                        .addComponent("converter", c => Layout.converterPanel = c))))
            .addClosableComponent(c => c.addComponent("errors", { height: 100, isClosable: true }), c => Layout.errors = c)));

var newFile = Layout.files.addComponent("new file", { isClosable: true });
Layout.root.init();
window["layout"] = Layout;
