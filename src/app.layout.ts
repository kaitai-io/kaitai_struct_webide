var practiceChallNameMatch = /practice=([a-z0-9]+)/.exec(location.href);
var practiceChallName = practiceChallNameMatch ? practiceChallNameMatch[1] : practiceMode.chall;
var practiceChall = practiceMode && practiceChallName && practiceMode.challs[practiceChallName];
var isPracticeMode = !!practiceChall;

var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [
        { type: 'row', content: []
            .concat(isPracticeMode ? [] : { type: 'component', componentName: 'fileTreeCont', title: 'files', isClosable: false, width:12 })
            .concat(isPracticeMode ? { type: 'component', componentName: 'practicePanel', title: 'practice mode', isClosable: false, width: 25 } : [])
            .concat(
                { type: 'column', id: 'mainArea', isClosable: false, content: [
                    { type: 'row', content: [
                        { type: 'column', content: [
                            { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
                            { type: 'stack', activeItemIndex: 0, content: [
                                //{ type: 'component', componentName: 'parsedDataViewer', title: 'parsed as JSON', isClosable: false },
                                { type: 'component', componentName: 'parsedDataTree', title: 'parsed as tree', isClosable: false },
                            ]},
                        ]},
                        { type: 'stack', id: 'codeTab', activeItemIndex: 2, content: [
                            { type: 'component', componentName: 'genCodeViewer', title: 'JS code', isClosable: false },
                            { type: 'component', componentName: 'genCodeDebugViewer', title: 'JS code (debug)', isClosable: false },
                            { type: 'column', isClosable: false, title: 'input binary', content: [
                                { type: 'component', componentName: 'hexViewer', title: 'hex viewer', isClosable: false },
                                { type: 'row', isClosable: false, height: 35, content: [
                                    { type: 'component', componentName: 'infoPanel', title: 'info panel', isClosable: false, width: 40 },
                                    { type: 'component', componentName: 'converterPanel', title: 'converter', isClosable: false },
                                ]}
                            ]}
                        ]}
                    ]},
            ]
            })
        }
    ]
});

function getLayoutNodeById(id) {
    return (<any>myLayout)._getAllContentItems().filter(x => x.config.id === id)[0];
}

var ui = {
    ksyEditor: <AceAjax.Editor>null,
    genCodeViewer: <AceAjax.Editor>null,
    genCodeDebugViewer: <AceAjax.Editor>null,
    //parsedDataViewer: <AceAjax.Editor>null,
    parsedDataTreeCont: <GoldenLayout.Container>null,
    parsedDataTree: <JSTree>null,
    hexViewer: <HexViewer>null,
    errorWindow: <GoldenLayout.Container>null,
    infoPanel: <GoldenLayout.Container>null,
    fileTreeCont: <JQuery>null,
    fileTree: <JSTree>null,
    converterPanel: <JQuery>null,
};

function addComponent(name: string, generatorCallback?) {
    var editor;

    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState) {
        //console.log('addComponent id', name, container.getElement());
        container.getElement().attr('id', name);
        if (generatorCallback) {
            container.on('resize', () => { if (editor && editor.resize) editor.resize(); });
            container.on('open', () => { ui[name] = editor = generatorCallback(container) || container; });
        } else
            ui[name + 'Cont'] = container;
    });
}

function addExistingDiv(name: string) {
    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState) {
        ui[name] = $(`#${name}`).appendTo(container.getElement());
        $(() => ui[name].show().css({ visibility: 'visible' }));
    });
}

function addEditor(name: string, lang: string, isReadOnly: boolean = false, callback = null) {
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
addComponent('parsedDataTree');
addComponent('fileTreeCont', cont => cont.getElement().append($("#fileTreeCont").children()));
addExistingDiv('infoPanel');
addExistingDiv('converterPanel');
addExistingDiv('practicePanel');

myLayout.init();