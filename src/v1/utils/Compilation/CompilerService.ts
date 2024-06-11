import {JsImporter} from "./JsImporter";
import {IFsItem} from "../../FileSystems/FileSystemsTypes";
import {performanceHelper} from "../PerformanceHelper";
import {SchemaUtils} from "./SchemaUtils";
import KaitaiStructCompiler from "kaitai-struct-compiler";
import {CompilationError} from "./CompilationError";
import {YamlParser} from "./YamlParser";
export class CompilerService {
    jsImporter: JsImporter;
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;



    compile(srcYamlFsItem: IFsItem, srcYaml: string, kslang: string, debug: true | false | "both"): Promise<any> {
        var perfYamlParse = performanceHelper.measureAction("YAML parsing");

        try {
            this.ksySchema = YamlParser.parseIKsyFile(srcYaml, srcYamlFsItem.fn);
            this.ksyTypes = SchemaUtils.collectKsyTypes(this.ksySchema);

            // we have to modify the schema (add typesByJsName for example) before sending into the compiler, so we need a copy
            var compilerSchema = YamlParser.parseIKsyFile(srcYaml, srcYamlFsItem.fn);
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
                    return rRelease && rDebug ? {debug: rDebug, release: rRelease} : rRelease ? rRelease : rDebug;
                }).catch(compileErr => Promise.reject(new CompilationError("kaitai", compileErr)));
        }
    }
}