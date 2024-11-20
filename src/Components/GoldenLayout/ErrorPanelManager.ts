import GoldenLayout from "golden-layout";
import {GoldenLayoutUI} from "./GoldenLayoutUI";
import {GL_ERRORS_TAB_ID, GL_MAIN_VIEW_ID} from "./GoldenLayoutUIConfig";
import {useErrorStore} from "../ErrorPanel/Store/ErrorStore";

export class ErrorPanelManager {
    private errorTabContainer: GoldenLayout.Container;

    constructor(private layout: GoldenLayoutUI) {
        const self = this;
        this.layout.goldenLayout.registerComponent(GL_ERRORS_TAB_ID, function (container: GoldenLayout.Container, componentState: any) {
            self.errorTabContainer = container;
        });
    }

    setMessage(errorMessage: string) {
        if (!this.errorTabContainer) {
            this.initErrorTabContainer();
        }
        this.prepareAndAssignMessageToErrorTab(errorMessage);
    }

    close() {
        if (this.errorTabContainer) {
            this.errorTabContainer.close();
        }
    }

    private prepareAndAssignMessageToErrorTab(errorMessage: string) {
        const errorMessageHtml = $("<div/>")
            .text(errorMessage)
            .html()
            .replace(/\n|\\n/g, "<br>");
        this.errorTabContainer.getElement()
            .empty()
            .append($("<div class='error-panel'>").html(errorMessageHtml));
    }


    private initErrorTabContainer() {
        const errorComponentConfig = {type: "component", componentName: GL_ERRORS_TAB_ID, title: "Errors", isClosable: true};
        this.layout.getLayoutNodeById(GL_MAIN_VIEW_ID).addChild(errorComponentConfig);
        this.initContainerProps();
    }


    private initContainerProps() {
        const store = useErrorStore();
        this.errorTabContainer.setSize(0, store.size);
        this.errorTabContainer.on("destroy", () => {
            this.errorTabContainer = null;
        });
        this.errorTabContainer.on("resize", () => {
            store.setErrorTabSize(this.errorTabContainer.getElement().outerHeight());
        });
        this.errorTabContainer.on("close", () => {
            this.errorTabContainer = null;
        });
    }
}