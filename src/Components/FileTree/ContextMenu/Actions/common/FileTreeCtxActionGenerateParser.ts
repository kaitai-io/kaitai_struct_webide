import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {h} from "vue";
import {MenuChildren, MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {CompilationTarget, CompilerService} from "../../../../../DataManipulation/CompilationModule/CompilerService";
import {YamlFileInfo} from "../../../../../DataManipulation/CompilationModule/JsImporter";
import {useIdeSettingsStore} from "../../../../../Stores/IdeSettingsStore";
import {KaitaiSupportedLanguages, SupportedLanguage} from "../../../../../DataManipulation/KaitaiSupportedLanguages";
import {BoltIcon} from "@heroicons/vue/16/solid";
import {FILE_SYSTEM_TYPE_DIST} from "../../../FileSystems/LocalStorageFileSystem";

export const mapFileTreeDisplayNodeToYaml = async (item: TreeNodeDisplay): Promise<YamlFileInfo> => {
    const fileSystemsStore = useFileSystems();
    return {
        storeId: item.storeId,
        filePath: item.fullPath,
        fileContent: await fileSystemsStore.getFile(item.storeId, item.fullPath) as string
    };
};


export const FileTreeCtxActionGenerateParser = (item: TreeNodeDisplay): MenuItem => {

    const toSimpleSnakeCase = (name: string) => {
        return name.replace(/\W+/g, " ")
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join("_");
    };

    const createOnlyMainFileTab = (compiled: CompilationTarget, language: SupportedLanguage) => {
        const record = Object.entries(compiled.result)
            .find(([name, content]) => {
                const nameInSnakeCase = toSimpleSnakeCase(name);
                return nameInSnakeCase.indexOf(compiled.mainClassId) !== -1;
            });
        if (!record) {
            console.error("[GenerateOnlyMainFile] Could not find main file using schema!");
            return;
        }
        const [name, content] = record;
        useFileSystems().addFile(FILE_SYSTEM_TYPE_DIST, `${language.monacoEditorLangCode}/${name}`, content);

    };

    const createTabsForAllGeneratedFiles = async (compiled: CompilationTarget, language: SupportedLanguage) => {
        for (const [name, content] of Object.entries(compiled.result)) {
            await useFileSystems().addFile(FILE_SYSTEM_TYPE_DIST, `${language.monacoEditorLangCode}/${name}`, content);
        }
    };

    const generateParserForLanguage = async (language: SupportedLanguage) => {
        const yamlInfo = await mapFileTreeDisplayNodeToYaml(item);
        const compiled = await CompilerService.compileSingleTarget(yamlInfo, language.kaitaiLangCode, language.isDebug);
        if (compiled.status === "FAILURE") return;
        const ideSettings = useIdeSettingsStore();
        ideSettings.generateOnlyMainFile
            ? createOnlyMainFileTab(compiled.result as CompilationTarget, language)
            : createTabsForAllGeneratedFiles(compiled.result as CompilationTarget, language);
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
        icon: () => h(BoltIcon),
        children: generateParsersSubmenu
    };
};