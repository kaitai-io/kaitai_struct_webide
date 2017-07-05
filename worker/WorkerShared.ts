/// <reference path="../src/KsySchema.ts" />

enum ObjectType {
    Primitive = "Primitive",
    Array = "Array",
    TypedArray = "TypedArray",
    Object = "Object",
    Undefined = "Undefined",
}

interface IInstance {
    path: string[];
    offset: number;
}

interface IExportedObject {
    class?: string;
    ksyType?: KsySchema.IType;
    fields?: { [name: string]: IExportedValue; };
    instances?: { [name: string]: IInstance; };
}

interface IExportedValue {
    type: ObjectType;
    path: string[];
    ioOffset: number;
    start: number;
    end: number;

    primitiveValue?: any;
    arrayItems?: IExportedValue[];
    bytes?: Uint8Array;
    object?: IExportedObject;

    enumName?: string;
    enumStringValue?: string;
    //isInstance?: boolean;

    parent?: IExportedValue;
}

interface IKsyTypes { [name: string]: KsySchema.IType; };
