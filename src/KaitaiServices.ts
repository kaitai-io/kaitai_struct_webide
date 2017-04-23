import { fss } from "./app.files";
import { performanceHelper } from "./utils/PerformanceHelper";
import { ga } from "./app";
import { showError } from "./app.errors";

class SchemaUtils {
    static ksyNameToJsName(ksyName: string, isProp: boolean) {
        return ksyName.split("_").map((x, i) => i === 0 && isProp ? x : x.ucFirst()).join("");
    };

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

class JsImporter implements io.kaitai.struct.IYamlImporter {
    importYaml(name: string, mode: string) {
        return new Promise(function (resolve, reject) {
            console.log(`import yaml: ${name}, mode: ${mode}`);

            return fss.kaitai.get(`formats/${name}.ksy`).then(ksyContent => {
                var ksyModel = <KsySchema.IKsyFile>YAML.parse(<string>ksyContent);
                return resolve(ksyModel);
            });
        });
    }
}

export class CompilerService {
    jsImporter = new JsImporter();
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;

    compile(srcYaml: string, kslang: string, debug: true | false | "both"): Promise<any> {
        var perfYamlParse = performanceHelper.measureAction("YAML parsing");

        try {
            this.ksySchema = <KsySchema.IKsyFile>YAML.parse(srcYaml);
            this.ksyTypes = SchemaUtils.collectKsyTypes(this.ksySchema);

            // we have to modify the schema (add typesByJsName for example) before sending into the compiler so we need a copy
            var compilerSchema = <KsySchema.IKsyFile>YAML.parse(srcYaml);
        } catch (parseErr) {
            ga("compile", "error", `yaml: ${parseErr}`);
            showError("YAML parsing error: ", parseErr);
            return;
        }

        perfYamlParse.done();

        //console.log("ksySchema", ksySchema);

        if (kslang === "json")
            return Promise.resolve();
        else {
            var perfCompile = performanceHelper.measureAction("Compilation");

            var ks = new io.kaitai.struct.MainJs();
            var rReleasePromise = (debug === false || debug === "both") ? ks.compile(kslang, compilerSchema, this.jsImporter, false) : Promise.resolve(null);
            var rDebugPromise = (debug === true || debug === "both") ? ks.compile(kslang, compilerSchema, this.jsImporter, true) : Promise.resolve(null);
            //console.log("rReleasePromise", rReleasePromise, "rDebugPromise", rDebugPromise);
            return perfCompile.done(Promise.all([rReleasePromise, rDebugPromise]))
                .then(([rRelease, rDebug]) => {
                    ga("compile", "success");
                    //console.log("rRelease", rRelease, "rDebug", rDebug);
                    return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
                })
                .catch(compileErr => {
                    ga("compile", "error", `kaitai: ${compileErr}`);
                    showError("KS compilation error: ", compileErr);
                    return;
                });
        }
    }
}