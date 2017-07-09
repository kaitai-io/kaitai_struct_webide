declare var currentScriptSrc: string;
var exports = {};
var global = this;

function require(name: string) {
    var npmDir = "../../../lib/_npm";
    var paths = {
        "yamljs": `${npmDir}/yamljs/yaml`,
        "KaitaiStream": `${npmDir}/kaitai-struct/KaitaiStream`
    };

    var relPath: string;
    if (paths[name])
        relPath = paths[name];
    else if (name.startsWith("./"))
        relPath = name;
    else if (name.indexOf("/") === -1)
        relPath = `${npmDir}/${name}/${name}`;
    else
        relPath = `${npmDir}/${name}`;

    exports = {};
    global.window = exports;
    global.module = { exports: exports };
    importScripts(new URL(`${relPath}.js`, currentScriptSrc).href);
    //console.log("require", name, global.module.exports);
    return global.module.exports;
}
