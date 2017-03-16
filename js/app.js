/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
// /// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
define(["require", "exports", "./app.layout", "./app.errors", "./app.files", "./app.selectionInput", "./parsedToTree", "./app.worker", "./app.converterPanel", "localforage", "./FileDrop"], function (require, exports, app_layout_1, app_errors_1, app_files_1, app_selectionInput_1, parsedToTree_1, app_worker_1, app_converterPanel_1, localforage, FileDrop_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';
    $.jstree.defaults.core.force_text = true;
    class IntervalViewer {
        constructor(htmlIdPrefix) {
            this.htmlIdPrefix = htmlIdPrefix;
            ["Curr", "Total", "Prev", "Next"].forEach(control => this[`html${control}`] = $(`#${htmlIdPrefix}${control}`));
            this.htmlNext.on('click', () => this.move(+1));
            this.htmlPrev.on('click', () => this.move(-1));
        }
        move(direction) {
            if (this.intervals.length === 0)
                return;
            this.currentIdx = (this.intervals.length + this.currentIdx + direction) % this.intervals.length;
            var curr = this.intervals[this.currentIdx];
            app_layout_1.ui.hexViewer.setSelection(curr.start, curr.end);
            this.htmlCurr.text(this.currentIdx + 1);
        }
        setIntervals(intervals) {
            this.intervals = intervals;
            this.currentIdx = -1;
            this.htmlCurr.text("-");
            this.htmlTotal.text(this.intervals.length);
        }
    }
    exports.IntervalViewer = IntervalViewer;
    var ksySchema;
    ;
    class JsImporter {
        importYaml(name, mode) {
            return new Promise(function (resolve, reject) {
                console.log(`import yaml: ${name}, mode: ${mode}`);
                return app_files_1.fss.kaitai.get(`formats/${name}.ksy`).then(ksyContent => {
                    var ksyModel = YAML.parse(ksyContent);
                    return resolve(ksyModel);
                });
            });
        }
    }
    var jsImporter = new JsImporter();
    function compile(srcYaml, kslang, debug) {
        var compilerSchema;
        try {
            kaitaiIde.ksySchema = ksySchema = YAML.parse(srcYaml);
            function collectKsyTypes(schema) {
                var types = {};
                function ksyNameToJsName(ksyName, isProp) { return ksyName.split('_').map((x, i) => i == 0 && isProp ? x : x.ucFirst()).join(''); }
                function collectTypes(parent) {
                    if (parent.types) {
                        parent.typesByJsName = {};
                        Object.keys(parent.types).forEach(name => {
                            var jsName = ksyNameToJsName(name, false);
                            parent.typesByJsName[jsName] = types[jsName] = parent.types[name];
                            collectTypes(parent.types[name]);
                        });
                    }
                    if (parent.instances) {
                        parent.instancesByJsName = {};
                        Object.keys(parent.instances).forEach(name => {
                            var jsName = ksyNameToJsName(name, true);
                            parent.instancesByJsName[jsName] = parent.instances[name];
                        });
                    }
                }
                collectTypes(schema);
                types[ksyNameToJsName(schema.meta.id, false)] = schema;
                return types;
            }
            kaitaiIde.ksyTypes = exports.ksyTypes = collectKsyTypes(ksySchema);
            compilerSchema = YAML.parse(srcYaml); // we have to modify before sending into the compiler so we need a copy
            function removeWebIdeKeys(obj) {
                Object.keys(obj).filter(x => x.startsWith("-webide-")).forEach(keyName => delete obj[keyName]);
            }
            function filterOutExtensions(type) {
                removeWebIdeKeys(type);
                if (type.types)
                    Object.keys(type.types).forEach(typeName => filterOutExtensions(type.types[typeName]));
                if (type.instances)
                    Object.keys(type.instances).forEach(instanceName => removeWebIdeKeys(type.instances[instanceName]));
            }
            filterOutExtensions(compilerSchema);
        }
        catch (parseErr) {
            app_errors_1.showError("YAML parsing error: ", parseErr);
            return;
        }
        //console.log('ksySchema', ksySchema);
        if (kslang === 'json')
            return Promise.resolve();
        else {
            var ks = io.kaitai.struct.MainJs();
            var rReleasePromise = (debug === false || debug === 'both') ? ks.compile(kslang, compilerSchema, jsImporter, false) : Promise.resolve(null);
            var rDebugPromise = (debug === true || debug === 'both') ? ks.compile(kslang, compilerSchema, jsImporter, true) : Promise.resolve(null);
            //console.log('rReleasePromise', rReleasePromise, 'rDebugPromise', rDebugPromise);
            return Promise.all([rReleasePromise, rDebugPromise]).then(([rRelease, rDebug]) => {
                //console.log('rRelease', rRelease, 'rDebug', rDebug);
                return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
            }, compileErr => {
                //console.log(compileErr);
                app_errors_1.showError("KS compilation error: ", compileErr);
                return;
            });
        }
    }
    exports.compile = compile;
    function isKsyFile(fn) { return fn.toLowerCase().endsWith('.ksy'); }
    var ksyFsItemName = app_layout_1.isPracticeMode ? `ksyFsItem_practice_${app_layout_1.practiceChallName}` : 'ksyFsItem';
    function recompile() {
        return localforage.getItem(ksyFsItemName).then(ksyFsItem => {
            var srcYaml = app_layout_1.ui.ksyEditor.getValue();
            var changed = lastKsyContent !== srcYaml;
            var copyPromise = Promise.resolve();
            if (changed && (ksyFsItem.fsType === 'kaitai' || ksyFsItem.fsType === 'static')) {
                var newFn = ksyFsItem.fn.split('/').last().replace('.ksy', '_modified.ksy');
                copyPromise = app_files_1.fss.local.put(newFn, srcYaml).then(fsItem => {
                    ksyFsItem = fsItem;
                    return localforage.setItem(ksyFsItemName, fsItem);
                }).then(() => app_files_1.addKsyFile('localStorage', newFn, ksyFsItem));
            }
            return copyPromise.then(() => changed ? app_files_1.fss[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml) : Promise.resolve()).then(() => {
                return compile(srcYaml, 'javascript', 'both').then(compiled => {
                    if (!compiled)
                        return;
                    var fileNames = Object.keys(compiled.release);
                    console.log('ksyFsItem', ksyFsItem);
                    app_layout_1.ui.genCodeViewer.setValue(fileNames.map(x => compiled.release[x]).join(''), -1);
                    app_layout_1.ui.genCodeDebugViewer.setValue(fileNames.map(x => compiled.debug[x]).join(''), -1);
                    return reparse();
                });
            });
        });
    }
    var selectedInTree = false, blockRecursive = false;
    function reparse() {
        var jsTree = app_layout_1.ui.parsedDataTreeCont.getElement();
        jsTree.jstree("destroy");
        return Promise.all([exports.inputReady, exports.formatReady]).then(() => {
            var debugCode = app_layout_1.ui.genCodeDebugViewer.getValue();
            var jsClassName = kaitaiIde.ksySchema.meta.id.split('_').map(x => x.ucFirst()).join('');
            return app_worker_1.workerCall({ type: 'eval', args: [`ksyTypes = args.ksyTypes;\n${debugCode}\nMainClass = ${jsClassName};void(0)`, { ksyTypes: exports.ksyTypes }] });
        }).then(() => {
            //console.log('recompiled');
            app_worker_1.workerCall({ type: "reparse", args: [app_layout_1.isPracticeMode || $("#disableLazyParsing").is(':checked')] }).then((exportedRoot) => {
                //console.log('reparse exportedRoot', exportedRoot);
                exports.itree = new IntervalTree(exports.dataProvider.length / 2);
                kaitaiIde.root = exportedRoot;
                app_layout_1.ui.parsedDataTree = parsedToTree_1.parsedToTree(jsTree, exportedRoot, exports.ksyTypes, e => app_errors_1.handleError(e), () => app_layout_1.ui.hexViewer.onSelectionChanged());
                app_layout_1.ui.parsedDataTree.on('select_node.jstree', function (e, selectNodeArgs) {
                    var node = selectNodeArgs.node;
                    //console.log('node', node);
                    var exp = app_layout_1.ui.parsedDataTree.getNodeData(node).exported;
                    if (exp && exp.path)
                        $("#parsedPath").text(exp.path.join('/'));
                    if (!blockRecursive && exp && exp.start < exp.end) {
                        selectedInTree = true;
                        //console.log('setSelection', exp.ioOffset, exp.start);
                        app_layout_1.ui.hexViewer.setSelection(exp.ioOffset + exp.start, exp.ioOffset + exp.end - 1);
                        selectedInTree = false;
                    }
                });
                //if (isPracticeMode)
                //    practiceExportedChanged(exportedRoot);
            }, error => app_errors_1.handleError(error));
        });
    }
    window.kt = { workerEval: app_worker_1.workerEval };
    var lastKsyContent, inputContent, inputFsItem, lastKsyFsItem;
    function loadFsItem(fsItem, refreshGui = true) {
        if (!fsItem || fsItem.type !== 'file')
            return Promise.resolve();
        return app_files_1.fss[fsItem.fsType].get(fsItem.fn).then(content => {
            if (isKsyFile(fsItem.fn)) {
                localforage.setItem(ksyFsItemName, fsItem);
                lastKsyFsItem = fsItem;
                lastKsyContent = content;
                app_layout_1.ui.ksyEditor.setValue(content, -1);
                return Promise.resolve();
            }
            else {
                inputFsItem = fsItem;
                inputContent = content;
                if (!app_layout_1.isPracticeMode)
                    localforage.setItem('inputFsItem', fsItem);
                exports.dataProvider = {
                    length: content.byteLength,
                    get(offset, length) { return new Uint8Array(content, offset, length); },
                };
                app_layout_1.ui.hexViewer.setDataProvider(exports.dataProvider);
                return app_worker_1.workerCall({ type: 'eval', args: ['inputBuffer = args; void(0)', content] }).then(() => refreshGui ? reparse().then(() => app_layout_1.ui.hexViewer.resize()) : Promise.resolve());
            }
        });
    }
    exports.loadFsItem = loadFsItem;
    function addNewFiles(files) {
        return Promise.all(files.map(file => {
            return (isKsyFile(file.file.name) ? file.read('text') : file.read('arrayBuffer')).then(content => {
                return app_files_1.localFs.put(file.file.name, content).then(fsItem => {
                    return files.length == 1 ? loadFsItem(fsItem) : Promise.resolve(null);
                });
            });
        })).then(app_files_1.refreshFsNodes);
    }
    exports.addNewFiles = addNewFiles;
    localStorage.setItem('lastVersion', kaitaiIde.version);
    $(() => {
        $('#webIdeVersion').text(kaitaiIde.version);
        $('#compilerVersion').text(io.kaitai.struct.MainJs().version + " (" + io.kaitai.struct.MainJs().buildDate + ")");
        $('#welcomeDoNotShowAgain').click(() => localStorage.setItem('doNotShowWelcome', 'true'));
        if (localStorage.getItem('doNotShowWelcome') !== 'true')
            $('#welcomeModal').modal();
        $('#aboutWebIde').on('click', () => $('#welcomeModal').modal());
        app_layout_1.ui.hexViewer.onSelectionChanged = () => {
            //console.log('setSelection', ui.hexViewer.selectionStart, ui.hexViewer.selectionEnd);
            localStorage.setItem('selection', JSON.stringify({ start: app_layout_1.ui.hexViewer.selectionStart, end: app_layout_1.ui.hexViewer.selectionEnd }));
            var start = app_layout_1.ui.hexViewer.selectionStart, end = app_layout_1.ui.hexViewer.selectionEnd;
            var hasSelection = start !== -1;
            $('#infoPanel .selectionText').text(hasSelection ? `selection:` : 'no selection');
            app_selectionInput_1.refreshSelectionInput();
            if (exports.itree && hasSelection && !selectedInTree) {
                var intervals = exports.itree.search(app_layout_1.ui.hexViewer.mouseDownOffset || start);
                if (intervals.length > 0) {
                    //console.log('selected node', intervals[0].id);
                    blockRecursive = true;
                    app_layout_1.ui.parsedDataTree.activatePath(JSON.parse(intervals[0].id).path, () => blockRecursive = false);
                }
            }
            app_converterPanel_1.refreshConverterPanel(app_layout_1.ui.converterPanel, exports.dataProvider, start);
        };
        app_selectionInput_1.refreshSelectionInput();
        app_layout_1.ui.genCodeDebugViewer.commands.addCommand({
            name: "compile",
            bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
            exec: function (editor) { reparse(); }
        });
        if (!app_layout_1.isPracticeMode)
            FileDrop_1.initFileDrop('fileDrop', addNewFiles);
        function loadCachedFsItem(cacheKey, defFsType, defSample) {
            return localforage.getItem(cacheKey).then((fsItem) => loadFsItem(fsItem || { fsType: defFsType, fn: defSample, type: 'file' }, false));
        }
        if (app_layout_1.isPracticeMode) {
            exports.inputReady = loadFsItem({ fsType: 'kaitai', fn: app_layout_1.practiceChall.inputFn, type: 'file' });
            var startKsyFn = `practice_${app_layout_1.practiceChallName}.ksy`;
            app_files_1.staticFs.put(startKsyFn, app_layout_1.practiceChall.starterKsy.trim());
            exports.formatReady = loadCachedFsItem(ksyFsItemName, 'static', startKsyFn);
        }
        else {
            exports.inputReady = loadCachedFsItem('inputFsItem', 'kaitai', 'samples/sample1.zip');
            exports.formatReady = loadCachedFsItem(ksyFsItemName, 'kaitai', 'formats/archive/zip.ksy');
        }
        exports.inputReady.then(() => {
            var storedSelection = JSON.parse(localStorage.getItem('selection'));
            if (storedSelection)
                app_layout_1.ui.hexViewer.setSelection(storedSelection.start, storedSelection.end);
        });
        var editDelay = new Delayed(500);
        app_layout_1.ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));
        var inputContextMenu = $('#inputContextMenu');
        var downloadInput = $('#inputContextMenu .downloadItem');
        $("#hexViewer").on('contextmenu', e => {
            downloadInput.toggleClass('disabled', app_layout_1.ui.hexViewer.selectionStart === -1);
            inputContextMenu.css({ display: "block", left: e.pageX, top: e.pageY });
            return false;
        });
        function ctxAction(obj, callback) {
            obj.find('a').on('click', e => {
                if (!obj.hasClass('disabled')) {
                    inputContextMenu.hide();
                    callback(e);
                }
            });
        }
        $(document).on('mouseup', e => {
            if ($(e.target).parents('.dropdown-menu').length === 0)
                $('.dropdown').hide();
        });
        ctxAction(downloadInput, e => {
            var start = app_layout_1.ui.hexViewer.selectionStart, end = app_layout_1.ui.hexViewer.selectionEnd;
            //var fnParts = /^(.*?)(\.[^.]+)?$/.exec(inputFsItem.fn.split('/').last());
            //var newFn = `${fnParts[1]}_0x${start.toString(16)}-0x${end.toString(16)}${fnParts[2] || ""}`;
            var newFn = `${inputFsItem.fn.split('/').last()}_0x${start.toString(16)}-0x${end.toString(16)}.bin`;
            saveFile(new Uint8Array(inputContent, start, end - start + 1), newFn);
        });
        kaitaiIde.exportToJson = (useHex = false) => {
            var indentLen = 2;
            var result = "";
            function expToNative(value, padLvl = 0) {
                var pad = " ".repeat((padLvl + 0) * indentLen);
                var childPad = " ".repeat((padLvl + 1) * indentLen);
                var isArray = value.type === ObjectType.Array;
                if (value.type === ObjectType.Object || isArray) {
                    result += isArray ? "[" : "{";
                    var keys = isArray ? value.arrayItems : Object.keys(value.object.fields);
                    if (keys.length > 0) {
                        result += `\n${childPad}`;
                        keys.forEach((arrItem, i) => {
                            result += (isArray ? "" : `"${arrItem}": `);
                            expToNative(isArray ? arrItem : value.object.fields[arrItem], padLvl + 1);
                            var lineCont = isArray && arrItem.type === ObjectType.Primitive && typeof arrItem.primitiveValue !== "string" && i % 16 !== 15;
                            var last = i === keys.length - 1;
                            result += last ? "\n" : "," + (lineCont ? " " : `\n${childPad}`);
                        });
                        result += `${pad}`;
                    }
                    result += isArray ? "]" : "}";
                }
                else if (value.type === ObjectType.TypedArray) {
                    if (value.bytes.length <= 64)
                        result += "[" + Array.from(value.bytes).join(', ') + "]";
                    else {
                        result += `{ "$start": ${value.ioOffset + value.start}, "$end": ${value.ioOffset + value.end - 1} }`;
                    }
                }
                else if (value.type === ObjectType.Primitive) {
                    if (value.enumStringValue)
                        result += `{ "name": ${JSON.stringify(value.enumStringValue)}, "value": ${value.primitiveValue} }`;
                    else if (typeof value.primitiveValue === "number")
                        result += useHex ? `0x${value.primitiveValue.toString(16)}` : `${value.primitiveValue}`;
                    else
                        result += `${JSON.stringify(value.primitiveValue)}`;
                }
            }
            function getParsedIntervals(root) {
                var objects = collectAllObjects(root).slice(1);
                //console.log('objects', objects);
                var allInts = objects.map(x => ({ start: x.ioOffset + x.start, end: x.ioOffset + x.end - 1 })).filter(x => !isNaN(x.start) && !isNaN(x.end)).sort((a, b) => a.start - b.start);
                //console.log('allInts', allInts);
                var intervals = [];
                intervals.push(allInts[0]);
                for (var i = 1; i < allInts.length; i++) {
                    if (intervals.last().end < allInts[i].start)
                        intervals.push(allInts[i]);
                    else
                        intervals.last().end = Math.max(intervals.last().end, allInts[i].end);
                }
                return intervals;
            }
            app_worker_1.workerCall({ type: 'reparse', args: [true] }).then((exportedRoot) => {
                console.log('exported', exportedRoot);
                expToNative(exportedRoot);
                app_layout_1.addEditorTab('json export', result, 'json');
            }, error => app_errors_1.handleError(error));
        };
        $("#exportToJson, #exportToJsonHex").on('click', e => kaitaiIde.exportToJson(e.target.id === "exportToJsonHex"));
        $("#disableLazyParsing").on('click', reparse);
        app_layout_1.ui.unparsedIntSel = new IntervalViewer("unparsed");
        app_layout_1.ui.bytesIntSel = new IntervalViewer("bytes");
    });
});
//# sourceMappingURL=app.js.map