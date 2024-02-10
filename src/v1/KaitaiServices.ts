import { fss, IFsItem } from "./app.files";
import { performanceHelper } from "./utils/PerformanceHelper";
import KaitaiStructCompiler = require("kaitai-struct-compiler");
import * as jsyaml from "js-yaml";

class SchemaUtils {
    static ksyNameToJsName(ksyName: string, isProp: boolean) {
        return ksyName.split("_").map((x, i) => i === 0 && isProp ? x : x.ucFirst()).join("");
    }

    static collectTypes(types: IKsyTypes, parent: KsySchema.IType) {
        if (parent.types) {
            parent.typesByJsName = {};
            Object.keys(parent.types).forEach(name => {
                var jsName = SchemaUtils.ksyNameToJsName(name, false);
                parent.typesByJsName[jsName] = types[jsName] = parent.types[name];
                SchemaUtils.collectTypes(types, parent.types[name]);
            });
        }

        if (parent.instances) {
            parent.instancesByJsName = {};
            Object.keys(parent.instances).forEach(name => {
                var jsName = SchemaUtils.ksyNameToJsName(name, true);
                parent.instancesByJsName[jsName] = parent.instances[name];
            });
        }
    }

    static collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
        var types: IKsyTypes = {};
        SchemaUtils.collectTypes(types, schema);

        var typeName = SchemaUtils.ksyNameToJsName(schema.meta.id, false);
        types[typeName] = schema;

        return types;
    }
}

class JsImporter implements IYamlImporter {
    constructor(private rootFsItem: IFsItem, private ksyTypes: IKsyTypes) {
    }

    async importYaml(name: string, mode: string) {
        var loadFn;
        var importedFsType = this.rootFsItem.fsType;
        if (mode === "abs") {
            loadFn = "formats/" + name;
            importedFsType = "kaitai";
        } else {
            var fnParts = this.rootFsItem.fn.split("/");
            fnParts.pop();
            loadFn = fnParts.join("/") + "/" + name;

            if (loadFn.startsWith("/")) {
                loadFn = loadFn.substr(1);
            }
        }

        console.log(`import yaml: ${name}, mode: ${mode}, loadFn: ${loadFn}, root:`, this.rootFsItem);
        const fn = `${loadFn}.ksy`;
        const sourceAppendix = mode === 'abs' ? 'kaitai.io' : 'local storage';
        let ksyContent;
        try {
            ksyContent = await fss[importedFsType].get(fn);
        } catch (e) {
            const error = new Error(`failed to import spec ${fn} from ${sourceAppendix}${e.message ? ': ' + e.message : ''}`);

            // The default implementation of the Error.prototype.toString() method gives
            // "Error: {message}", see
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/toString#description
            // However, the error we're throwing here goes directly into the KSC code,
            // which will add its own `error: ` prefix (as the severity of the problem),
            // so the resulting message would contain `error: Error: ...`. By overriding
            // toString() to omit the `Error: ` part, we can make the message a bit nicer.
            error.toString = function () {
                return this.message;
            };
            throw error;
        }
        const ksyModel = <KsySchema.IKsyFile>parseYaml(<string>ksyContent, fn);
        Object.assign(this.ksyTypes, SchemaUtils.collectKsyTypes(ksyModel));

        // we have to modify the schema (add typesByJsName for example) before sending into the compiler, so we need a copy
        const compilerSchema = <KsySchema.IKsyFile>parseYaml(<string>ksyContent, fn);
        return compilerSchema;
    }
}

export class CompilationError {
    constructor(public type: "yaml"|"kaitai", public error: any) { }
}

export class CompilerService {
    jsImporter: JsImporter;
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;

    compile(srcYamlFsItem: IFsItem, srcYaml: string, kslang: string, debug: true | false | "both"): Promise<any> {
        var perfYamlParse = performanceHelper.measureAction("YAML parsing");

        try {
            this.ksySchema = <KsySchema.IKsyFile>parseYaml(srcYaml, srcYamlFsItem.fn);
            this.ksyTypes = SchemaUtils.collectKsyTypes(this.ksySchema);

            // we have to modify the schema (add typesByJsName for example) before sending into the compiler, so we need a copy
            var compilerSchema = <KsySchema.IKsyFile>parseYaml(srcYaml, srcYamlFsItem.fn);
        } catch (parseErr) {
            return Promise.reject(new CompilationError("yaml", parseErr));
        }

        this.jsImporter = new JsImporter(srcYamlFsItem, this.ksyTypes);

        perfYamlParse.done();

        //console.log("ksySchema", ksySchema);

        if (kslang === "json")
            return Promise.resolve();
        else {
            var perfCompile = performanceHelper.measureAction("Compilation");

            var ks = KaitaiStructCompiler;
            var rReleasePromise = (debug === false || debug === "both") ? ks.compile(kslang, compilerSchema, this.jsImporter, false) : Promise.resolve(null);
            var rDebugPromise = (debug === true || debug === "both") ? ks.compile(kslang, compilerSchema, this.jsImporter, true) : Promise.resolve(null);
            //console.log("rReleasePromise", rReleasePromise, "rDebugPromise", rDebugPromise);
            return perfCompile.done(Promise.all([rReleasePromise, rDebugPromise]))
                .then(([rRelease, rDebug]) => {
                    //console.log("rRelease", rRelease, "rDebug", rDebug);
                    return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
                }).catch(compileErr => Promise.reject(new CompilationError("kaitai", compileErr)));
        }
    }
}

function parseYaml(yamlContents: string, filename: string) {
    const options = {
        schema: jsyaml.CORE_SCHEMA,
        filename: filename,
    };
    return jsyaml.load(yamlContents, options);
}
