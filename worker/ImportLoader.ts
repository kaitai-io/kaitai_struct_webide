declare var currentScriptSrc: string;
var exports = {};
var global = this;

function require(name: string) {
    var paths = {
        "yamljs": "../../lib/_npm/yamljs/yaml",
        "KaitaiStream": "../../lib/_npm/kaitai-struct/KaitaiStream"
    };

    var relPath: string;
    if (paths[name])
        relPath = paths[name];
    else if (name.startsWith("./"))
        relPath = name;
    else if (name.indexOf("/") === -1)
        relPath = `../../lib/_npm/${name}/${name}`;
    else
        relPath = `../../lib/_npm/${name}`;

    exports = {};
    global.window = exports;
    global.module = { exports: exports };
    importScripts(new URL(`${relPath}.js`, currentScriptSrc).href);
    console.log("require", name, global.module.exports);
    return global.module.exports;
}
