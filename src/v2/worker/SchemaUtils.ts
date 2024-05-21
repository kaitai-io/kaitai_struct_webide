import { IKsyTypes } from "./WorkerShared";

function ucFirst(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }

export class SchemaUtils {
    static ksyNameToJsName(ksyName: string, isProp: boolean) {
        return ksyName.split("_").map((x, i) => i === 0 && isProp ? x : ucFirst(x)).join("");
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
        var types: IKsyTypes = {};
        SchemaUtils.collectTypes(types, schema);

        var typeName = SchemaUtils.ksyNameToJsName(schema.meta.id, false);
        types[typeName] = schema;

        return types;
    }
}