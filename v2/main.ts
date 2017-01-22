import {App} from "./src/app";

export function configure(aurelia) {
    aurelia.use.standardConfiguration().developmentLogging();
    aurelia.start().then(a => a.setRoot("src/app")).then(a => App.instance.start());
}