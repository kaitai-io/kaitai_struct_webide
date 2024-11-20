import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {CompilerService, ReleaseAndDebugTargets} from "../DataManipulation/CompilationModule/CompilerService";
import {CurrentGoldenLayout} from "../Components/GoldenLayout/GoldenLayoutUI";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";
import {useErrorStore} from "../Components/ErrorPanel/Store/ErrorStore";

export const compileInternalDebugAndRelease = async (yamlInfo: YamlFileInfo) => {
    const compilationResult = await CompilerService.compileDebugAndReleaseTargets(yamlInfo, "javascript");
    switch (compilationResult.status) {
        case "FAILURE": {
            useErrorStore().setError(compilationResult.error);
            return false;
        }
        case "SUCCESS": {
            const compiledGrammar = compilationResult.result as ReleaseAndDebugTargets;
            useErrorStore().clearErrors();
            const debugCode = Object.values(compiledGrammar.debug).join("");
            const releaseCode = Object.values(compiledGrammar.release).join("");
            CurrentGoldenLayout.updateReleaseAndDebugCodeTabs(debugCode, releaseCode);
            KaitaiCodeWorkerApi.setCompilationTarget({
                result: compiledGrammar.debug,
                ksyTypes: compiledGrammar.ksyTypes,
                ksySchema: compiledGrammar.ksySchema,
                jsMainClassName: compiledGrammar.jsMainClassName,
                mainClassId: compiledGrammar.jsMainClassName,
            });
            return true;
        }
    }
};