declare module "yamljs" {
    export class YAML {
        static parse(yaml: string): any;
    }
}

interface IYamlImporter {
    importYaml(name: string, mode: string): Promise<any>;
}

interface ICompiler {
    version: string;
    buildDate: string;
    compile(kslang: string, compilerSchema: any, jsImporter: IYamlImporter, isDebug: boolean): Promise<{ [filename: string]: string }>;
}

declare module "kaitai-struct-compiler" {
    class KaitaiStructCompiler implements ICompiler {
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
