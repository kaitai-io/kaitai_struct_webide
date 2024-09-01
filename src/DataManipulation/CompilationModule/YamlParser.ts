import * as jsyaml from "js-yaml";
import {YamlFileInfo} from "./JsImporter";

export class YamlParser {
    public static parseIKsyFile(yamlInfo: YamlFileInfo): KsySchema.IKsyFile {
        const options = {
            schema: jsyaml.CORE_SCHEMA,
            filename: yamlInfo.filePath,
        };
        return jsyaml.load(yamlInfo.fileContent, options);
    }
}