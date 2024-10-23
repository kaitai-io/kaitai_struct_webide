import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {CompilerService, KaitaiCompilationResult} from "../DataManipulation/CompilationModule/CompilerService";
import {CurrentGoldenLayout} from "../Components/GoldenLayout/GoldenLayoutUI";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";
import {useIdeSettingsStore} from "../Stores/IdeSettingsStore";

/**
 * After switching to Worker being a module instead of plain JS file it fulfils commonJS module requirements:
 *
 *   else if (typeof exports === 'object' && exports !== null && typeof exports.nodeType !== 'number') {
 *     factory(exports, require('kaitai-struct/KaitaiStream'));
 *
 * Those two lines need to be removed for Worker to function properly.
 */
const prepareDebugCodeForWorkerAsModule = (debug: KaitaiCompilationResult) => {
    const store = useIdeSettingsStore();
    const startingIndexOfCommonJSModulesCheck = 5;

    return !store.removeCommonJsHeader
        ? Object.values(debug).join("")
        : Object.values(debug)
            .map((content: string) => {
                let splitContent = content.split("\n");
                splitContent.splice(startingIndexOfCommonJSModulesCheck, 2);
                return splitContent.join("\n");
            }).join("");
};

export const compileInternalDebugAndRelease = async (yamlInfo: YamlFileInfo) => {
    const compiledGrammar = await new CompilerService().compileDebugAndReleaseTargets(yamlInfo, "javascript");
    const debugCode = prepareDebugCodeForWorkerAsModule(compiledGrammar.debug);
    const releaseCode = Object.values(compiledGrammar.release).join("");
    CurrentGoldenLayout.updateReleaseAndDebugCodeTabs(debugCode, releaseCode);
    KaitaiCodeWorkerApi.setCodeAction(debugCode, compiledGrammar.jsMainClassName, compiledGrammar.ksyTypes);
};