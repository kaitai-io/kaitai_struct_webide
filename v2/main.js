define(["require", "exports", "./src/app"], function (require, exports, app_1) {
    "use strict";
    function configure(aurelia) {
        aurelia.use.standardConfiguration().developmentLogging();
        aurelia.start().then(a => a.setRoot("src/app")).then(a => app_1.App.instance.start());
    }
    exports.configure = configure;
});
//# sourceMappingURL=main.js.map