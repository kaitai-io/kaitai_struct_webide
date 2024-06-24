import GoldenLayout from "golden-layout";

export const GoldenLayoutUIConfig: GoldenLayout.Config = {
    settings: {showCloseIcon: false, showPopoutIcon: false},
    content: [
        {
            type: "row", content: []
                .concat({type: "component", componentName: "fileTreeCont", title: "files", isClosable: false, width: 12})
                .concat(
                    {
                        type: "column", id: "mainArea", isClosable: false, content: [
                            {
                                type: "row", content: [
                                    {
                                        type: "column", content: [
                                            {type: "component", componentName: "ksyEditor", title: ".ksy editor", isClosable: false},
                                            {
                                                type: "stack", activeItemIndex: 0, content: [
                                                    {type: "component", componentName: "parsedDataTree", title: "object tree", isClosable: false},
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        type: "stack", id: "codeTab", activeItemIndex: 2, content: [
                                            {type: "component", componentName: "genCodeViewer", title: "JS code", isClosable: false},
                                            {type: "component", componentName: "genCodeDebugViewer", title: "JS code (debug)", isClosable: false},
                                            {
                                                type: "column", isClosable: false, id: "inputBinaryTab", title: "input binary", content: [
                                                    {type: "component", componentName: "hex-viewer", title: "hex viewer", isClosable: false},
                                                    {
                                                        type: "row", isClosable: false, height: 35, content: [
                                                            {
                                                                type: "component",
                                                                componentName: "infoPanel",
                                                                title: "info panel",
                                                                isClosable: false,
                                                                width: 40
                                                            },
                                                            {type: "component", componentName: "converterPanel", title: "converter", isClosable: false},
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