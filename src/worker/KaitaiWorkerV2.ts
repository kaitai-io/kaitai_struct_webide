/// <reference path="../../lib/ts-types/kaitai.d.ts" />
/// <reference path="../KsySchema.ts" />

import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import { YAML } from "yamljs";
import { ObjectExporter } from "./ObjectExporter";
import { IKaitaiServices, IKsyTypes } from "./WorkerShared";
import { JsonExporter } from "./JsonExporter";
import { SchemaUtils } from "./SchemaUtils";

class KaitaiServices implements IKaitaiServices {
    ksyCode: string;
    ksy: KsySchema.IKsyFile;
    jsCode: string;

    classes: { [name: string]: any };
    mainClassName: string;

    input: ArrayBufferLike;
    parsed: any;

    objectExporter: ObjectExporter;

    constructor(public compiler: ICompiler) {
    }

    public async compile(ksyCode: string) {
        this.ksyCode = ksyCode;
        this.ksy = YAML.parse(ksyCode);

        var releaseCode = await this.compiler.compile("javascript", this.ksy, null, false);
        var debugCode = await this.compiler.compile("javascript", this.ksy, null, true);
        var debugCodeAll = this.jsCode = (<any>Object).values(debugCode).join("\n");

        this.classes = {};

        var self = this;
        function define(name: string, deps: string[], callback: () => any) {
            self.classes[name] = callback();
            self.mainClassName = name;
        }
        define["amd"] = true;

        eval(debugCodeAll);
        console.log("compileKsy", this.mainClassName, this.classes);

        const ksyTypes = SchemaUtils.collectKsyTypes(this.ksy);

        this.objectExporter = new ObjectExporter(ksyTypes, this.classes);

        return { releaseCode, debugCode, debugCodeAll };
    }

    async setInput(input: ArrayBufferLike) {
        this.input = input;

        console.log("setInput", this.input);
    }

    async parse() {
        var mainClass = this.classes[this.mainClassName];
        this.parsed = new mainClass(new KaitaiStream(this.input, 0));
        this.parsed._read();

        console.log("parsed", this.parsed);
    }

    async export() {
        return this.objectExporter.exportValue(this.parsed, null, []);
    }

    async getCompilerInfo() {
        return { version: this.compiler.version, buildDate: this.compiler.buildDate };
    }

    async generateParser(ksyContent: string, lang: string, debug: boolean): Promise<{ [fileName: string]: string; }> {
        const ksy = YAML.parse(ksyContent);
        const compiledCode = await this.compiler.compile(lang, ksy, null, debug);
        return compiledCode;
    }

    async exportToJson(useHex: boolean) {
        const exported = await this.objectExporter.exportValue(this.parsed, null, [], true);
        const json = new JsonExporter(useHex).export(exported);
        return json;
    }
}

declare var api: any;
try {
    var kaitaiServices = api.kaitaiServices = new KaitaiServices(new KaitaiStructCompiler());
    console.log("Kaitai Worker V2!", api);
} catch(e) {
    console.log("Worker error", e);
}
