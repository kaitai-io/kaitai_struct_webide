import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {h} from "vue";
import {MenuChildren, MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {CompilationTarget, CompilerService} from "../../../../../DataManipulation/CompilationModule/CompilerService";
import {YamlFileInfo} from "../../../../../DataManipulation/CompilationModule/JsImporter";
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

    const saveAllFiles = async (compiled: CompilationTarget, language: SupportedLanguage) => {
        for (const [name, content] of Object.entries(compiled.result)) {
            const fileName = name.startsWith("/") ? name.substring(1) : name;
            await useFileSystems().addFile(FILE_SYSTEM_TYPE_DIST, `${language.monacoEditorLangCode}/${fileName}`, content);
        }
    };

    const generateParserForLanguage = async (language: SupportedLanguage) => {
        const yamlInfo = await mapFileTreeDisplayNodeToYaml(item);
        const compiled = await CompilerService.compileSingleTarget(yamlInfo, language.kaitaiLangCode, language.isDebug);
        console.log(compiled);
        if (compiled.status === "FAILURE") return;
        saveAllFiles(compiled.result as CompilationTarget, language);
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