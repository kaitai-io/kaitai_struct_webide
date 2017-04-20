declare class YAML {
    static parse(yaml: string): any;
}

declare namespace io.kaitai.struct {
    interface IYamlImporter {
        importYaml(name: string, mode: string): Promise<string>;
    }

    class MainJs {
        version: string;
        buildDate: string;
        compile(kslang: string, compilerSchema: any, jsImporter: IYamlImporter, isDebug: boolean): any;
    }
}
