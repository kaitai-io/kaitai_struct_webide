import {KsySchema} from "./KsySchemaTypes";

export class ObjectType {
    public static Primitive = "Primitive";
    public static Array = "Array";
    public static TypedArray = "TypedArray";
    public static Object = "Object";
    public static Undefined = "Undefined";
    public static LazyInstance = "LazyInstance";
}

export interface IExportedObject {
    class?: string;
    ksyType?: KsySchema.IType;
    fields?: { [name: string]: IExportedValue; };
}

export interface IExportedValue {
    type: ObjectType;
    path: string[];
    ioOffset: number;
    start: number;
    end: number;
    incomplete: boolean;
    validationError?: Error;
    instanceError?: Error;

    primitiveValue?: any;
    arrayItems?: IExportedValue[];
    bytes?: Uint8Array;
    object?: IExportedObject;

    enumName?: string;
    enumStringValue?: string;

    parent?: IExportedValue;
}

