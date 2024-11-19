import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {CompilerService} from "../DataManipulation/CompilationModule/CompilerService";
import {CurrentGoldenLayout} from "../Components/GoldenLayout/GoldenLayoutUI";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";
import {useErrorStore} from "../Stores/ErrorStore";

export const compileInternalDebugAndRelease = async (yamlInfo: YamlFileInfo) => {
    try {
        useErrorStore().clearErrors();
        const compiledGrammar = await CompilerService.compileDebugAndReleaseTargets(yamlInfo, "javascript");
        const debugCode = Object.values(compiledGrammar.debug).join("");
        const releaseCode = Object.values(compiledGrammar.release).join("");
        CurrentGoldenLayout.updateReleaseAndDebugCodeTabs(debugCode, releaseCode);
        KaitaiCodeWorkerApi.setCompilationTarget({
            result: compiledGrammar.debug,
            ksyTypes: compiledGrammar.ksyTypes,
            ksySchema: compiledGrammar.ksySchema,
            jsMainClassName: compiledGrammar.jsMainClassName,
            mainClassId: compiledGrammar.jsMainClassName
        });
    } catch (ex) {
        useErrorStore().setError(ex);
    }
};