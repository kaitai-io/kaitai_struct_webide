import {IYamlImporter, JsImporter, YamlFileInfo} from "./JsImporter";
import {IFsItem} from "../../v1/FileSystems/FileSystemsTypes";
import {performanceHelper} from "../../v1/utils/PerformanceHelper";
import {SchemaUtils} from "./SchemaUtils";
import KaitaiStructCompiler from "kaitai-struct-compiler";
import {CompilationError} from "./CompilationError";
import {YamlParser} from "./YamlParser";
import {IKsyTypes} from "../ParsingModule/CodeExecution/Types";
import {StringUtils} from "../../v1/utils/Misc/StringUtils";
import IKsyFile = KsySchema.IKsyFile;

export interface KaitaiCompilationResult {
    [fileName: string]: string;
}

export interface CompilationTarget {
    result: KaitaiCompilationResult;
    jsMainClassName: string;
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;
}

export interface ReleaseAndDebugTargets {
    debug: KaitaiCompilationResult;
    release: KaitaiCompilationResult;
    jsMainClassName: string;
    ksySchema: KsySchema.IKsyFile;
    ksyTypes: IKsyTypes;
}

export class CompilerService {
    async compileSingleTargetFsWrapper(srcYamlFsItem: IFsItem, yamlContent: string, targetLanguage: string, isDebug: boolean): Promise<CompilationTarget> {
        const initialYaml: YamlFileInfo = {storeId: srcYamlFsItem.fsType, fileContent: yamlContent, filePath: srcYamlFsItem.fn};
        return this.compileSingleTarget(initialYaml, targetLanguage, isDebug);

    }

    async compileDebugAndReleaseTargetsWrapper(srcYamlFsItem: IFsItem, yamlContent: string, targetLanguage: string): Promise<ReleaseAndDebugTargets> {
        const initialYaml: YamlFileInfo = {storeId: srcYamlFsItem.fsType, fileContent: yamlContent, filePath: srcYamlFsItem.fn};
        return this.compileDebugAndReleaseTargets(initialYaml, targetLanguage);
    }

    async compileSingleTarget(initialYaml: YamlFileInfo, targetLanguage: string, isDebug: boolean): Promise<CompilationTarget> {
        try {
            if (targetLanguage === "json") {
                return this.getJsonCompilationTargetResponse(initialYaml);
            }

            const compilerSchema = this.prepareMainFileSchema(initialYaml);
            const jsImporter = new JsImporter(initialYaml);
            const compilationTarget = await this._compileDebugOrRelease(targetLanguage, compilerSchema, jsImporter, isDebug);
            const {schema, types} = SchemaUtils.prepareSchemaAndCombinedKsyTypes(initialYaml, jsImporter.getFilesLoadedUsingImporter());


            return {
                result: compilationTarget,
                ksySchema: schema,
                jsMainClassName: this.getJsMainClassNameFromSchema(schema),
                ksyTypes: types
            };
        } catch (ex) {
            return Promise.reject(ex);
        }
    }

    async compileDebugAndReleaseTargets(initialYaml: YamlFileInfo, targetLanguage: string): Promise<ReleaseAndDebugTargets> {
        try {
            if (targetLanguage === "json") {
                return this.getJsonReleaseAndDebugTargets(initialYaml);
            }
            const compilerSchema = this.prepareMainFileSchema(initialYaml);
            const jsImporter = new JsImporter(initialYaml);
            const [releaseTarget, debugTarget] = await this._compileDebugAndRelease(targetLanguage, compilerSchema, jsImporter);
            const {schema, types} = SchemaUtils.prepareSchemaAndCombinedKsyTypes(initialYaml, jsImporter.getFilesLoadedUsingImporter());

            return {
                debug: debugTarget,
                release: releaseTarget,
                jsMainClassName: this.getJsMainClassNameFromSchema(schema),
                ksySchema: schema,
                ksyTypes: types
            };
        } catch (ex) {
            return Promise.reject(ex);
        }
    }


    prepareMainFileSchema(yamlInfo: YamlFileInfo) {
        try {
            const perfYamlParse = performanceHelper.measureAction("[YAML_PARSE]");
            let compilerSchema = YamlParser.parseIKsyFile(yamlInfo);
            perfYamlParse.done();
            return compilerSchema;
        } catch (ex) {
            throw new CompilationError("yaml", ex);
        }
    }

    private async _compileDebugAndRelease(targetLanguage: string, compilerSchema: IKsyFile, jsImporter: IYamlImporter): Promise<KaitaiCompilationResult[]> {
        try {
            const perfCompile = performanceHelper.measureAction("[KSY_COMPILE][RELEASE+DEBUG]");
            const debug = KaitaiStructCompiler.compile(targetLanguage, compilerSchema, jsImporter, true);
            const release = KaitaiStructCompiler.compile(targetLanguage, compilerSchema, jsImporter, false);
            return perfCompile.done(Promise.all([release, debug]));
        } catch (ex) {
            throw new CompilationError("kaitai", ex);
        }
    }

    private async _compileDebugOrRelease(
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

    private getJsonCompilationTargetResponse(initialYaml: YamlFileInfo): Promise<CompilationTarget> {
        const {schema, types} = SchemaUtils.getTypesAndSchemaFromSingleFile(initialYaml);

        return Promise.resolve({
            result: {},
            jsMainClassName: this.getJsMainClassNameFromSchema(schema),
            ksySchema: schema,
            ksyTypes: types
        });
    }

    private getJsonReleaseAndDebugTargets(initialYaml: YamlFileInfo): Promise<ReleaseAndDebugTargets> {
        const {schema, types} = SchemaUtils.getTypesAndSchemaFromSingleFile(initialYaml);
        return Promise.resolve({
            debug: {},
            release: {},
            jsMainClassName: this.getJsMainClassNameFromSchema(schema),
            ksySchema: schema,
            ksyTypes: types
        });
    }

    private getJsMainClassNameFromSchema(schema: IKsyFile) {
        return schema.meta.id.split("_").map((x: string) => StringUtils.ucFirst(x)).join("");
    }

}