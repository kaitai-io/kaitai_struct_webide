import { IKsyTypes, ObjectType, IExportedValue, IInstance, IReprPart } from "./WorkerShared";

interface IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    arr?: IDebugInfo[];
    enumName?: string;
}

export class ObjectExporter {
    noLazy = false;
    arrayLenLimit = 100;
    ksyTypes: IKsyTypes = {};

    constructor(public classes: { [name: string]: any }) { }

    addKsyTypes(ksyTypes: IKsyTypes) {
        for (const typeName of Object.keys(ksyTypes))
            this.ksyTypes[typeName] = ksyTypes[typeName];
    }

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

    exportArray(parent: any, arrayPropName: string, arrayPath: string[], from: number, to: number) {
        const array = <any[]> parent[arrayPropName];
        const debug = parent._debug[arrayPropName];

        let result = [];
        for (let i = from; i <= to; i++)
            result[i - from] = this.exportValue(array[i], debug && debug.arr[i], arrayPath.concat(i.toString()));
        return result;
    }

    exportProperty(obj: any, propName: string, objPath: string[]) {
        let propertyValue = undefined;
        let propertyException = null;
        try {
            propertyValue = obj[propName];
        } catch(e) {
            propertyException = e;
            try {
                propertyValue = obj[propName];
            } catch (e2) { /* same as previous or does not happen */ }
        }

        const exportedProperty = this.exportValue(propertyValue, obj._debug["_m_" + propName], objPath.concat(propName));
        exportedProperty.exception = propertyException;
        return exportedProperty;
    }

    asciiEncode(bytes: Uint8Array) {
        var len = bytes.byteLength;
        var binary = "";
        for (var i = 0; i < len; i++)
            binary += String.fromCharCode(bytes[i]);
        return binary;
    }

    hexEncode(bytes: Uint8Array) {
        var len = bytes.byteLength;
        var binary = "0x";
        for (var i = 0; i < len; i++)
            binary += bytes[i].toString(16);
        return binary;
    }

    getWebIdeRepr(exp: IExportedValue): IReprPart[] {
        if (exp.type !== ObjectType.Object) return [];

        var ksyType = this.ksyTypes[exp.object.class];
        var repr = ksyType && ksyType["-webide-representation"];
        if (!repr) return [];

        function ksyNameToJsName(ksyName: string) { return ksyName.split("_").map((x, i) => (i === 0 ? x : x.ucFirst())).join(""); }

        return ArrayHelper.flatten(repr.split(/\{(.*?)\}/).map((value, idx) => {
            if (idx % 2 === 0) {
                return [<IReprPart> { type: "text", value }];
            } else {
                var currItem = exp;
                var parts = value.split(":");

                var format: { sep:string, str?:string, hex?:string, dec?:string } = { sep: ", " };
                if (parts.length > 1)
                    parts[1].split(",").map(x => x.split("=")).forEach(kv => format[kv[0]] = kv.length > 1 ? kv[1] : true);
                parts[0].split(".").forEach(k => {
                    if (!currItem || !currItem.object)
                        currItem = null;
                    else {
                        var child = k === "_parent" ? currItem.parent : currItem.object.fields[ksyNameToJsName(k)];
                        // TODO: add warning
                        //if (!child)
                        //    console.log("[webrepr] child not found in object", currItem, k);
                        currItem = child;
                    }
                });

                const result = <IReprPart> { type: "value" };
                let resArr = [result];
                if (!currItem)
                    result.value = "";
                else if (currItem.type === ObjectType.Object)
                    resArr = this.getWebIdeRepr(currItem);
                else if (format.str && currItem.type === ObjectType.TypedArray)
                    result.value = this.asciiEncode(currItem.bytes);
                else if (format.hex && currItem.type === ObjectType.TypedArray)
                    result.value = this.hexEncode(currItem.bytes);
                else if (currItem.type === ObjectType.Primitive && Number.isInteger(currItem.primitiveValue))
                    result.value = format.dec ? `${currItem.primitiveValue}` : currItem.enumStringValue || `0x${currItem.primitiveValue.toString(16)}`;
                else if (currItem.type === ObjectType.Array) {
                    const sepObj = <IReprPart> { type: "text", value: format.sep };
                    resArr = [sepObj];
                    for (const item of currItem.arrayItems)
                        resArr.push(...this.getWebIdeRepr(item), sepObj);
                }
                else
                    result.value = (currItem.primitiveValue || "").toString();

                return resArr;
            }
        }));
    }

    exportValue(obj: any, debug: IDebugInfo, path: string[]): IExportedValue {
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
            const array = <any[]>obj;
            result.arrayLength = array.length;
            result.isLazyArray = this.arrayLenLimit && array.length > this.arrayLenLimit;
            if (!result.isLazyArray)
                result.arrayItems = array.map((item, i) => this.exportValue(item, debug && debug.arr[i], path.concat(i.toString())));
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
                result.object.fields[key] = this.exportValue(obj[key], obj._debug[key], path.concat(key));

            Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== "_" && x !== "constructor").forEach(propName => {
                var ksyInstanceData = ksyType && ksyType.instancesByJsName[propName];
                var eagerLoad = ksyInstanceData && ksyInstanceData["-webide-parse-mode"] === "eager";

                if (eagerLoad || this.noLazy) {
                    const exportedProperty = this.exportProperty(obj, propName, path);
                    result.object.fields[propName] = exportedProperty;
                }
                else
                    result.object.instances[propName] = <IInstance>{ path: path.concat(propName), offset: 0 };
            });
        }
        else
            console.log(`Unknown object type: ${result.type}`);

        try {
            result.representation = this.getWebIdeRepr(result);
        } catch(e) {
            result.exception = result.exception || e.toString();
        }

        return result;
    }
}
