import {StringUtils} from "../Misc/StringUtils";
import {IKsyTypes} from "../../Workers/CodeExecution/Types";

export class SchemaUtils {
    static ksyNameToJsName(ksyName: string, isProp: boolean) {
        return ksyName.split("_")
            .map((x, i) => i === 0 && isProp ? x : StringUtils.ucFirst(x)).join("");
    }

    static collectTypes(types: IKsyTypes, parent: KsySchema.IType) {
        if (parent.types) {
            parent.typesByJsName = {};
            Object.keys(parent.types).forEach(name => {
                var jsName = SchemaUtils.ksyNameToJsName(name, false);
                parent.typesByJsName[jsName] = types[jsName] = parent.types[name];
                SchemaUtils.collectTypes(types, parent.types[name]);
            });
        }

        if (parent.instances) {
            parent.instancesByJsName = {};
            Object.keys(parent.instances).forEach(name => {
                var jsName = SchemaUtils.ksyNameToJsName(name, true);
                parent.instancesByJsName[jsName] = parent.instances[name];
            });
        }
    }

    static collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
        // Function was modifying input and the reason was:
        // we have to modify the schema (add typesByJsName for example) before sending into the compiler, so we need a copy
        const schemaTemp = {...schema};
        var types: IKsyTypes = {};
        SchemaUtils.collectTypes(types, schemaTemp);

        var typeName = SchemaUtils.ksyNameToJsName(schemaTemp.meta.id, false);
        types[typeName] = schemaTemp;

        return types;
    }
}