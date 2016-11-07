interface IFileSystem {
    getFiles(): Promise<any>;
    setFiles(files): Promise<void>;
    get(fn): Promise<string | ArrayBuffer>;
    put(fn, data): Promise<void>;
}

interface IFsItem {
    _fsType: string;
    _fn: string;
    _type: 'file' | 'folder';
    [s: string]: IFsItem|any;
}

class LocalStorageFs implements IFileSystem {
    constructor(public prefix: string) { }

    getFilesInternal() { return localforage.getItem(`${this.prefix}_files`).then(x => x || {}); }
    getFiles() { return this.getFilesInternal().then(x => Object.keys(x).map(key => ({ _type: x[key].type, _fn: key, _fsType: 'local' }))); }

    setFiles(files) { return localforage.setItem(`${this.prefix}_files`, files); }
    get(fn) { return localforage.getItem<string|ArrayBuffer>(`${this.prefix}_file_${fn}`); }

    put(fn, data) {
        return this.getFilesInternal().then(files => {
            files[fn] = { type: 'file' };
            return Promise.all([localforage.setItem(`${this.prefix}_file_${fn}`, data), this.setFiles(files)]);
        });
    }
}

class KaitaiFs implements IFileSystem {
    constructor(public files: any){ }

    getFiles() { return Promise.resolve(this.files); }
    setFiles(files) { return Promise.reject('KaitaiFs.setFiles is not implemented!'); }

    get(fn) {
        if (fn.toLowerCase().endsWith('.ksy'))
            return Promise.resolve<string>($.ajax({ url: fn }));
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

var fileListTree: any = {};
files.forEach(fn => {
    var currObj = fileListTree;

    var fnParts = fn.split('/');
    for (var i = 0; i < fnParts.length; i++) {
        var part = fnParts[i];

        if (!currObj[part])
            currObj[part] = i == fnParts.length - 1 ? { _type: 'file', _fn: fn, _fsType: 'kaitai' } : { _type: 'folder', _fn: fn };
        currObj = currObj[part];
    }
});

var kaitaiFs = new KaitaiFs(fileListTree);
var localFs = new LocalStorageFs("fs");
var fss = { local: localFs, kaitai: kaitaiFs };

function genChildNode(obj: IFsItem) {
    var isFolder = obj._type === 'folder';
    var fn = obj._fn.split('/').last();
    return {
        text: fn,
        icon: 'glyphicon glyphicon-' + (isFolder ? 'folder-open' : fn.endsWith('.ksy') ? 'list-alt' : 'file'),
        children: isFolder ? genChildNodes(obj) : null,
        data: obj
    };
}

function genChildNodes(obj) {
    return Object.keys(obj).filter(x => !x.startsWith('_')).map(k => genChildNode(obj[k]));
}

function refreshFsNodes() {
    var localStorageNode = ui.fileTree.get_node('localStorage');
    localFs.getFiles().then(files => {
        ui.fileTree.delete_node(localStorageNode.children);
        Object.keys(files).map(fn => ui.fileTree.create_node(localStorageNode, genChildNode(files[fn])));
    });
}

$(() => {
    console.log(fileListTree);

    ui.fileTree = ui.fileTreeCont.getElement().jstree({
        core: {
            check_callback: true,
            themes: { name: "default-dark", dots: false, icons: true, variant: 'small' },
            data: [
                {
                    text: 'kaitai.io',
                    icon: 'glyphicon glyphicon-cloud',
                    state: { opened: true },
                    children: [
                        { text: 'formats', icon: 'glyphicon glyphicon-book', children: genChildNodes(fileListTree.formats), state: { opened: true } },
                        { text: 'samples', icon: 'glyphicon glyphicon-cd', children: genChildNodes(fileListTree.samples), state: { opened: true } },
                    ]
                },
                { text: 'Local storage', id: 'localStorage', icon: 'glyphicon glyphicon-hdd', state: { opened: true }, children: [] }
            ]
        }
    }).bind('loaded.jstree', refreshFsNodes).jstree(true);
})