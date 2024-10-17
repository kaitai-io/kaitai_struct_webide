export interface SupportedLanguage {
    kaitaiLangCode: string;
    monacoEditorLangCode: string;
    isDebug: boolean;
    text: string;
}

export const KaitaiSupportedLanguages: SupportedLanguage[] = [
    {kaitaiLangCode: "cpp_stl", monacoEditorLangCode: "cpp", isDebug: false, text: "CPP-STL"},
    {kaitaiLangCode: "csharp", monacoEditorLangCode: "csharp", isDebug: false, text: "C#"},
    {kaitaiLangCode: "go", monacoEditorLangCode: "go", isDebug: false, text: "Go"},
    {kaitaiLangCode: "graphviz", monacoEditorLangCode: "graphql", isDebug: false, text: "Graphviz"},
    {kaitaiLangCode: "java", monacoEditorLangCode: "java", isDebug: false, text: "Java"},
    {kaitaiLangCode: "java", monacoEditorLangCode: "java", isDebug: true, text: "Java (debug)"},
    {kaitaiLangCode: "javascript", monacoEditorLangCode: "javascript", isDebug: false, text: "JavaScript"},
    {kaitaiLangCode: "javascript", monacoEditorLangCode: "javascript", isDebug: true, text: "JavaScript (debug)"},
    {kaitaiLangCode: "lua", monacoEditorLangCode: "lua", isDebug: false, text: "Lua"},
    {kaitaiLangCode: "nim", monacoEditorLangCode: "nim", isDebug: false, text: "Nim"},
    {kaitaiLangCode: "perl", monacoEditorLangCode: "perl", isDebug: false, text: "Perl"},
    {kaitaiLangCode: "php", monacoEditorLangCode: "php", isDebug: false, text: "PHP"},
    {kaitaiLangCode: "python", monacoEditorLangCode: "python", isDebug: false, text: "Python"},
    {kaitaiLangCode: "ruby", monacoEditorLangCode: "ruby", isDebug: false, text: "Ruby"},
    {kaitaiLangCode: "ruby", monacoEditorLangCode: "ruby", isDebug: true, text: "Ruby (debug)"},
];