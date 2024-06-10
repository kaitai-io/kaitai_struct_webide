import {app} from "./app";
import {fileSystemsManager} from "./FileSystems/FileSystemManager";
import {initKaitaiFsTreeData} from "./FileSystems/KaitaiFileSystem";
import {initLocalStorageFsTreeData} from "./FileSystems/LocalStorageFileSystem";
import {IJSTreeNode} from "./parsedToTree";
import {getSummaryIfPresent, mapToJSTreeNodes} from "./FileSystems/FileSystemHelper";
import {FILE_SYSTEM_TYPE_LOCAL, IFsItem, IFsItemSummary, ITEM_MODE_DIRECTORY} from "./FileSystems/FileSystemsTypes";
import dateFormat = require("dateformat");
import {ArrayUtils} from "./utils/Misc/ArrayUtils";
import {FileActionsWrapper} from "./utils/Files/FileActionsWrapper";
import {openUploadFilesOperatingSystemModal} from "./JQueryComponents/Files/UploadFilesOSModal";

let fileTreeCont: JQuery;

export async function refreshFsNodes() {
    var localStorageNode = app.ui.fileTree.get_node("localStorage");
    var root = await fileSystemsManager.local.getRootNode();
    app.ui.fileTree.delete_node(localStorageNode.children);
    if (root)
        mapToJSTreeNodes(root).forEach((node: any) => app.ui.fileTree.create_node(localStorageNode, node));
}

export async function addKsyFile(parent: string | Element, ksyFn: string, content: string) {
    const name = ArrayUtils.last(ksyFn.split("/"));
    let fsItem = await fileSystemsManager.local.put(name, content);
    app.ui.fileTree.create_node(app.ui.fileTree.get_node(parent), {text: name, data: fsItem, icon: "glyphicon glyphicon-list-alt"},
        "last", (node: any) => app.ui.fileTree.activate_node(node, null));
    await app.loadFsItem(fsItem, true);
    return fsItem;
}

