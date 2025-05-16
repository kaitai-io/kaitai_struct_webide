import {YamlParser} from "./YamlParser";
import {JsImporterError} from "./JsImporterError";
import {useFileSystems} from "../../Components/FileTree/Store/FileSystemsStore";
import {FileSystemPath} from "../../Components/FileTree/FileSystemsTypes";
import {KsySchema} from "../KsySchemaTypes";
import {FILE_SYSTEM_TYPE_LOCAL} from "../../Components/FileTree/FileSystems/LocalStorageFileSystem";
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

interface FileImportResultSuccess {
    success: true;
    data: YamlFileInfo;
}

interface FileImportResultError {
    success: false;
}

type FileImportResult = FileImportResultSuccess | FileImportResultError

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
        const filePath = this.deductFileLocation(importFilePath, mode);
        const localStorageYamlFile = await this.getFileByLocationWithCache(FileSystemPath.of(FILE_SYSTEM_TYPE_LOCAL, filePath));
        if (localStorageYamlFile.success) {
            return this.tryToParseYamlResult(localStorageYamlFile);
        }
        const kaitaiStorageYamlFile = await this.getFileByLocationWithCache(FileSystemPath.of(FILE_SYSTEM_TYPE_KAITAI, `formats/${filePath}`));
        if (kaitaiStorageYamlFile.success) {
            return this.tryToParseYamlResult(kaitaiStorageYamlFile);
        }
        throw new JsImporterError(`File not found ${filePath}`);
    }

    getFilesLoadedUsingImporter(): YamlFileInfo[] {
        return Object.values(this.importedFilesCache);
    }

    private deductFileLocation(importFilePath: string, mode: string): string {
        let filePath: string;
        if (mode === "abs") {
            filePath = importFilePath;
        } else {
            const fnParts = this.initialYaml.filePath.split("/");
            fnParts.pop();
            filePath = fnParts.join("/") + "/" + importFilePath;

            if (filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
        }
        return `${filePath}.ksy`;
    }

    private tryToParseYamlResult(fileImportResult: FileImportResultSuccess): KsySchema.IKsyFile {
        const result = YamlParser.parseIKsyFile(fileImportResult.data);
        if (typeof result !== "object") {
            throw new JsImporterError(`There was problem parsing YAML imported file: ${fileImportResult.data.fileContent}`);
        }
        return result;
    }


    private async getFileByLocationWithCache(fileLocation: FileSystemPath): Promise<FileImportResult> {
        const uniqueKey = fileLocation.toString();
        if (this.importedFilesCache.hasOwnProperty(uniqueKey)) return {
            success: true,
            data: this.importedFilesCache[uniqueKey]
        };

        const newYamlFile = await this.loadYamlWithFileManager(fileLocation);
        const fileNotFound = !newYamlFile;

        if (fileNotFound) {
            return {
                success: false,
            };
        }


        this.importedFilesCache[uniqueKey] = newYamlFile;
        return {
            success: true,
            data: newYamlFile
        };

    }

    private async loadYamlWithFileManager({storeId, path}: FileSystemPath): Promise<YamlFileInfo> {
        try {
            const ksyContent = await useFileSystems().getFile(storeId, path) as string;
            return {
                storeId: storeId,
                filePath: path,
                fileContent: ksyContent
            };
        } catch (e) {
            return undefined;
        }
    }
}