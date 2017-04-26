import { htmlescape } from "./utils";
import { ga } from "./app";

export class ErrorWindowHandler {
    lastErrWndSize = 100; // 34
    errorWnd: GoldenLayout.ContentItem = null;

    constructor(public parentContainer: GoldenLayout.ContentItem) { }

    show(...args: any[]) {
        console.error.apply(window, args);
        var errMsg = args.filter(x => x.toString() !== {}.toString()).join(" ");
        if (!this.errorWnd) {
            this.errorWnd = this.parentContainer.layoutManager._$normalizeContentItem({ type: "component", componentName: "errorWindow", title: "Errors" }, this.parentContainer);
            this.parentContainer.addChild(this.errorWnd);
            <any>this.errorWnd.setSize(0, this.lastErrWndSize);
        }
        this.errorWnd.on("resize", () => this.lastErrWndSize = this.errorWnd.getElement().outerHeight());
        this.errorWnd.on("destroy", () => { ga("errorwnd", "destroy"); });
        this.errorWnd.on("close", () => { ga("errorwnd", "close"); this.errorWnd = null; });
        this.errorWnd.getElement().children().html(htmlescape(errMsg).replace(/\n|\\n/g, "<br>"));
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