export function initFileTree() {
    fileTreeCont = app.ui.fileTreeCont.find(".fileTree");

    app.ui.fileTree = fileTreeCont.jstree({
        core: {
            check_callback: function (operation: string, node: any, node_parent: any, node_position: number, more: boolean) {
                var result = true;
                if (operation === "move_node")
                    result = !!node.data && node.data.fsType === FILE_SYSTEM_TYPE_LOCAL &&
                        !!node_parent.data && node_parent.data.fsType === FILE_SYSTEM_TYPE_LOCAL && node_parent.data.type === ITEM_MODE_DIRECTORY;
                return result;
            },
            themes: {name: "default-dark", dots: false, icons: true, variant: "small"},
            data: [
                initKaitaiFsTreeData(fileSystemsManager.kaitai),
                initLocalStorageFsTreeData()
            ],
        },
        plugins: ["wholerow", "dnd"]
    }).jstree(true);
    refreshFsNodes();

    var uiFiles = {
        fileTreeContextMenu: $("#fileTreeContextMenu"),
        dropdownSubmenus: $("#fileTreeContextMenu .dropdown-submenu"),
        openItem: $("#fileTreeContextMenu .openItem"),
        createFolder: $("#fileTreeContextMenu .createFolder"),
        createKsyFile: $("#fileTreeContextMenu .createKsyFile"),
        cloneKsyFile: $("#fileTreeContextMenu .cloneKsyFile"),
        generateParser: $("#fileTreeContextMenu .generateParser"),
        downloadItem: $("#fileTreeContextMenu .downloadItem"),
        deleteItem: $("#fileTreeContextMenu .deleteItem"),
        createLocalKsyFile: $("#createLocalKsyFile"),
        uploadFile: $("#uploadFile"),
        downloadFile: $("#downloadFile"),
    };

    function convertTreeNode(treeNode: any) {
        const data = treeNode.data;
        data.children = {};
        treeNode.children.forEach((child: any) => data.children[child.text] = convertTreeNode(child));
        return data;
    }

    function saveTree() {
        const localRootNode = app.ui.fileTree.get_json()[1];
        const convertedLocalRootNode = convertTreeNode(localRootNode);
        fileSystemsManager.local.setRootNode(convertedLocalRootNode);
    }

    var contextMenuTarget: string | Element = null;

    function getSelectedData(): IFsItem | undefined {
        const selected = app.ui.fileTree.get_selected();
        return selected.length >= 1 ? <IFsItem>app.ui.fileTree.get_node(selected[0]).data : null;
    }

    function generateSummaryOfSelectedNode(): IFsItemSummary {
        const fsItem = getSelectedData();
        return getSummaryIfPresent(fsItem);
    }

    fileTreeCont.on("contextmenu", ".jstree-node", e => {
        contextMenuTarget = e.target;

        const clickNodeId = app.ui.fileTree.get_node(contextMenuTarget).id;
        const selectedNodeIds = app.ui.fileTree.get_selected();
        if ($.inArray(clickNodeId, selectedNodeIds) === -1)
            app.ui.fileTree.activate_node(contextMenuTarget, null);

        function setEnabled(item: JQuery, isEnabled: boolean) {
            item.toggleClass("disabled", !isEnabled);
        }

        const {isLocal, isFolder, isKsy} = generateSummaryOfSelectedNode();
        setEnabled(uiFiles.createFolder, isLocal && isFolder);
        setEnabled(uiFiles.createKsyFile, isLocal && isFolder);
        setEnabled(uiFiles.cloneKsyFile, isLocal && isKsy);
        setEnabled(uiFiles.deleteItem, isLocal);
        setEnabled(uiFiles.generateParser, isKsy);

        uiFiles.fileTreeContextMenu.css({display: "block"}); // necessary for obtaining width & height
        var x = Math.min(e.pageX, $(window).width() - uiFiles.fileTreeContextMenu.width());
        var h = uiFiles.fileTreeContextMenu.height();
        var y = e.pageY > ($(window).height() - h) ? e.pageY - h : e.pageY;
        uiFiles.fileTreeContextMenu.css({left: x, top: y});
        return false;
    });

    uiFiles.dropdownSubmenus.mouseenter(e => {
        var el = $(e.currentTarget);
        if (!el.hasClass("disabled")) {
            var menu = el.find("> .dropdown-menu");
            var hideTimeout = menu.data("hide-timeout");
            if (typeof hideTimeout === "number") {
                clearTimeout(hideTimeout);
                menu.data("hide-timeout", null);
            }
            menu.css({display: "block"});
            var itemPos = el.offset();
            var menuW = menu.outerWidth();
            var menuH = menu.outerHeight();
            var x = itemPos.left + el.width() + menuW <= $(window).width() ? itemPos.left + el.width() : itemPos.left - menuW;
            var y = itemPos.top + menuH <= $(window).height()
                ? itemPos.top
                : itemPos.top >= menuH
                    ? itemPos.top + el.height() - menu.height()
                    : $(window).height() - menuH;
            x -= itemPos.left;
            y -= itemPos.top;
            menu.css({left: x, top: y});
        }

    }).mouseleave(e => {
        var el = $(e.currentTarget);
        var menu = el.find("> .dropdown-menu");
        menu.data("hide-timeout", setTimeout(() => {
            menu.css({display: "none"});
        }, 300));
    });

    function ctxAction(obj: JQuery, callback: (e: JQueryEventObject) => void) {
        obj.find("a").on("click", e => {
            if (!obj.hasClass("disabled")) {
                uiFiles.fileTreeContextMenu.hide();
                callback(e);
            }
        });
    }

    ctxAction(uiFiles.createFolder, e => {
        var parentData = getSelectedData();
        app.ui.fileTree.create_node(app.ui.fileTree.get_node(contextMenuTarget), {
            data: {fsType: parentData.fsType, type: ITEM_MODE_DIRECTORY},
            icon: "glyphicon glyphicon-folder-open"
        }, "last", (node: any) => {
            app.ui.fileTree.activate_node(node, null);
            setTimeout(() => app.ui.fileTree.edit(node), 0);
        });
    });

    ctxAction(uiFiles.deleteItem, () => app.ui.fileTree.delete_node(app.ui.fileTree.get_selected()));
    ctxAction(uiFiles.openItem, () => $(contextMenuTarget).trigger("dblclick"));

    ctxAction(uiFiles.generateParser, e => {
        var fsItem = getSelectedData();
        var linkData = $(e.target).data();
        //console.log(fsItem, linkData);

        fileSystemsManager[fsItem.fsType].get(fsItem.fn).then((content: string) => {
            return app.compilerService.compile(fsItem, content, linkData.kslang, !!linkData.ksdebug).then((compiled: any) => {
                Object.keys(compiled).forEach(fileName => {
                    const options = {
                        lang: linkData.acelang,
                        isReadOnly: true,
                        data: compiled[fileName]
                    };
                    app.ui.layoutManager.addDynamicAceCodeEditorTab(fileName, options);
                });
            });
        });
    });

    fileTreeCont.on("create_node.jstree rename_node.jstree delete_node.jstree move_node.jstree paste.jstree", saveTree);
    fileTreeCont.on("move_node.jstree", (e, data) => app.ui.fileTree.open_node(app.ui.fileTree.get_node(data.parent)));
    fileTreeCont.on("select_node.jstree", (e, selectNodeArgs) => {
        var fsItem = (<IJSTreeNode<IFsItem>>selectNodeArgs.node).data;
        [uiFiles.downloadFile, uiFiles.downloadItem].forEach(i => i.toggleClass("disabled", !(fsItem && fsItem.type === "file")));
    });

    var lastMultiSelectReport = 0;
    fileTreeCont.on("select_node.jstree", (e, args) => {
        lastMultiSelectReport = e.timeStamp;
    });

    var ksyParent: string | Element;

    function showKsyModal(parent: string | Element) {
        ksyParent = parent;
        $("#newKsyName").val("");
        (<any>$("#newKsyModal")).modal();
    }

    ctxAction(uiFiles.createKsyFile, () => showKsyModal(contextMenuTarget));
    uiFiles.createLocalKsyFile.on("click", () => showKsyModal("localStorage"));

    function downloadFiles() {
        app.ui.fileTree.get_selected().forEach(nodeId => {
            const fsItem = <IFsItem>app.ui.fileTree.get_node(nodeId).data;
            fileSystemsManager[fsItem.fsType].get(fsItem.fn)
                .then(content => FileActionsWrapper.saveFile(content, ArrayUtils.last(fsItem.fn.split("/"))));
        });
    }

    ctxAction(uiFiles.downloadItem, () => downloadFiles());
    uiFiles.downloadFile.on("click", () => downloadFiles());

    uiFiles.uploadFile.on("click", () => openUploadFilesOperatingSystemModal(files => app.addNewFiles(files)));

    $("#newKsyModal").on("shown.bs.modal", () => {
        $("#newKsyModal input").focus();
    });
    $("#newKsyModal form").submit(function (event) {
        event.preventDefault();
        (<any>$("#newKsyModal")).modal("hide");

        var ksyName = $("#newKsyName").val();
        var parentData = app.ui.fileTree.get_node(ksyParent).data;

        addKsyFile(ksyParent, (parentData.fn ? `${parentData.fn}/` : "") + `${ksyName}.ksy`, `meta:\n  id: ${ksyName}\n  file-extension: ${ksyName}\n`);
    });

    fileTreeCont.bind("dblclick.jstree", function (event) {
        app.loadFsItem(<IFsItem>app.ui.fileTree.get_node(event.target).data);
    });

    ctxAction(uiFiles.cloneKsyFile, e => {
        var fsItem = getSelectedData();
        var newFn = fsItem.fn.replace(".ksy", "_" + dateFormat(new Date(), "yyyymmdd_HHMMss") + ".ksy");

        fileSystemsManager[fsItem.fsType].get(fsItem.fn).then((content: string) => addKsyFile("localStorage", newFn, content));
    });
}
