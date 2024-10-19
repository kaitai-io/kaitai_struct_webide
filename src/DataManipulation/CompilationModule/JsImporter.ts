import {YamlParser} from "./YamlParser";
import {JsImporterError} from "./JsImporterError";
import {useFileSystems} from "../../Components/FileTree/Store/FileSystemsStore";
import {FileSystemPath} from "../../Components/FileTree/FileSystemsTypes";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../Components/FileTree/FileSystems/KaitaiFileSystem";

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
            const errorMessage = `failed to import spec ${fileLocation.path} from ${sourceAppendix}${e.message ? ": " + e.message : ""}`;
            throw new JsImporterError(errorMessage);
        }
    }

    getFilesLoadedUsingImporter(): YamlFileInfo[] {
        return Object.values(this.importedFilesCache);
    }

    private deductFileLocation(importFilePath: string, mode: string): FileSystemPath {
        let fileName;
        let storeId = this.initialYaml.storeId;
        if (mode === "abs") {
            fileName = "formats/" + importFilePath;
            storeId = FILE_SYSTEM_TYPE_KAITAI;
        } else {
            const fnParts = this.initialYaml.filePath.split("/");
            fnParts.pop();
            fileName = fnParts.join("/") + "/" + importFilePath;

            if (fileName.startsWith("/")) {
                fileName = fileName.substring(1);
            }
        }

        return FileSystemPath.of(storeId, `${fileName}.ksy`)
    }

    private async getFileByLocationWithCache(fileLocation: FileSystemPath): Promise<YamlFileInfo> {
        const uniqueKey = `${fileLocation.storeId}:${fileLocation.path}`;
        if (this.importedFilesCache.hasOwnProperty(uniqueKey)) return this.importedFilesCache[uniqueKey];

        const newYamlFile = await this.loadYamlWithFileManager(fileLocation);
        this.importedFilesCache[uniqueKey] = newYamlFile;
        return newYamlFile;

    }

    private async loadYamlWithFileManager({storeId, path}: FileSystemPath): Promise<YamlFileInfo> {
        const ksyContent = await useFileSystems().getFile(storeId, path) as string;
        return {
            storeId: storeId,
            filePath: path,
            fileContent: ksyContent
        };
    }
}