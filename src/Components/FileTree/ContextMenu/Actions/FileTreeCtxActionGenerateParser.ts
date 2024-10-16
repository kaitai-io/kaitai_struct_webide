import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {h} from "vue";
import {MenuChildren, MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {CompilationTarget, CompilerService} from "../../../../DataManipulation/CompilationModule/CompilerService";
import {YamlFileInfo} from "../../../../DataManipulation/CompilationModule/JsImporter";
import {CurrentGoldenLayout} from "../../../GoldenLayout/GoldenLayoutUI";
import {useIdeSettingsStore} from "../../../../Stores/IdeSettingsStore";
import {SupportedLanguage, KaitaiSupportedLanguages} from "../../../../DataManipulation/KaitaiSupportedLanguages";

export const mapFileTreeDisplayNodeToYaml = async (item: TreeNodeDisplay): Promise<YamlFileInfo> => {
    const fileSystemsStore = useFileSystems();
    return {
        storeId: item.storeId,
        filePath: item.fullPath,
        fileContent: await fileSystemsStore.getFile(item.storeId, item.fullPath) as string
    };
};


export const FileTreeCtxActionGenerateParser = (item: TreeNodeDisplay): MenuItem => {
    const createOnlyMainFileTab = (compiled: CompilationTarget, language: SupportedLanguage) => {
        const [name, content] = Object.entries(compiled.result)[0];
        CurrentGoldenLayout.addDynamicCodeTab(name, content, language.aceEditorLangCode);
        return true;
    };

    const createTabsForAllGeneratedFiles = (compiled: CompilationTarget, language: SupportedLanguage) => {
        Object.entries(compiled.result).reverse().forEach(([name, content]) => {
            CurrentGoldenLayout.addDynamicCodeTab(name, content, language.aceEditorLangCode);
        });
        return true;
    };

    const generateParserForLanguage = async (language: SupportedLanguage) => {
        const yamlInfo = await mapFileTreeDisplayNodeToYaml(item);
        const compiled = await new CompilerService().compileSingleTarget(yamlInfo, language.kaitaiLangCode, language.isDebug);
        const ideSettings = useIdeSettingsStore();
        ideSettings.generateOnlyMainFile
            ? createOnlyMainFileTab(compiled, language)
            : createTabsForAllGeneratedFiles(compiled, language);
    };

    const generateParsersSubmenu: MenuChildren = KaitaiSupportedLanguages.map(language => ({
        label: language.text,
        onClick: () => generateParserForLanguage(language),
        customClass: "context-menu-item",
    }));

    return {
        label: "Generate Parser",
        hidden: [TreeNodeDisplayType.KSY_FILE].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        disabled: item.type !== TreeNodeDisplayType.KSY_FILE,
        icon: () => h("i", {class: "glyphicon glyphicon-flash", style: {height: "16px"}}),
        children: generateParsersSubmenu
    };
};