
            ui.parsedDataTree = parsedToTree(jsTree, exportedRoot, e => handleError(error || e), () => ui.hexViewer.onSelectionChanged());
localStorage.setItem('lastVersion', '0.1.0.2');
        saveFile(new Uint8Array(inputContent, start, end - start + 1), newFn);
    });
});
//# sourceMappingURL=app.js.map