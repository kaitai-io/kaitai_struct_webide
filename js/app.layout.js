var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [
        { type: 'row', content: [
                { type: 'component', componentName: 'fileTreeCont', title: 'files', isClosable: false, width: 12 },
                { type: 'column', id: 'mainArea', isClosable: false, content: [
                        { type: 'row', content: [
                                { type: 'column', content: [
                                        { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
                                        { type: 'stack', activeItemIndex: 0, content: [
                                                //{ type: 'component', componentName: 'parsedDataViewer', title: 'parsed as JSON', isClosable: false },
                                                { type: 'component', componentName: 'parsedDataTree', title: 'parsed as tree', isClosable: false },
                                            ] },
                                    ] },
                                { type: 'stack', id: 'codeTab', activeItemIndex: 2, content: [
                                        { type: 'component', componentName: 'genCodeViewer', title: 'JS code', isClosable: false },
                                        { type: 'component', componentName: 'genCodeDebugViewer', title: 'JS code (debug)', isClosable: false },
                                        { type: 'column', isClosable: false, title: 'input binary', content: [
                                                { type: 'component', componentName: 'hexViewer', title: 'hex viewer', isClosable: false },
                                                { type: 'component', componentName: 'infoPanel', title: 'info panel', isClosable: false, height: 30 },
                                            ] }
                                    ] }
                            ] },
                    ] }
            ] }
    ]
});
function getLayoutNodeById(id) {
    return myLayout._getAllContentItems().filter(x => x.config.id === id)[0];
}
var ui = {
    ksyEditor: null,
    genCodeViewer: null,
    genCodeDebugViewer: null,
    //parsedDataViewer: <AceAjax.Editor>null,
    parsedDataTreeCont: null,
    parsedDataTree: null,
    hexViewer: null,
    errorWindow: null,
    infoPanel: null,
    fileTreeCont: null,
    fileTree: null,
};
function addComponent(name, generatorCallback) {
    var editor;
    myLayout.registerComponent(name, function (container, componentState) {
        //console.log('addComponent id', name, container.getElement());
        container.getElement().attr('id', name);
        if (generatorCallback) {
            container.on('resize', () => { if (editor && editor.resize)
                editor.resize(); });
            container.on('open', () => { ui[name] = editor = generatorCallback(container) || container; });
        }
        else
            ui[name + 'Cont'] = container;
    });
}
function addEditor(name, lang, isReadOnly = false, callback = null) {
    addComponent(name, container => {
        var editor = ace.edit(container.getElement().get(0));
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode(`ace/mode/${lang}`);
        if (lang === 'yaml')
            editor.setOption('tabSize', 2);
        editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
        editor.setReadOnly(isReadOnly);
        if (callback)
            callback(editor);
        return editor;
    });
}
addEditor('ksyEditor', 'yaml');
addEditor('genCodeViewer', 'javascript', true);
addEditor('genCodeDebugViewer', 'javascript', false);
//addEditor('parsedDataViewer', 'javascript', true);
addComponent('hexViewer', () => new HexViewer("hexViewer"));
addComponent('errorWindow', cont => { cont.getElement().append($("<div />")); });
addComponent('infoPanel', cont => { cont.getElement().append($("#infoPanel").children()); });
addComponent('parsedDataTree');
addComponent('fileTreeCont', cont => cont.getElement().append($("#fileTreeCont").children()));
myLayout.init();
//# sourceMappingURL=app.layout.js.map