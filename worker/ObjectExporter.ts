import { IKsyTypes, ObjectType, IExportedValue, IInstance } from "./WorkerShared";

interface IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    arr?: IDebugInfo[];
    enumName?: string;
}

export class ObjectExporter {
    constructor(public ksyTypes: IKsyTypes, public classes: { [name: string]: any }) { }

    static isUndef(obj: any) { return typeof obj === "undefined"; }

    static getObjectType(obj: any) {
        if (obj instanceof Uint8Array)
            return ObjectType.TypedArray;
        else if (obj === null || typeof obj !== "object")
            return ObjectExporter.isUndef(obj) ? ObjectType.Undefined : ObjectType.Primitive;
        else if (Array.isArray(obj))
            return ObjectType.Array;
        else
            return ObjectType.Object;
    }

    exportValue(obj: any, debug: IDebugInfo, path: string[], noLazy?: boolean): IExportedValue {
        var result = <IExportedValue>{
            start: debug && debug.start,
            end: debug && debug.end,
            ioOffset: debug && debug.ioOffset,
            path: path,
            type: ObjectExporter.getObjectType(obj)
        };

        if (result.type === ObjectType.TypedArray)
            result.bytes = obj;
        else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined) {
            result.primitiveValue = obj;
            if (debug && debug.enumName) {
                result.enumName = debug.enumName;
                var enumObj = this.classes;
                debug.enumName.split(".").forEach(p => enumObj = enumObj[p]);

                var flagCheck = 0, flagSuccess = true;
                var flagStr = Object.keys(enumObj).filter(x => isNaN(<any>x)).filter(x => {
                    if (flagCheck & enumObj[x]) {
                        flagSuccess = false;
                        return false;
                    }

                    flagCheck |= enumObj[x];
                    return obj & enumObj[x];
                }).join("|");

                //console.log(debug.enumName, enumObj, enumObj[obj], flagSuccess, flagStr);
                result.enumStringValue = enumObj[obj] || (flagSuccess && flagStr);
            }
        }
        else if (result.type === ObjectType.Array) {
            result.arrayItems = (<any[]>obj).map((item, i) => this.exportValue(item, debug && debug.arr[i], path.concat(i.toString()), noLazy));
        }
        else if (result.type === ObjectType.Object) {
            var childIoOffset = obj._io._byteOffset;

            if (result.start === childIoOffset) { // new KaitaiStream was used, fix start position
                result.ioOffset = childIoOffset;
                result.start -= childIoOffset;
                result.end -= childIoOffset;
            }

            result.object = { class: obj.constructor.name, instances: {}, fields: {} };
            var ksyType = this.ksyTypes[result.object.class];

            for(var key of Object.keys(obj).filter(x => x[0] !== "_"))
                result.object.fields[key] = this.exportValue(obj[key], obj._debug[key], path.concat(key), noLazy);

            Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== "_" && x !== "constructor").forEach(propName => {
                var ksyInstanceData = ksyType && ksyType.instancesByJsName[propName];
                var eagerLoad = ksyInstanceData && ksyInstanceData["-webide-parse-mode"] === "eager";

                if (eagerLoad || noLazy)
                    result.object.fields[propName] = this.exportValue(obj[propName], obj._debug["_m_" + propName], path.concat(propName), noLazy);
                else
                    result.object.instances[propName] = <IInstance>{ path: path.concat(propName), offset: 0 };
            });
        }
        else
            console.log(`Unknown object type: ${result.type}`);

        return result;
    }
}
