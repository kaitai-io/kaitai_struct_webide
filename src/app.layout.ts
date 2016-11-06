var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [
        {
            type: 'column', isClosable: false, content: [
                {
                    type: 'row', content: [
                        {
                            type: 'column', content: [
                                { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
                                {
                                    type: 'stack', activeItemIndex: 1, content: [
                                        { type: 'component', componentName: 'parsedDataViewer', title: 'parsed as JSON', isClosable: false },
                                        { type: 'component', componentName: 'parsedDataTree', title: 'parsed as tree', isClosable: false },
                                    ]
                                },
                            ]
                        },
                        {
                            type: 'stack', activeItemIndex: 2, content: [
                                { type: 'component', componentName: 'genCodeViewer', title: 'JS code', isClosable: false },
                                { type: 'component', componentName: 'genCodeDebugViewer', title: 'JS code (debug)', isClosable: false },
                                {
                                    type: 'column', isClosable: false, title: 'input binary', content: [
                                        { type: 'component', componentName: 'hexViewer', title: 'hex viewer', isClosable: false },
                                        { type: 'component', componentName: 'infoPanel', title: 'info panel', isClosable: false, height: 30 },
                                    ]
                                }
                            ]
                        }
                    ]
                },
            ]
        }
    ]
});

var ui = {
    ksyEditor: <AceAjax.Editor>null,
    genCodeViewer: <AceAjax.Editor>null,
    genCodeDebugViewer: <AceAjax.Editor>null,
    parsedDataViewer: <AceAjax.Editor>null,
    parsedDataTree: <GoldenLayout.Container>null,
    hexViewer: <HexViewer>null,
    errorWindow: <GoldenLayout.Container>null,
    infoPanel: <GoldenLayout.Container>null,
};

function addComponent(name: string, generatorCallback?) {
    var editor;

    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState) {
        container.getElement().attr('id', name);
        if (generatorCallback) {
            container.on('resize', () => { if (editor && editor.resize) editor.resize(); });
            container.on('open', () => { ui[name] = editor = generatorCallback(container) || container; });
        } else
            ui[name] = container;
    });
}

function addEditor(name: string, lang: string, isReadOnly: boolean = false) {
    addComponent(name, () => {
        var editor = ace.edit(name);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode(`ace/mode/${lang}`);
        editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
        editor.setReadOnly(isReadOnly);
        return editor;
    });
}

addEditor('ksyEditor', 'yaml');
addEditor('genCodeViewer', 'javascript', true);
addEditor('genCodeDebugViewer', 'javascript', false);
addEditor('parsedDataViewer', 'javascript', true);
addComponent('hexViewer', () => new HexViewer("hexViewer"));
addComponent('errorWindow', cont => { cont.getElement().append($("<div />")); });
addComponent('infoPanel', cont => { cont.getElement().append($("#infoPanel")); });
addComponent('parsedDataTree');

myLayout.init();