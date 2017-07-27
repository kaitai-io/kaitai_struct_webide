declare module "yamljs" {
    export class YAML {
        static parse(yaml: string, exceptionOnInvalidType?: boolean, objectDecoder?: any, saveMeta?: boolean): any;
    }
}

interface IYamlImporter {
    importYaml(name: string, mode: string): Promise<any>;
}

declare module "kaitai-struct-compiler" {
    class KaitaiStructCompiler {
        version: string;
        buildDate: string;
        compile(kslang: string, compilerSchema: any, jsImporter: IYamlImporter, isDebug: boolean): Promise<{ [filename: string]: string }>;
    }

    export = KaitaiStructCompiler;
}

declare module "KaitaiStream" {
    class KaitaiStream {
        constructor(inputBuffer: ArrayBufferLike, offset: number);
    }

    export = KaitaiStream;
}
