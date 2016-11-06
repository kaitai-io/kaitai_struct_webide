$(() => {
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
                currObj[part] = i == fnParts.length - 1 ? { _data: fn } : {};
            currObj = currObj[part];
        }
    });

    console.log(fileListTree);

    function genChildNodes(obj, fileIcon: string = 'file') {
        return Object.keys(obj).map(k => {
            var value = obj[k];
            var isFolder = !value._data;
            return {
                text: k,
                icon: 'glyphicon glyphicon-' + (isFolder ? 'folder-open' : fileIcon),
                children: isFolder ? genChildNodes(value, fileIcon) : null,
                data : value._data
            };
        });
    }

    var fileTree = <any>ui.fileTree.getElement();
    fileTree.jstree({
        core: {
            themes: { name: "default-dark", dots: false, icons: true, variant: 'small' },
            data: [
                {
                    text: 'kaitai.io',
                    icon: 'glyphicon glyphicon-cloud',
                    state: { opened: true },
                    children: [
                        { text: 'formats', icon: 'glyphicon glyphicon-book', children: genChildNodes(fileListTree.formats, 'list-alt'), state: { opened: true } },
                        { text: 'samples', icon: 'glyphicon glyphicon-cd', children: genChildNodes(fileListTree.samples), state: { opened: true } },
                    ]
                },
                {
                    text: 'Local storage',
                    icon: 'glyphicon glyphicon-hdd',
                    state: { opened: true },
                    children: []
                }
            ]
        }
    });
})