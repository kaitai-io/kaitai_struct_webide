import {YamlParser} from "./YamlParser";
import {JsImporterError} from "./JsImporterError";
import {FileLocationInfo} from "../../Stores/AppStore";
import {useFileSystems} from "../../Components/FileTree/Store/FileSystemsStore";

export interface IYamlImporter {
    importYaml(importFilePath: string, mode: string): Promise<KsySchema.IKsyFile>;

    getFilesLoadedUsingImporter(): YamlFileInfo[];
}

export interface YamlFileInfo {
    storeId: string;
    filePath: string;
    fileContent: string;
}

interface FileCache {
    [name: string]: YamlFileInfo;
}

export class JsImporter implements IYamlImporter {
    private importedFilesCache: FileCache = {};

    constructor(private initialYaml: YamlFileInfo) {
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Used by KaitaiStructCompiler.compile()
     */
    async importYaml(importFilePath: string, mode: string) {
        const fileLocation = this.deductFileLocation(importFilePath, mode);
        try {
            const yamlFile = await this.getFileByLocationWithCache(fileLocation);
            return YamlParser.parseIKsyFile(yamlFile);
        } catch (e) {
            const sourceAppendix = mode === "abs" ? "kaitai.io" : "local storage";
            const errorMessage = `failed to import spec ${fileLocation.filePath} from ${sourceAppendix}${e.message ? ": " + e.message : ""}`;
            throw new JsImporterError(errorMessage);
        }
    }

    getFilesLoadedUsingImporter(): YamlFileInfo[] {
        return Object.values(this.importedFilesCache);
    }

    private deductFileLocation(importFilePath: string, mode: string): FileLocationInfo {
        let loadFn;
        let storeId = this.initialYaml.storeId;
        if (mode === "abs") {
            loadFn = "formats/" + importFilePath;
            storeId = "kaitai";
        } else {
            var fnParts = this.initialYaml.filePath.split("/");
            fnParts.pop();
            loadFn = fnParts.join("/") + "/" + importFilePath;

            if (loadFn.startsWith("/")) {
                loadFn = loadFn.substring(1);
            }
        }

        return {
            storeId: storeId,
            filePath: `${loadFn}.ksy`
        };
    }

    private async getFileByLocationWithCache(fileLocation: FileLocationInfo): Promise<YamlFileInfo> {
        const uniqueKey = `${fileLocation.storeId}:${fileLocation.filePath}`;
        if (this.importedFilesCache.hasOwnProperty(uniqueKey)) return this.importedFilesCache[uniqueKey];

        const newYamlFile = await this.loadYamlWithFileManager(fileLocation);
        this.importedFilesCache[uniqueKey] = newYamlFile;
        return newYamlFile;

    }

    private async loadYamlWithFileManager({storeId, filePath}: FileLocationInfo): Promise<YamlFileInfo> {
        const ksyContent = await useFileSystems().getFile(storeId, filePath) as string;
        return {
            storeId: storeId,
            filePath: filePath,
            fileContent: ksyContent
        };
    }
}