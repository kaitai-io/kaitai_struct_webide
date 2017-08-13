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

export interface IReprPart {
    type: "text"|"value";
    value: string;
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

    isLazyArray?: boolean;
    arrayLength?: number;

    exception: any;

    parent?: IExportedValue;
    representation?: IReprPart[];
}

export interface IKsyTypes { [name: string]: KsySchema.IType; }

export interface ISandboxMethods {
    eval(code: string): Promise<any>;
    loadScript(src: string): Promise<void>;
    kaitaiServices: IKaitaiServices;
}

type ITextFiles = { [fileName:string]: string };

export interface IExportOptions {
    noLazy?: boolean;
    path?: string[];
    arrayLenLimit?: number;
}

export interface ILazyArrayExportOptions extends IExportOptions {
    path: string[];
    arrayRange: { from: number, to: number };
}

export interface IKaitaiServices {
    setKsys(ksyCodes: { [uri: string]: string }): Promise<string[]>;
    compile(ksyUri: string, template?: string): Promise<{
        releaseCode: ITextFiles,
        debugCode: ITextFiles,
        debugCodeAll: string,
    }>;
    generateParser(ksy: string, lang: string, debug: boolean): Promise<ITextFiles>;
    setInput(input: ArrayBufferLike): Promise<void>;
    parse(): Promise<void>;
    export(options: IExportOptions): Promise<IExportedValue>;
    export(options: ILazyArrayExportOptions): Promise<IExportedValue[]>;
    exportToJson(useHex: boolean): Promise<string>;
    getCompilerInfo(): Promise<{ version: string, buildDate: string }>;
}
