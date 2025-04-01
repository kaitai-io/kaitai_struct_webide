import "./Utils/RedirectToHttps";
import "../css/app.css";
import "../css/scrollbars.css";
import "../css/contextmenu.css";

import {createApp} from "vue";
import {createPinia} from "pinia";
import ContextMenu from "@imengyu/vue3-context-menu";
import App from "./App.vue";
import HexViewer from "./Components/HexViewer/HexViewer.vue";
import ParsedTree from "./Components/ParsedTree/ParsedTree.vue";
import FileTree from "./Components/FileTree/FileTree.vue";
import ConverterPanel from "./Components/ConverterPanel/ConverterPanel.vue";
import InfoPanel from "./Components/InfoPanel/InfoPanel.vue";
import KsyEditorPanel from "./Components/Dockview/KsyEditorPanel.vue";
import ErrorPanel from "./Components/ErrorPanel/ErrorPanel.vue";
import ErrorTab from "./Components/Dockview/Tabs/ErrorTab.vue";
import NoCloseTab from "./Components/Dockview/Tabs/NoCloseTab.vue";
import DynamicCodePanel from "./Components/Dockview/DynamicCodePanel.vue";


const vueApp = createApp(App);
vueApp.use(createPinia());
vueApp.component("NoCloseTab", NoCloseTab);
vueApp.component("ErrorTab", ErrorTab);
vueApp.component("ErrorPanel", ErrorPanel);
vueApp.component("DynamicCodePanel", DynamicCodePanel);
vueApp.component("KsyEditorPanel", KsyEditorPanel);
vueApp.component("HexViewer", HexViewer);
vueApp.component("ParsedTree", ParsedTree);
vueApp.component("FileTree", FileTree);
vueApp.component("ConverterPanel", ConverterPanel);
vueApp.component("InfoPanel", InfoPanel);
vueApp.use(ContextMenu);
vueApp.mount("body");
