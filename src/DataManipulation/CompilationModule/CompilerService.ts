import {IYamlImporter, JsImporter, YamlFileInfo} from "./JsImporter";
import {performanceHelper} from "../../Utils/PerformanceHelper";
import {SchemaUtils} from "./SchemaUtils";
import KaitaiStructCompiler from "kaitai-struct-compiler";
import {CompilationError} from "./CompilationError";
import {YamlParser} from "./YamlParser";
import {IKsyTypes} from "../ParsingModule/CodeExecution/Types";
import {StringUtils} from "../../Utils/StringUtils";
import {KsySchema} from "../KsySchemaTypes";
import IKsyFile = KsySchema.IKsyFile;

export interface KaitaiCompilationResult {
    [fileName: string]: string;
}

export interface CompilationTarget {
    result: KaitaiCompilationResult;
    mainClassId: string;
    jsMainClassName: string;
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;
}

export interface CompilationResultSuccess {
    status: "SUCCESS";
    result: CompilationTarget;
}


export interface CompilationResultFailure {
    status: "FAILURE";
    error: any;
}

export type CompilationResult = CompilationResultSuccess | CompilationResultFailure;

export class CompilerService {
    static async compileSingleTarget(initialYaml: YamlFileInfo, targetLanguage: string, isDebug: boolean): Promise<CompilationResult> {
        try {
            if (targetLanguage === "json") {
                return this.getJsonCompilationTargetResponse(initialYaml);
            }

            const compilerSchema = this.prepareMainFileSchema(initialYaml);
            const jsImporter = new JsImporter(initialYaml);
            const compilationTarget = await this._compileDebugOrRelease(targetLanguage, compilerSchema, jsImporter, isDebug);
            const {schema, types} = SchemaUtils.prepareSchemaAndCombinedKsyTypes(initialYaml, jsImporter.getFilesLoadedUsingImporter());

            return {
                status: "SUCCESS",
                result: {
                    result: compilationTarget,
                    ksySchema: schema,
                    mainClassId: this.getMainClassId(schema),
                    jsMainClassName: this.getJsMainClassNameFromSchema(schema),
                    ksyTypes: types,
                }
            };
        } catch (ex) {
            return {
                status: "FAILURE",
                error: ex
            };
        }
    }


    static prepareMainFileSchema(yamlInfo: YamlFileInfo) {
        try {
            const perfYamlParse = performanceHelper.measureAction("[YAML_PARSE]");
            let compilerSchema = YamlParser.parseIKsyFile(yamlInfo);
            perfYamlParse.done();
            return compilerSchema;
        } catch (ex) {
            throw new CompilationError("yaml", ex);
        }
    }

    private static async _compileDebugOrRelease(
        targetLanguage: string, compilerSchema: IKsyFile, jsImporter: IYamlImporter, isDebug: boolean
    ): Promise<KaitaiCompilationResult> {
        try {
            const releaseOrDebugLabel = isDebug ? "DEBUG" : "RELEASE";
            const perfCompile = performanceHelper.measureAction(`[KSY_COMPILE][${releaseOrDebugLabel}]`);
            const compiled = KaitaiStructCompiler.compile(targetLanguage, compilerSchema, jsImporter, isDebug);
            return perfCompile.done(Promise.resolve(compiled));
        } catch (ex) {
            throw new CompilationError("kaitai", ex);
        }
    }

    private static getJsonCompilationTargetResponse(initialYaml: YamlFileInfo): Promise<CompilationResult> {
        const {schema, types} = SchemaUtils.getTypesAndSchemaFromSingleFile(initialYaml);
        return Promise.resolve({
            status: "SUCCESS",
            result: {
                result: {},
                mainClassId: this.getMainClassId(schema),
                jsMainClassName: this.getJsMainClassNameFromSchema(schema),
                ksySchema: schema,
                ksyTypes: types
            }
        });
    }

    private static getJsMainClassNameFromSchema(schema: IKsyFile) {
        return schema.meta.id.split("_").map((x: string) => StringUtils.ucFirst(x)).join("");
    }

    private static getMainClassId(schema: IKsyFile) {
        return schema.meta.id;
    }

}