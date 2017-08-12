/// <reference path="../../lib/ts-types/kaitai.d.ts" />
/// <reference path="../KsySchema.ts" />

import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import { YAML } from "yamljs";
import { ObjectExporter } from "./ObjectExporter";
import { IKaitaiServices, IKsyTypes, IExportOptions } from "./WorkerShared";
import { JsonExporter } from "./JsonExporter";
import { SchemaUtils } from "./SchemaUtils";
import { TemplateCompiler } from "./TemplateCompiler";

class KaitaiServices implements IKaitaiServices {
    kaitaiCompiler: KaitaiStructCompiler;
    templateCompiler: TemplateCompiler;

    ksyCode: string;
    ksy: KsySchema.IKsyFile;
    jsCode: string;

    classes: { [name: string]: any };
    mainClassName: string;

    input: ArrayBufferLike;
    parsed: any;

    objectExporter: ObjectExporter;

    constructor() {
        this.kaitaiCompiler = new KaitaiStructCompiler();
        this.templateCompiler = new TemplateCompiler();
    }

    public initCode() {
        if (!this.jsCode) return false;
        if (this.classes) return true;

        this.classes = {};

        var self = this;
        function define(name: string, deps: string[], callback: () => any) {
            self.classes[name] = callback();
            self.mainClassName = name;
        }
        define["amd"] = true;

        eval(this.jsCode);
        console.log("compileKsy", this.mainClassName, this.classes);

        const ksyTypes = SchemaUtils.collectKsyTypes(this.ksy);
        this.objectExporter = new ObjectExporter(ksyTypes, this.classes);
        return true;
    }

    public async compile(ksyCode: string, template: string) {
        this.jsCode = this.classes = this.objectExporter = null;
        this.ksyCode = ksyCode;
        this.ksy = YAML.parse(ksyCode);

        var releaseCode, debugCode;
        if (template) {
            const templateSchema = YAML.parse(template);
            releaseCode = await this.templateCompiler.compile(templateSchema, this.ksy, null, false);
            debugCode = await this.templateCompiler.compile(templateSchema, this.ksy, null, true);
        }
        else {
            releaseCode = await this.kaitaiCompiler.compile("javascript", this.ksy, null, false);
            debugCode = await this.kaitaiCompiler.compile("javascript", this.ksy, null, true);
        }

        this.jsCode = (<any>Object).values(debugCode).join("\n");
        return { releaseCode, debugCode, debugCodeAll: this.jsCode };
    }

    async setInput(input: ArrayBufferLike) {
        this.input = input;

        console.log("setInput", this.input);
    }

    async parse() {
        if (!this.initCode()) return;

        var mainClass = this.classes[this.mainClassName];
        this.parsed = new mainClass(new KaitaiStream(this.input, 0));
        this.parsed._read();

        console.log("parsed", this.parsed);
    }

    async export(options?: IExportOptions) {
        if (!this.initCode()) return null;

        options = options || {};
        if (options.path) {
            let propName = options.path.pop();

            let parent = this.parsed;
            for (const item of options.path)
                parent = parent[item];

            return this.objectExporter.exportProperty(parent, propName, options.path, options.noLazy);
        } else
            return this.objectExporter.exportValue(this.parsed, null, [], options.noLazy);
    }

    async getCompilerInfo() {
        return { version: this.kaitaiCompiler.version, buildDate: this.kaitaiCompiler.buildDate };
    }

    async generateParser(ksyContent: string, lang: string, debug: boolean): Promise<{ [fileName: string]: string; }> {
        const ksy = YAML.parse(ksyContent);
        const compiledCode = await this.kaitaiCompiler.compile(lang, ksy, null, debug);
        return compiledCode;
    }

    async exportToJson(useHex: boolean) {
        if (!this.initCode()) return null;

        const exported = await this.objectExporter.exportValue(this.parsed, null, [], true);
        const json = new JsonExporter(useHex).export(exported);
        return json;
    }
}

declare var api: any;
try {
    var kaitaiServices = api.kaitaiServices = new KaitaiServices();
    console.log("Kaitai Worker V2!", api);
} catch(e) {
    console.log("Worker error", e);
}
