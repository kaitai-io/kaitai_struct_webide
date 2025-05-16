import {DockviewApi} from "dockview-core";

export const GL_KSY_EDITOR_ID = "ksy-editor";
export const GL_PARSED_DATA_TREE_ID = "parsed-data-tree";
export const GL_HEX_VIEWER_ID = "hex-viewer";
export const GL_FILE_TREE_ID = "file-tree";
export const GL_INFO_PANEL_ID = "info-panel";
export const GL_CONVERTER_PANEL_ID = "converter-panel";
export const GL_ERRORS_TAB_ID = "errors-tab";

export const defaultLayout = (api: DockviewApi) => {

    api.addPanel({
        id: GL_FILE_TREE_ID,
        component: "FileTree",
        tabComponent: "NoCloseTab",
    });

    api.addPanel({
        id: GL_ERRORS_TAB_ID,
        component: "ErrorPanel",
        tabComponent: "ErrorTab",
        position: {referencePanel: GL_FILE_TREE_ID, direction: "below"},
    });


    api.addPanel({
        id: GL_PARSED_DATA_TREE_ID,
        component: "ParsedTree",
        tabComponent: "NoCloseTab",
        position: {referencePanel: GL_FILE_TREE_ID, direction: "right"},
    });


    api.addPanel({
        id: GL_HEX_VIEWER_ID,
        component: "HexViewer",
        tabComponent: "NoCloseTab",
        position: {referencePanel: GL_PARSED_DATA_TREE_ID, direction: "right"}
    });


    api.addPanel({
        id: GL_INFO_PANEL_ID,
        component: "InfoPanel",
        tabComponent: "NoCloseTab",
        position: {referencePanel: GL_HEX_VIEWER_ID, direction: "below"}
    });

    api.addPanel({
        id: GL_CONVERTER_PANEL_ID,
        component: "ConverterPanel",
        tabComponent: "NoCloseTab",
        position: {referencePanel: GL_INFO_PANEL_ID, direction: "right"}
    });

    api.addPanel({
        id: GL_KSY_EDITOR_ID,
        component: "KsyEditorPanel",
        tabComponent: "NoCloseTab",
        position: {referencePanel: GL_PARSED_DATA_TREE_ID, direction: "above"},
    });



    api.getPanel(GL_ERRORS_TAB_ID).api.setSize({
        height: 100
    });

    api.getPanel(GL_FILE_TREE_ID).api.setSize({
        width: 230
    });

    api.getPanel(GL_HEX_VIEWER_ID).api.setSize({
        height: 668
    });

    api.getPanel(GL_KSY_EDITOR_ID).api.setSize({
        width: 872,
        height: 482
    });


    api.getPanel(GL_CONVERTER_PANEL_ID).api.setSize({
        height: 246,
        width: 409
    });
};