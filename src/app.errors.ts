import { htmlescape } from "./utils";
import { app, ga } from "./app";

export class ErrorWindowHandler {
    lastErrWndSize = 100; // 34
    errorWnd: GoldenLayout.Container = null;

    constructor(public parentContainer: GoldenLayout.ContentItem) { }

    async show(...args: any[]) {
        console.error.apply(window, args);
        console.log('errorWnd', this.errorWnd);
        var errMsg = args.filter(x => x.toString() !== {}.toString()).join(" ");
        if (!this.errorWnd) {
            var newPanel = app.ui.layout.addPanel();
            this.parentContainer.addChild({ type: "component", componentName: newPanel.componentName, title: "Errors" });
            this.errorWnd = await newPanel.donePromise;
            console.log('errorWnd', this.errorWnd);
            this.errorWnd.setSize(0, this.lastErrWndSize);
            this.errorWnd.getElement().addClass('errorWindow');
        }
        this.errorWnd.on("resize", () => this.lastErrWndSize = this.errorWnd.getElement().outerHeight());
        this.errorWnd.on("destroy", () => { ga("errorwnd", "destroy"); this.errorWnd = null; });
        this.errorWnd.on("close", () => { ga("errorwnd", "close"); this.errorWnd = null; });
        this.errorWnd.getElement().empty().append($("<div>").html(htmlescape(errMsg).replace(/\n|\\n/g, "<br>")));
    }

    hide() {
        if (this.errorWnd) {
            try { this.errorWnd.close(); } catch (e) { /* nop */ }
            this.errorWnd = null;
        }
    }

    handle(error: any) {
        if (error)
            this.show("Parse error" + (error.name ? ` (${error.name})` : "") + `: ${error.message}\nCall stack: ${error.stack}`, error);
        else
            this.hide();
    }
}

