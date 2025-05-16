import {StringUtils} from "../../Utils/StringUtils";
import {IKsyTypes} from "../ParsingModule/CodeExecution/Types";
import {YamlFileInfo} from "./JsImporter";
import {YamlParser} from "./YamlParser";
import {KsySchema} from "../KsySchemaTypes";

export class SchemaUtils {
    static prepareSchemaAndCombinedKsyTypes(initialYamlInfo: YamlFileInfo, yamls: YamlFileInfo[]) {
        const {schema, types} = SchemaUtils.getTypesAndSchemaFromSingleFile(initialYamlInfo);

        const allTypesCombined = yamls.reduce((combinedTypes, currentYaml) => {
            const typesAndSchema = SchemaUtils.getTypesAndSchemaFromSingleFile(currentYaml);
            Object.assign(combinedTypes, typesAndSchema.types);
            return combinedTypes;
        }, types);

        return {schema: schema, types: allTypesCombined};
    }

    static getTypesAndSchemaFromSingleFile(importedYaml: YamlFileInfo) {
        const ksySchema = YamlParser.parseIKsyFile(importedYaml);
        return {
            schema: ksySchema,
            types: SchemaUtils.collectKsyTypes(ksySchema)
        };
    }

    static ksyNameToJsName(ksyName: string, isProp: boolean) {
        return ksyName.split("_")
            .map((x, i) => i === 0 && isProp ? x : StringUtils.ucFirst(x)).join("");
    }

    static collectTypes(types: IKsyTypes, parent: KsySchema.IType) {
        if (parent.types) {
            parent.typesByJsName = {};
            Object.keys(parent.types).forEach(name => {
                const jsName = SchemaUtils.ksyNameToJsName(name, false);
                parent.typesByJsName[jsName] = types[jsName] = parent.types[name];
                SchemaUtils.collectTypes(types, parent.types[name]);
            });
        }

        if (parent.instances) {
            parent.instancesByJsName = {};
            Object.keys(parent.instances).forEach(name => {
                const jsName = SchemaUtils.ksyNameToJsName(name, true);
                parent.instancesByJsName[jsName] = parent.instances[name];
            });
        }
    }

    static collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
        const types: IKsyTypes = {};
        SchemaUtils.collectTypes(types, schema);

        const typeName = SchemaUtils.ksyNameToJsName(schema.meta.id, false);
        types[typeName] = schema;
        return types;
    }

}