import {ServiceManager} from "ace-linters/build/service-manager";

let manager = new ServiceManager(self);

manager.registerService("html", {
    module: () => import("ace-linters/build/html-service"),
    className: "HtmlService",
    modes: "html",
});