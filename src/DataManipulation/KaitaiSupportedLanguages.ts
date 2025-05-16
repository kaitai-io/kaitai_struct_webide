export interface SupportedLanguage {
    kaitaiLangCode: string;
    monacoEditorLangCode: string;
    isDebug: boolean;
    text: string;
    extension: string;
}

export const KaitaiSupportedLanguages: SupportedLanguage[] = [
    {kaitaiLangCode: "cpp_stl", monacoEditorLangCode: "cpp", isDebug: false, text: "CPP-STL", extension: "cpp"},
    {kaitaiLangCode: "csharp", monacoEditorLangCode: "csharp", isDebug: false, text: "C#", extension: "cs"},
    {kaitaiLangCode: "go", monacoEditorLangCode: "go", isDebug: false, text: "Go", extension: "go"},
    {kaitaiLangCode: "graphviz", monacoEditorLangCode: "graphql", isDebug: false, text: "Graphviz", extension: "graphql"},
    {kaitaiLangCode: "java", monacoEditorLangCode: "java", isDebug: false, text: "Java", extension: "java"},
    {kaitaiLangCode: "java", monacoEditorLangCode: "java", isDebug: true, text: "Java (debug)", extension: "java"},
    {kaitaiLangCode: "javascript", monacoEditorLangCode: "javascript", isDebug: false, text: "JavaScript", extension: "js"},
    {kaitaiLangCode: "javascript", monacoEditorLangCode: "javascript", isDebug: true, text: "JavaScript (debug)", extension: "js"},
    {kaitaiLangCode: "lua", monacoEditorLangCode: "lua", isDebug: false, text: "Lua", extension: "lua"},
    {kaitaiLangCode: "nim", monacoEditorLangCode: "nim", isDebug: false, text: "Nim", extension: "nim"},
    {kaitaiLangCode: "perl", monacoEditorLangCode: "perl", isDebug: false, text: "Perl", extension: "pm"},
    {kaitaiLangCode: "php", monacoEditorLangCode: "php", isDebug: false, text: "PHP", extension: "php"},
    {kaitaiLangCode: "python", monacoEditorLangCode: "python", isDebug: false, text: "Python", extension: "py"},
    {kaitaiLangCode: "ruby", monacoEditorLangCode: "ruby", isDebug: false, text: "Ruby", extension: "rb"},
    {kaitaiLangCode: "ruby", monacoEditorLangCode: "ruby", isDebug: true, text: "Ruby (debug)", extension: "rb"},
    {kaitaiLangCode: "rust", monacoEditorLangCode: "rust", isDebug: false, text: "Rust", extension: "rs"},
];