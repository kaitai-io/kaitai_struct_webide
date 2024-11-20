import GoldenLayout from "golden-layout";

export const GL_KSY_EDITOR_ID = "ksy-editor";
export const GL_GEN_CODE_VIEWER_ID = "gen-code-viewer";
export const GL_GEN_CODE_VIEWER_DEBUG_ID = "gen-code-viewer-debug";
export const GL_MAIN_VIEW_ID = "main-view";
export const GL_CODE_STACK_ID = "code-tab";
export const GL_BINARY_FILE_TAB_ID = "input-binary-tab";
export const GL_PARSED_DATA_TREE_ID = "parsed-data-tree";
export const GL_HEX_VIEWER_ID = "hex-viewer";
export const GL_FILE_TREE_ID = "file-tree";
export const GL_INFO_PANEL_ID = "info-panel";
export const GL_CONVERTER_PANEL_ID = "converter-panel";
export const GL_ERRORS_TAB_ID = "errors-tab";


export const GoldenLayoutUIConfig: GoldenLayout.Config = {
    settings: {showCloseIcon: false, showPopoutIcon: false},
    content: [
        {
            type: "row", content: []
                .concat({type: "component", componentName: GL_FILE_TREE_ID, title: "files", isClosable: false, width: 12})
                .concat(
                    {
                        type: "column", id: GL_MAIN_VIEW_ID, isClosable: false, content: [
                            {
                                type: "row", content: [
                                    {
                                        type: "column", content: [
                                            {type: "component", componentName: GL_KSY_EDITOR_ID, title: ".ksy editor", isClosable: false},
                                            {
                                                type: "stack", activeItemIndex: 0, content: [
                                                    {type: "component", componentName: GL_PARSED_DATA_TREE_ID, title: "object tree", isClosable: false}
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        type: "stack", id: GL_CODE_STACK_ID, activeItemIndex: 2, content: [
                                            {type: "component", componentName: GL_GEN_CODE_VIEWER_ID, title: "JS code", isClosable: false},
                                            {type: "component", componentName: GL_GEN_CODE_VIEWER_DEBUG_ID, title: "JS code (debug)", isClosable: false},
                                            {
                                                type: "column", isClosable: false, id: GL_BINARY_FILE_TAB_ID, title: "input binary", content: [
                                                    {type: "component", componentName: GL_HEX_VIEWER_ID, title: "hex viewer", isClosable: false},
                                                    {
                                                        type: "row", isClosable: false, height: 35, content: [
                                                            {
                                                                type: "component",
                                                                componentName: GL_INFO_PANEL_ID,
                                                                title: "info panel",
                                                                isClosable: false,
                                                                width: 40
                                                            },
                                                            {type: "component", componentName: GL_CONVERTER_PANEL_ID, title: "converter", isClosable: false},
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                        ]
                    })
        }
    ]
};