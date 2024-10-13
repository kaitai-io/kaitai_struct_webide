import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {CompilerService} from "../DataManipulation/CompilationModule/CompilerService";
import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";
import {CurrentGoldenLayout} from "../v1/GoldenLayout/GoldenLayoutUI";

export const compileGrammarAction = async (yamlInfo: YamlFileInfo) => {
    const compiledGrammar = await new CompilerService().compileDebugAndReleaseTargets(yamlInfo, "javascript");
    const debugCode = Object.values(compiledGrammar.debug).join("");
    const releaseCode = Object.values(compiledGrammar.release).join("");
    CurrentGoldenLayout.updateReleaseAndDebugCodeTabs(debugCode, releaseCode);
    codeExecutionWorkerApi.setCodeAction(debugCode, compiledGrammar.jsMainClassName, compiledGrammar.ksyTypes);
};