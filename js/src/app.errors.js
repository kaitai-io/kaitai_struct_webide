define(["require", "exports", "app.layout"], function (require, exports, app_layout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lastErrWndSize = 100; // 34
    function showError(...args) {
        console.log.apply(window, args);
        var errMsg = args.filter(x => x.toString() !== {}.toString()).join(' ');
        var container = app_layout_1.getLayoutNodeById('mainArea');
        if (!app_layout_1.ui.errorWindow) {
            container.addChild({ type: 'component', componentName: 'errorWindow', title: 'Errors' });
            app_layout_1.ui.errorWindow.setSize(0, lastErrWndSize);
        }
        app_layout_1.ui.errorWindow.on('resize', () => lastErrWndSize = app_layout_1.ui.errorWindow.getElement().outerHeight());
        app_layout_1.ui.errorWindow.on('close', () => app_layout_1.ui.errorWindow = null);
        app_layout_1.ui.errorWindow.getElement().children().html(htmlescape(errMsg).replace(/\n|\\n/g, '<br>'));
    }
    exports.showError = showError;
    function hideErrors() {
        if (app_layout_1.ui.errorWindow) {
            try {
                app_layout_1.ui.errorWindow.close();
            }
            catch (e) { }
            app_layout_1.ui.errorWindow = null;
        }
    }
    function handleError(error) {
        if (error)
            showError('Parse error' + (error.name ? ` (${error.name})` : '') + `: ${error.message}\nCall stack: ${error.stack}`, error);
        else
            hideErrors();
    }
    exports.handleError = handleError;
});
//# sourceMappingURL=app.errors.js.map