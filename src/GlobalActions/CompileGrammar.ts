import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {useAceEditorStore} from "../Stores/AceEditorStore";
import {CompilerService} from "../DataManipulation/CompilationModule/CompilerService";
import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";

export const compileGrammarAction = async (yamlInfo: YamlFileInfo) => {
    const currentEditorStore = useAceEditorStore();
    const compiledGrammar = await new CompilerService().compileDebugAndReleaseTargets(yamlInfo, "javascript");
    const debugCode = Object.values(compiledGrammar.debug).join("");
    const releaseCode = Object.values(compiledGrammar.release).join("");
    currentEditorStore?.releaseCodeEditor.setValue(releaseCode, -1);
    currentEditorStore?.debugCodeEditor.setValue(debugCode, -1);
    codeExecutionWorkerApi.setCodeAction(debugCode, compiledGrammar.jsMainClassName, compiledGrammar.ksyTypes);
};