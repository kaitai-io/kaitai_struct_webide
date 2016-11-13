var fsHelper = {
    selectNode(root, fn) {
        var currNode = root;
        var fnParts = fn.split('/');
        var currPath = '';
        for (var i = 0; i < fnParts.length; i++) {
            var fnPart = fnParts[i];
            currPath += (currPath ? '/' : '') + fnPart;
            if (!('children' in currNode)) {
                currNode.children = {};
                currNode.type = 'folder';
            }
            if (!(fnPart in currNode.children))
                currNode.children[fnPart] = { fsType: root.fsType, type: 'file', fn: currPath };
            currNode = currNode.children[fnPart];
        }
        return currNode;
    }
};
class LocalStorageFs {
    constructor(prefix) {
        this.prefix = prefix;
    }
    filesKey() { return `${this.prefix}_files`; }
    fileKey(fn) { return `${this.prefix}_file[${fn}]`; }
    save() { return localforage.setItem(this.filesKey(), this.root); }
    getRootNode() {
        if (this.root)
            return Promise.resolve(this.root);
        this.rootPromise = localforage.getItem(this.filesKey()).then(x => x || { fsType: 'local' }).then(r => this.root = r);
        return this.rootPromise;
    }
    setRootNode(newRoot) {
        this.root = newRoot;
        return this.save();
    }
    get(fn) { return localforage.getItem(this.fileKey(fn)); }
    put(fn, data) {
        return this.getRootNode().then(root => {
            var node = fsHelper.selectNode(root, fn);
            return Promise.all([localforage.setItem(this.fileKey(fn), data), this.save()]).then(x => node);
        });
    }
}
class KaitaiFs {
    constructor(files) {
        this.files = files;
    }
    getRootNode() { return Promise.resolve(this.files); }
    get(fn) {
        if (fn.toLowerCase().endsWith('.ksy'))
            return Promise.resolve($.ajax({ url: fn }));
        else
            return downloadFile(fn);
    }
    put(fn, data) { return Promise.reject('KaitaiFs.put is not implemented!'); }
}
var files = [
    'formats/archive/zip.ksy',
    'formats/executable/dos_mz.ksy',
    'formats/executable/java_class.ksy',
    'formats/executable/microsoft_pe.ksy',
    'formats/filesystem/ext2.ksy',
    'formats/filesystem/iso9660.ksy',
    'formats/filesystem/mbr_partition_table.ksy',
    'formats/game/doom_wad.ksy',
    'formats/game/ftl_dat.ksy',
    'formats/game/heroes_of_might_and_magic_agg.ksy',
    'formats/game/heroes_of_might_and_magic_bmp.ksy',
    'formats/game/quake_pak.ksy',
    'formats/image/bmp.ksy',
    'formats/image/exif.ksy',
    'formats/image/gif.ksy',
    'formats/image/jpeg.ksy',
    'formats/image/pcx.ksy',
    'formats/image/png.ksy',
    'formats/image/wmf.ksy',
    'formats/media/standard_midi_file.ksy',
    'formats/network/ethernet_frame.ksy',
    'formats/network/icmp_packet.ksy',
    'formats/network/ipv4_packet.ksy',
    'formats/network/pcap.ksy',
    'formats/network/tcp_segment.ksy',
    'formats/network/udp_datagram.ksy',
    'samples/grad8rgb.bmp',
    'samples/pnggrad8rgb.png',
    'samples/sample1.iso',
    'samples/sample1.wad',
    'samples/sample1.zip',
];
var kaitaiRoot = { fsType: 'kaitai' };
files.forEach(fn => fsHelper.selectNode(kaitaiRoot, fn));
var kaitaiFs = new KaitaiFs(kaitaiRoot);
var localFs = new LocalStorageFs("fs");
var fss = { local: localFs, kaitai: kaitaiFs };
function genChildNode(obj, fn) {
    var isFolder = obj.type === 'folder';
    return {
        text: fn,
        icon: 'glyphicon glyphicon-' + (isFolder ? 'folder-open' : fn.endsWith('.ksy') ? 'list-alt' : 'file'),
        children: isFolder ? genChildNodes(obj) : null,
        data: obj
    };
}
function genChildNodes(obj) {
    return Object.keys(obj.children).map(k => genChildNode(obj.children[k], k));
}
function refreshFsNodes() {
    var localStorageNode = ui.fileTree.get_node('localStorage');
    localFs.getRootNode().then(root => {
        ui.fileTree.delete_node(localStorageNode.children);
        genChildNodes(root).forEach(node => ui.fileTree.create_node(localStorageNode, node));
    });
}
$(() => {
    //console.log('kaitaiRoot', kaitaiRoot);
    ui.fileTree = ui.fileTreeCont.getElement().jstree({
        core: {
            check_callback: function (operation, node, node_parent, node_position, more) {
                var result = true;
                if (operation === "move_node")
                    result = !!node.data && node.data.fsType === "local" && !!node_parent.data && node_parent.data.fsType === "local" && node_parent.data.type === "folder";
                return result;
            },
            themes: { name: "default-dark", dots: false, icons: true, variant: 'small' },
            data: [
                {
                    text: 'kaitai.io',
                    icon: 'glyphicon glyphicon-cloud',
                    state: { opened: true },
                    children: [
                        { text: 'formats', icon: 'glyphicon glyphicon-book', children: genChildNodes(kaitaiRoot.children['formats']), state: { opened: true } },
                        { text: 'samples', icon: 'glyphicon glyphicon-cd', children: genChildNodes(kaitaiRoot.children['samples']), state: { opened: true } },
                    ]
                },
                { text: 'Local storage', id: 'localStorage', icon: 'glyphicon glyphicon-hdd', state: { opened: true }, children: [], data: { fsType: 'local', type: 'folder' } }
            ],
        },
        plugins: ["wholerow", "dnd"]
    }).bind('loaded.jstree', refreshFsNodes).jstree(true);
    var fileTreeContextMenu = $("#fileTreeContextMenu");
    var createFolder = $('#fileTreeContextMenu .createFolder');
    var createKsyFile = $('#fileTreeContextMenu .createKsyFile');
    var deleteItem = $('#fileTreeContextMenu .deleteItem');
    var openItem = $('#fileTreeContextMenu .openItem');
    var generateParser = $('#fileTreeContextMenu .generateParser');
    function convertTreeNode(treeNode) {
        var data = treeNode.data;
        data.children = {};
        treeNode.children.forEach(child => data.children[child.text] = convertTreeNode(child));
        return data;
    }
    function saveTree() {
        localFs.setRootNode(convertTreeNode(ui.fileTree.get_json()[1]));
    }
    var contextMenuTarget = null;
    function getSelectedData() {
        return ui.fileTree.get_node(contextMenuTarget).data;
    }
    ui.fileTreeCont.getElement().on('contextmenu', '.jstree-node', e => {
        contextMenuTarget = e.target;
        var clickNodeId = ui.fileTree.get_node(contextMenuTarget).id;
        var selectedNodeIds = ui.fileTree.get_selected();
        if ($.inArray(clickNodeId, selectedNodeIds) === -1)
            ui.fileTree.activate_node(contextMenuTarget, null);
        var data = getSelectedData();
        var canCreateItem = !(data && data.fsType === 'local' && data.type === 'folder');
        createFolder.toggleClass('disabled', canCreateItem);
        createKsyFile.toggleClass('disabled', canCreateItem);
        deleteItem.toggleClass('disabled', !(data && data.fsType === 'local'));
        generateParser.toggleClass('disabled', !(data && data.fn && data.fn.endsWith('.ksy')));
        fileTreeContextMenu.css({ display: "block", left: e.pageX, top: e.pageY });
        return false;
    });
    $(document).on('mouseup', e => {
        if ($(e.target).parents('.dropdown-menu').length === 0)
            fileTreeContextMenu.hide();
    });
    createFolder.find('a').on('click', e => {
        fileTreeContextMenu.hide();
        var parentData = getSelectedData();
        ui.fileTree.create_node(ui.fileTree.get_node(contextMenuTarget), { data: { fsType: parentData.fsType, type: 'folder' }, icon: 'glyphicon glyphicon-folder-open' }, "last", function (new_node) {
            setTimeout(function () { ui.fileTree.edit(new_node); }, 0);
        });
    });
    deleteItem.find('a').on('click', e => {
        fileTreeContextMenu.hide();
        ui.fileTree.delete_node(ui.fileTree.get_selected());
    });
    openItem.find('a').on('click', e => {
        fileTreeContextMenu.hide();
        $(contextMenuTarget).trigger('dblclick');
    });
    var dynCodeId = 1;
    generateParser.find('a').on('click', e => {
        fileTreeContextMenu.hide();
        var fsItem = getSelectedData();
        var linkData = $(e.target).data();
        console.log(fsItem, linkData);
        fss[fsItem.fsType].get(fsItem.fn).then(content => {
            var compiled = compile(content, linkData.kslang, !!linkData.ksdebug);
            compiled.forEach((compItem, i) => {
                var componentName = `dynCode${dynCodeId++}`;
                addEditor(componentName, linkData.acelang, true, editor => editor.setValue(compItem, -1));
                var title = fsItem.fn.split('/').last() + ' [' + $(e.target).text() + ']' + (compiled.length == 1 ? '' : ` ${i + 1}/${compiled.length}`);
                getLayoutNodeById('codeTab').addChild({ type: 'component', componentName, title });
            });
        });
    });
    ui.fileTreeCont.getElement().on('create_node.jstree rename_node.jstree delete_node.jstree move_node.jstree paste.jstree', saveTree);
    ui.fileTreeCont.getElement().on('move_node.jstree', (e, data) => ui.fileTree.open_node(ui.fileTree.get_node(data.parent)));
    createKsyFile.find('a').on('click', e => {
        fileTreeContextMenu.hide();
        $('#newKsyModal').modal();
    });
    $('#newKsyModal').on('shown.bs.modal', () => $('#newKsyModal input').focus());
    $('#newKsyModal form').submit(function (event) {
        event.preventDefault();
        $('#newKsyModal').modal('hide');
        var ksyName = $('#newKsyName').val();
        var parentData = getSelectedData();
        fss[parentData.fsType].put((parentData.fn ? `${parentData.fn}/` : '') + `${ksyName}.ksy`, `meta:\n  id: ${ksyName}\n  file-extension: ${ksyName}\n`).then(fsItem => {
            ui.fileTree.create_node(ui.fileTree.get_node(contextMenuTarget), { text: `${ksyName}.ksy`, data: fsItem, icon: 'glyphicon glyphicon-list-alt' }, "last");
            return loadFsItem(fsItem);
        });
    });
});
//# sourceMappingURL=app.files.js.map