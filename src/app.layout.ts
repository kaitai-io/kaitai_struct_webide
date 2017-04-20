import * as GoldenLayout from "goldenlayout";

import { IntervalViewer } from "./app";
import { HexViewer } from "./HexViewer";
import { ParsedTreeHandler } from "./parsedToTree";

var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [
        { type: "row", content: []
            .concat({ type: "component", componentName: "fileTreeCont", title: "files", isClosable: false, width:12 })
            .concat(
                { type: "column", id: "mainArea", isClosable: false, content: [
                    { type: "row", content: [
                        { type: "column", content: [
                            { type: "component", componentName: "ksyEditor", title: ".ksy editor", isClosable: false },
                            { type: "stack", activeItemIndex: 0, content: [
                                { type: "component", componentName: "parsedDataTree", title: "object tree", isClosable: false },
                            ]},
                        ]},
                        { type: "stack", id: "codeTab", activeItemIndex: 2, content: [
                            { type: "component", componentName: "genCodeViewer", title: "JS code", isClosable: false },
                            { type: "component", componentName: "genCodeDebugViewer", title: "JS code (debug)", isClosable: false },
                            { type: "column", isClosable: false, id: "inputBinaryTab", title: "input binary", content: [
                                { type: "component", componentName: "hexViewer", title: "hex viewer", isClosable: false },
                                { type: "row", isClosable: false, height: 35, content: [
                                    { type: "component", componentName: "infoPanel", title: "info panel", isClosable: false, width: 40 },
                                    { type: "component", componentName: "converterPanel", title: "converter", isClosable: false },
                                ]}
                            ]}
                        ]}
                    ]},
            ]
            })
        }
    ]
});

export function getLayoutNodeById(id: string) {
    return (<any>myLayout)._getAllContentItems().filter((x: any) => x.config.id === id || x.componentName === id)[0];
}

var dynCompId = 1;
export function addEditorTab(title: string, data: string, lang: string = null, parent: string = "codeTab") {
    var componentName = `dynComp${dynCompId++}`;
    addEditor(componentName, lang, true, (editor: any) => editor.setValue(data, -1));
    getLayoutNodeById(parent).addChild({ type: "component", componentName, title });
}

var ui = {
    layout: myLayout,
    ksyEditor: <AceAjax.Editor>null,
    genCodeViewer: <AceAjax.Editor>null,
    genCodeDebugViewer: <AceAjax.Editor>null,
    //parsedDataViewer: <AceAjax.Editor>null,
    parsedDataTreeCont: <GoldenLayout.Container>null,
    parsedDataTreeHandler: <ParsedTreeHandler>null,
    hexViewer: <HexViewer>null,
    errorWindow: <GoldenLayout.Container>null,
    infoPanel: <GoldenLayout.Container>null,
    fileTreeCont: <JQuery>null,
    fileTree: <JSTree>null,
    converterPanel: <JQuery>null,
    unparsedIntSel: <IntervalViewer>null,
    bytesIntSel: <IntervalViewer>null,
};

function addComponent(name: string, generatorCallback?: (container: GoldenLayout.Container) => any) {
    var editor: any;

    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
        //console.log("addComponent id", name, container.getElement());
        container.getElement().attr("id", name);
        if (generatorCallback) {
            container.on("resize", () => { if (editor && editor.resize) editor.resize(); });
            container.on("open", () => { ui[name] = editor = generatorCallback(container) || container; });
        } else
            ui[name + "Cont"] = container;
    });
}

function addExistingDiv(name: string) {
    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
        ui[name + "Cont"] = container;
        ui[name] = $(`#${name}`).appendTo(container.getElement());
        $(() => ui[name].show());
    });
}

function addEditor(name: string, lang: string, isReadOnly: boolean = false, callback: ((editor: AceAjax.Editor) => void) = null) {
    addComponent(name, container => {
        var editor = ace.edit(container.getElement().get(0));
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode(`ace/mode/${lang}`);
        if (lang === "yaml")
            editor.setOption("tabSize", 2);
        editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
        editor.setReadOnly(isReadOnly);
        if (callback)
            callback(editor);
        return editor;
    });
}

addEditor("ksyEditor", "yaml");
addEditor("genCodeViewer", "javascript", true);
addEditor("genCodeDebugViewer", "javascript", false);
//addEditor("parsedDataViewer", "javascript", true);
addComponent("hexViewer", () => new HexViewer("hexViewer"));
addComponent("errorWindow", cont => { cont.getElement().append($("<div />")); });
addComponent("parsedDataTree");
addComponent("fileTreeCont", cont => cont.getElement().append($("#fileTreeCont").children()));
addExistingDiv("infoPanel");
addExistingDiv("converterPanel");

myLayout.init();

export { ui };