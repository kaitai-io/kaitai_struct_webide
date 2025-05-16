import KaitaiStream from "kaitai-struct/KaitaiStream";
import {EvaluatedClass} from "./Types";
import {CompilationTarget} from "../../CompilationModule/CompilerService";
import {KsySchema} from "../../KsySchemaTypes";

export class EvaluatedCodeScope {
    EvaluationScope: any;
    EvaluatedMainClass: typeof EvaluatedClass;
    compilationTarget: CompilationTarget;


    constructor() {
        this.EvaluationScope = {};
        this.EvaluationScope.KaitaiStream = KaitaiStream;
    }

    evaluateCode(compilationTarget: CompilationTarget) {
        this.compilationTarget = compilationTarget;
        try {
            const newSourceCode = this.prepareSourceCode();
            const mainClassNamespace = `${this.compilationTarget.jsMainClassName}.${this.compilationTarget.jsMainClassName}`;
            eval(`${newSourceCode}
            this.EvaluatedMainClass = this.EvaluationScope.${mainClassNamespace};`);
            return {error: undefined};
        } catch (error) {
            return {error: error};
        }
    }

    getEnumByPath(path: string): object {
        let enumObject = this.EvaluationScope;
        const pathParts = path.split(".");
        // Generated scopes have additional namespace named the same as Base Object
        // That is why pathParts need to have additional part added. so path will transform into this
        // Zip.Compression => Zip.Zip.Compression
        pathParts.unshift(pathParts[0]);
        pathParts.forEach(pathPart => enumObject = enumObject[pathPart]);
        return enumObject;
    }

    getKsyTypeByClass(className: string): KsySchema.IType | undefined {
        return this.compilationTarget.ksyTypes[className];
    }

    getMatchingEnumStringValuesByPath(value: number, path: string): string[] {
        const enumDefinition = this.getEnumByPath(path);
        if (enumDefinition[value]) {
            return [enumDefinition[value]];
        }
        let flagCheck = 0;
        return Object.keys(enumDefinition)
            .filter(x => isNaN(<any>x))
            .filter(x => {
                if (flagCheck & enumDefinition[x]) {
                    return false;
                }

                flagCheck |= enumDefinition[x];
                return value & enumDefinition[x];
            });
    }


    parseBuffer(inputBuffer: ArrayBuffer) {
        const ioInput = new KaitaiStream(inputBuffer, 0);
        let mainClass: EvaluatedClass = undefined;
        try {
            mainClass = new this.EvaluatedMainClass(ioInput);
            mainClass._read();
            return {parsed: mainClass};
        } catch (error) {
            return {
                parsed: mainClass,
                error: error
            };
        }
    }


    private removeCommonJsHeader(source: string) {
        const startingIndexOfCommonJSModulesCheck = 5;

        let splitContent = source.split("\n");
        splitContent.splice(startingIndexOfCommonJSModulesCheck, 2);
        return splitContent.join("\n");
    }

    private prepareSourceCode() {
        return Object.values(this.compilationTarget.result).map(source => {
            const modifiedSource = this.removeCommonJsHeader(source);
            return modifiedSource.replace("typeof self !== 'undefined' ? self : this", "this.EvaluationScope");
        }).join("\n");
    }
}