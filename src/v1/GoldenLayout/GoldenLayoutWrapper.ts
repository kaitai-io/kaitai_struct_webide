import {AceEditorComponent, IAceEditorComponentOptions} from "./AceEditorComponent";
import GoldenLayout from "golden-layout";

export class GoldenLayoutWrapper<T> {
    dynCompId = 1;

    constructor(public ui: T, public goldenLayout: GoldenLayout) {
    }

    getLayoutNodeById(id: string): GoldenLayout.ContentItem {
        return (<any>this.goldenLayout)._getAllContentItems().filter((x: any) => x.config.id === id || x.componentName === id)[0];
    }

    addPanel() {
        let componentName = `dynComp${this.dynCompId++}`;
        return {
            componentName,
            donePromise: <Promise<GoldenLayout.Container>>new Promise((resolve, reject) => {
                this.goldenLayout.registerComponent(componentName, function (container: GoldenLayout.Container, componentState: any) {
                    resolve(container);
                });
            })
        };
    }

    addComponent(name: string, generatorCallback?: (container: GoldenLayout.Container) => any) {
        var editor: any;

        var self = this;
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            //console.log("addComponent id", name, container.getElement());
            container.getElement().attr("id", name);
            if (generatorCallback) {
                container.on("resize", () => {
                    if (editor && editor.resize) editor.resize();
                });
                container.on("open", () => {
                    self.ui[name] = editor = generatorCallback(container) || container;
                });
            } else
                self.ui[name + "Cont"] = container;
        });
    }

    addExistingDiv(name: string) {
        var self = this;
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            self.ui[name + "Cont"] = container;
            self.ui[name] = $(`#${name}`).appendTo(container.getElement());
            $(() => self.ui[name].show());
        });
    }

    addAceCodeEditorTab(name: string, options: IAceEditorComponentOptions) {
        this.addComponent(name, container => {
            return AceEditorComponent(container, options);
        });
    }

    addDynamicAceCodeEditorTab(title: string, options: IAceEditorComponentOptions) {
        const componentName = `dynComp${this.dynCompId++}`;
        this.addAceCodeEditorTab(componentName, options);
        this.getLayoutNodeById("codeTab").addChild({type: "component", componentName, title});
    }
}