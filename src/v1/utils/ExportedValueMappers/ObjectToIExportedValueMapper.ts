import {IExportedValue, IInstance, ObjectType} from "../../../entities";
import {IKsyTypes} from "../../Workers/CodeExecution/Types";

interface IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    validationError?: Error;
    incomplete: boolean;
    arr?: IDebugInfo[];
    enumName?: string;
}

export interface IParsingOptions {
    eagerMode: boolean;
    incomplete: boolean;
    ksyTypes: IKsyTypes;
    enums: any;
    streamLength: number;
}

function getObjectType(obj: any) {
    if (obj instanceof Uint8Array)
        return ObjectType.TypedArray;
    else if (obj === null || typeof obj !== "object")
        return isUndef(obj) ? ObjectType.Undefined : ObjectType.Primitive;
    else if (Array.isArray(obj))
        return ObjectType.Array;
    else
        return ObjectType.Object;
}

function isUndef(obj: any) {
    return typeof obj === "undefined";
}

export const fetchInstance = (obj: any, propName: string, objPath: string[], noLazy: boolean): IExportedValue => {
    let value;
    let instanceError: Error;
    try {
        value = obj[propName];
    } catch (e) {
        instanceError = e;
    }
    if (instanceError !== undefined) {
        try {
            // retry once (important for validation errors)
            value = obj[propName];
        } catch (e) {
        }
    }

    const instHasRawAttr = Object.prototype.hasOwnProperty.call(obj, `_raw__m_${propName}`);
    const debugInfo = <IDebugInfo>obj._debug[`_m_${propName}`];
    const exported = exportValue(value, debugInfo, instHasRawAttr, objPath.concat(propName), noLazy);
    if (instanceError !== undefined) {
        exported.instanceError = instanceError;
    }
    return exported;
};


function inferDebugEnd(debugs: IDebugInfo[]): number {
    const inferredEnd = debugs
        .reduce((acc, debug) => debug && debug.end > acc ? debug.end : acc, Number.NEGATIVE_INFINITY);
    if (inferredEnd === Number.NEGATIVE_INFINITY) {
        return;
    }
    return inferredEnd;
}

const exportValue = (obj: any, debug: IDebugInfo, hasRawAttr: boolean, path: string[], noLazy: boolean, ksyTypes: IKsyTypes, enums: any): IExportedValue => {
    adjustDebug(debug);
    const result: IExportedValue = {
        start: debug && debug.start,
        end: debug && debug.end,
        incomplete: debug && debug.incomplete,
        validationError: (debug && debug.validationError) || undefined,
        ioOffset: debug && debug.ioOffset,
        path: path,
        type: getObjectType(obj)
    };

    if (result.type === ObjectType.TypedArray)
        result.bytes = obj;
    else if (result.type === ObjectType.Primitive || result.type === ObjectType.Undefined) {
        result.primitiveValue = obj;
        if (debug && debug.enumName) {
            result.enumName = debug.enumName;
            let enumObj = {...enums};
            const enumPath = debug.enumName.split(".");
            enumPath.forEach(pathPart => enumObj = enumObj[pathPart]);

            let flagCheck = 0, flagSuccess = true;
            const flagStr = Object.keys(enumObj).filter(x => isNaN(<any>x)).filter(x => {
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
    } else if (result.type === ObjectType.Array) {
        result.arrayItems = (<any[]>obj).map((item, i) => exportValue(item, debug && debug.arr && debug.arr[i], hasRawAttr, path.concat(i.toString()), noLazy, ksyTypes, enums));
        if (result.incomplete && debug && debug.arr) {
            debug.end = inferDebugEnd(debug.arr);
            result.end = debug.end;
        }
    } else if (result.type === ObjectType.Object) {
        const hasSubstream = hasRawAttr && obj._io;
        if (result.incomplete && hasSubstream) {
            debug.end = debug.start + obj._io.size;
            result.end = debug.end;
        }
        result.object = {class: obj.constructor.name, instances: {}, fields: {}};
        const ksyType = ksyTypes[result.object.class];

        const fieldNames = new Set<string>(Object.keys(obj));
        if (obj._debug) {
            Object.keys(obj._debug).forEach(k => fieldNames.add(k));
        }
        const fieldNamesArr = Array.from(fieldNames).filter(x => x[0] !== "_");
        fieldNamesArr
            .forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug && obj._debug[key], fieldNames.has(`_raw_${key}`), path.concat(key), noLazy, ksyTypes, enums));

        if (result.incomplete && !hasSubstream && obj._debug) {
            debug.end = inferDebugEnd(fieldNamesArr.map(key => <IDebugInfo>obj._debug[key]));
            result.end = debug.end;
        }

        const propNames = obj.constructor !== Object ?
            Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== "_" && x !== "constructor") : [];

        for (const propName of propNames) {
            const ksyInstanceData = ksyType && ksyType.instancesByJsName[propName] || {};
            const parseMode = ksyInstanceData["-webide-parse-mode"];
            const eagerLoad = parseMode === "eager" || (parseMode !== "lazy" && ksyInstanceData.value);

            if (Object.prototype.hasOwnProperty.call(obj, `_m_${propName}`) || eagerLoad || noLazy)
                result.object.fields[propName] = fetchInstance(obj, propName, path, noLazy);
            else
                result.object.instances[propName] = <IInstance>{path: path.concat(propName), offset: 0};
        }
    } else
        console.log(`Unknown object type: ${result.type}`);

    return result;
};

function adjustDebug(debug: IDebugInfo): void {
    if (!debug || Object.prototype.hasOwnProperty.call(debug, "incomplete")) {
        return;
    }
    debug.incomplete = (debug.start != null && debug.end == null);
}

export const mapObjectToExportedValue = (obj: any, options: IParsingOptions): IExportedValue => {
    const {eagerMode, ksyTypes, enums, streamLength, incomplete} = options;
    const debug = {
        start: 0,
        end: streamLength,
        ioOffset: 0,
        incomplete: incomplete
    };
    return exportValue(obj, debug, false, [], eagerMode, ksyTypes, enums);
};