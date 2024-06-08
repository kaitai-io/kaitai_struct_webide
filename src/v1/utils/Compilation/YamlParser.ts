import * as jsyaml from "js-yaml";

export class YamlParser {
    public static parseIKsyFile(yamlContents: string, filename: string): KsySchema.IKsyFile {
        const options = {
            schema: jsyaml.CORE_SCHEMA,
            filename: filename,
        };
        return jsyaml.load(yamlContents, options);
    }
}