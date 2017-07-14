/// <reference path="../KsySchema.ts" />

export enum ObjectType {
    Primitive = "Primitive",
    Array = "Array",
    TypedArray = "TypedArray",
    Object = "Object",
    Undefined = "Undefined",
}

export interface IInstance {
    path: string[];
    offset: number;
}

export interface IExportedObject {
    class?: string;
    ksyType?: KsySchema.IType;
    fields?: { [name: string]: IExportedValue; };
    instances?: { [name: string]: IInstance; };
}

export interface IExportedValue {
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

export interface IKsyTypes { [name: string]: KsySchema.IType; }

export interface ISandboxMethods {
    eval(code: string): Promise<any>;
    loadScript(src: string): Promise<void>;
    kaitaiServices: IKaitaiServices;
}

export interface IKaitaiServices {
    compile(code: string): Promise<{
        releaseCode: { [fileName:string]: string },
        debugCode: { [fileName:string]: string },
        debugCodeAll: string,
    }>;
    setInput(input: ArrayBufferLike): Promise<void>;
    parse(): Promise<void>;
    export(): Promise<IExportedValue>;
    getCompilerInfo(): Promise<{ version: string, buildDate: string }>;
}
