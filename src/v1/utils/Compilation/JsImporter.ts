import {IFsItem} from "../../FileSystems/FileSystemsTypes";
import {fileSystemsManager} from "../../FileSystems/FileSystemManager";
import {SchemaUtils} from "./SchemaUtils";
import {YamlParser} from "./YamlParser";
import {JsImporterError} from "./JsImporterError";

export class JsImporter implements IYamlImporter {
    constructor(private rootFsItem: IFsItem, private ksyTypes: IKsyTypes) {
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Used by KaitaiStructCompiler.compile()
     */
    async importYaml(name: string, mode: string) {
        var loadFn;
        var importedFsType = this.rootFsItem.fsType;
        if (mode === "abs") {
            loadFn = "formats/" + name;
            importedFsType = "kaitai";
        } else {
            var fnParts = this.rootFsItem.fn.split("/");
            fnParts.pop();
            loadFn = fnParts.join("/") + "/" + name;

            if (loadFn.startsWith("/")) {
                loadFn = loadFn.substr(1);
            }
        }

        console.log(`import yaml: ${name}, mode: ${mode}, loadFn: ${loadFn}, root:`, this.rootFsItem);
        const fn = `${loadFn}.ksy`;
        const sourceAppendix = mode === "abs" ? "kaitai.io" : "local storage";
        let ksyContent;
        try {
            ksyContent = await fileSystemsManager[importedFsType].get(fn);
        } catch (e) {
            const errorMessage = `failed to import spec ${fn} from ${sourceAppendix}${e.message ? ": " + e.message : ""}`;
            throw new JsImporterError(errorMessage);
        }
        const ksyModel = YamlParser.parseIKsyFile(<string>ksyContent, fn);
        Object.assign(this.ksyTypes, SchemaUtils.collectKsyTypes(ksyModel));

        // we have to modify the schema (add typesByJsName for example) before sending into the compiler, so we need a copy
        const compilerSchema = YamlParser.parseIKsyFile(<string>ksyContent, fn);
        return compilerSchema;
    }
}