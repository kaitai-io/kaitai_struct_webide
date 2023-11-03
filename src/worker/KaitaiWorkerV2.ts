/// <reference path="../../lib/ts-types/kaitai.d.ts" />
/// <reference path="../KsySchema.ts" />

import KaitaiStructCompiler = require("kaitai-struct-compiler");
import KaitaiStream = require("KaitaiStream");
import { YAML } from "yamljs";
import { ObjectExporter } from "./ObjectExporter";
import { IKaitaiServices, IExportOptions, ILazyArrayExportOptions } from "./WorkerShared";
import { JsonExporter } from "./JsonExporter";
import { SchemaUtils } from "./SchemaUtils";
import { TemplateCompiler } from "./TemplateCompiler";
import { IExportedValue } from "./WorkerShared";

class KaitaiServices implements IKaitaiServices {
    kaitaiCompiler: typeof KaitaiStructCompiler;
    templateCompiler: TemplateCompiler;

    ksys: { [fn: string]: KsySchema.IKsyFile } = {};
    jsCode: string;

    classes: { [name: string]: any };
    mainClassName: string;

    input: ArrayBufferLike;
    parsed: any;

    objectExporter: ObjectExporter;

    constructor() {
        this.kaitaiCompiler = KaitaiStructCompiler;
        this.templateCompiler = new TemplateCompiler();
    }

    public initCode() {
        if (!this.jsCode) return false;
        if (this.classes && this.objectExporter) return true;

        this.classes = {};

        var self = this;
        function define(name: string, deps: string[], callback: () => any) {
            self.classes[name] = callback();
            self.mainClassName = name;
        }
        define["amd"] = true;

        eval(this.jsCode.replace(/if \(typeof require(.|\n)*?require\([^;]*;/g, ""));
        console.log("compileKsy", this.mainClassName, this.classes);

        this.objectExporter = new ObjectExporter(this.classes);
        for (const ksy of Object.values(this.ksys))
            this.objectExporter.addKsyTypes(SchemaUtils.collectKsyTypes(ksy));
        return true;
    }

    protected async getMissingImports() {
        const missingImports = new Set<string>();
        for (const ksyUri of Object.keys(this.ksys)) {
            const ksyUriParts = ksyUri.split("/");
            const parentUri = ksyUriParts.slice(0, ksyUriParts.length - 1).join("/");
            const ksy = this.ksys[ksyUri];
            if (!ksy.meta || !ksy.meta.imports) continue;

            for (const importFn of ksy.meta.imports) {
                const importUri = `${parentUri}/${importFn}.ksy`;
                if(!(importUri in this.ksys))
                    missingImports.add(importUri);
            }
        }
        return Array.from(missingImports);
    }

    public async setKsys(ksyCodes: { [fn: string]: string }) {
        for (const importFn of Object.keys(ksyCodes))
            this.ksys[importFn] = YAML.parse(ksyCodes[importFn]);
        return await this.getMissingImports();
    }

    public async compile(ksyUri: string, template: string) {
        this.jsCode = this.classes = this.objectExporter = null;
        const ksy = this.ksys[ksyUri];

        var releaseCode, debugCode;
        if (template) {
            const templateSchema = YAML.parse(template);
            releaseCode = await this.templateCompiler.compile(templateSchema, ksy, this, false);
            debugCode = await this.templateCompiler.compile(templateSchema, ksy, this, true);
        }
        else {
            releaseCode = await this.kaitaiCompiler.compile("javascript", ksy, this, false);
            debugCode = await this.kaitaiCompiler.compile("javascript", ksy, this, true);
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

    async export(options?: IExportOptions): Promise<IExportedValue>;
    async export(options: ILazyArrayExportOptions): Promise<IExportedValue[]>;

    async export(options: IExportOptions|ILazyArrayExportOptions): Promise<IExportedValue|IExportedValue[]> {
        if (!this.initCode()) return null;

        this.objectExporter.noLazy = options.noLazy;
        this.objectExporter.arrayLenLimit = options.arrayLenLimit;

        options = options || {};
        if (options.path) {
            let path = Array.from(options.path);
            let propName = path.pop();

            let parent = this.parsed;
            for (const item of path)
                parent = parent[item];

            const arrayRange = (<ILazyArrayExportOptions>options).arrayRange;
            if (arrayRange)
                return this.objectExporter.exportArray(parent, propName, options.path, arrayRange.from, arrayRange.to);
            else
                return this.objectExporter.exportProperty(parent, propName, options.path);
        } else
            return this.objectExporter.exportValue(this.parsed, null, []);
    }

    async getCompilerInfo() {
        return { version: this.kaitaiCompiler.version, buildDate: this.kaitaiCompiler.buildDate };
    }

    async generateParser(ksyContent: string, lang: string, debug: boolean): Promise<{ [fileName: string]: string; }> {
        const ksy = YAML.parse(ksyContent);
        const compiledCode = await this.kaitaiCompiler.compile(lang, ksy, this, debug);
        return compiledCode;
    }

    async importYaml(name: string, mode: "abs"|"rel") {
        for (const ksyUri of Object.keys(this.ksys))
            if (ksyUri.endsWith(`/${name}.ksy`))
                return this.ksys[ksyUri];
        throw new Error(`importYaml failed: ${name}. Available ksys: ${Object.keys(this.ksys).join(", ")}`);
    }

    async exportToJson(useHex: boolean) {
        if (!this.initCode()) return null;

        this.objectExporter.noLazy = true;
        this.objectExporter.arrayLenLimit = null;

        const exported = await this.objectExporter.exportValue(this.parsed, null, []);
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
