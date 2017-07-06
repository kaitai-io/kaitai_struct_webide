declare module "yamljs" {
    export class YAML {
        static parse(yaml: string): any;
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
        constructor(inputBuffer: ArrayBuffer, offset: number);
    }

    export = KaitaiStream;
}
