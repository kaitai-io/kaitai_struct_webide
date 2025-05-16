import {IExportedValue, ObjectType} from "../ExportedValueTypes";
import {EvaluatedClass} from "../ParsingModule/CodeExecution/Types";
import {EvaluatedCodeScope} from "../ParsingModule/CodeExecution/EvaluatedCodeScope";

export interface IDebugInfo {
    start: number;
    end: number;
    ioOffset: number;
    validationError?: Error;
    incomplete: boolean;
    arr?: IDebugInfo[];
    enumName?: string;
}

export interface IParsingOptions {
    scope: EvaluatedCodeScope;
    eagerMode: boolean;
    incomplete: boolean;
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

export const fetchInstance = (obj: any, propName: string, objPath: string[], noLazy: boolean, scope: EvaluatedCodeScope): IExportedValue => {
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
    const exported = exportValue(value, debugInfo, instHasRawAttr, objPath.concat(propName), noLazy, scope);
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

const exportValue = (obj: any, debug: IDebugInfo, hasRawAttr: boolean, path: string[], noLazy: boolean, scope: EvaluatedCodeScope): IExportedValue => {
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
            result.enumStringValue = scope.getMatchingEnumStringValuesByPath(obj, debug.enumName).join("|");
        }
    } else if (result.type === ObjectType.Array) {
        if (debug && debug.arr) {
            result.arrayItems = debug.arr.map((itemDebug, i) => exportValue(obj[i], itemDebug, hasRawAttr, path.concat(i.toString()), noLazy, scope));
            if (result.incomplete) {
                debug.end = inferDebugEnd(debug.arr);
                result.end = debug.end;
            }
        } else {
            result.arrayItems = (<any[]>obj).map((item, i) => exportValue(item, undefined, hasRawAttr, path.concat(i.toString()), noLazy, scope));
        }
    } else if (result.type === ObjectType.Object) {
        const hasSubstream = hasRawAttr && obj._io;
        if (result.incomplete && hasSubstream) {
            debug.end = debug.start + obj._io.size;
            result.end = debug.end;
        }
        result.object = {class: obj.constructor.name, fields: {}};
        const ksyType = scope.getKsyTypeByClass(result.object.class);

        const fieldNames = new Set<string>(Object.keys(obj));
        if (obj._debug) {
            Object.keys(obj._debug).forEach(k => fieldNames.add(k));
        }
        const fieldNamesArr = Array.from(fieldNames).filter(x => x[0] !== "_");
        fieldNamesArr
            .forEach(key => result.object.fields[key] = exportValue(obj[key], obj._debug && obj._debug[key], fieldNames.has(`_raw_${key}`), path.concat(key), noLazy, scope));

        if (result.incomplete && !hasSubstream && obj._debug) {
            debug.end = inferDebugEnd(fieldNamesArr.map(key => <IDebugInfo>obj._debug[key]));
            result.end = debug.end;
        }

        const instanceNames = obj.constructor !== Object
            ? Object.getOwnPropertyNames(obj.constructor.prototype).filter(x => x[0] !== "_" && x !== "constructor")
            : [];

        for (const instanceName of instanceNames) {
            const ksyInstanceData = ksyType && ksyType.instancesByJsName[instanceName] || {};
            const parseMode = ksyInstanceData["-webide-parse-mode"];
            const eagerLoad = parseMode === "eager" || (parseMode !== "lazy" && ksyInstanceData.value);

            if (Object.prototype.hasOwnProperty.call(obj, `_m_${instanceName}`) || eagerLoad || noLazy) {
                result.object.fields[instanceName] = fetchInstance(obj, instanceName, path, noLazy, scope);
            } else
                result.object.fields[instanceName] = {
                    start: undefined,
                    end: undefined,
                    ioOffset: undefined,
                    incomplete: false,
                    type: ObjectType.LazyInstance,
                    path: path.concat(instanceName)
                };
        }
    } else {
        console.log(`Unknown object type: ${result.type}`);
    }

    return result;
};

function adjustDebug(debug: IDebugInfo): void {
    if (!debug || Object.prototype.hasOwnProperty.call(debug, "incomplete")) {
        return;
    }
    debug.incomplete = (debug.start != null && debug.end == null);
}

export const mapObjectToExportedValue = (obj: EvaluatedClass, options: IParsingOptions): IExportedValue => {
    const {eagerMode, streamLength, incomplete, scope} = options;
    const debug = {
        start: 0,
        end: streamLength,
        ioOffset: 0,
        incomplete: incomplete
    };
    return exportValue(obj, debug, false, [], eagerMode, scope);
};