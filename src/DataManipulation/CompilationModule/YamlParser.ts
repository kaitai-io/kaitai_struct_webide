import {YamlFileInfo} from "./JsImporter";
import {load, CORE_SCHEMA, LoadOptions} from "js-yaml";

export class YamlParser {
    public static parseIKsyFile(yamlInfo: YamlFileInfo): KsySchema.IKsyFile {
        const options: LoadOptions = {
            schema: CORE_SCHEMA,
            filename: yamlInfo.filePath,
        };
        return load(yamlInfo.fileContent, options) as KsySchema.IKsyFile;
    }
}