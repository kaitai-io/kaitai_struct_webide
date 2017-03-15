define(["require", "exports", "bowser"], function (require, exports, bowser) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (localStorage.getItem('hideUnsupported') === 'true' || bowser.check({ chrome: "53", firefox: "49" }, true))
        $('#unsupportedBrowser').hide();
    $('#unsupportedBrowser .closeBtn').on('click', () => {
        localStorage.setItem('hideUnsupported', 'true');
        $('#unsupportedBrowser').hide();
    });
});
//# sourceMappingURL=app.unsupportedBrowser.js.map