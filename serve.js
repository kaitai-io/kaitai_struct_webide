const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const express = require("express");
const ts = require("typescript");
const genKaitaiFsFiles = require("./genKaitaiFsFiles");

const port = 8000;
const watchPattern = /(\.html$)|(^js\/)|(^css\/)$/;
const ignorePattern = /node_modules/;
const tsFormatHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine
};

const app = express();

function reportDiagnostic(diagnostic) {
    console.error(
        `Error ${diagnostic.code}:`,
        ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            tsFormatHost.getNewLine()
        )
    );
}

function reportWatchStatusChanged(diagnostic) {
    console.info(ts.formatDiagnostic(diagnostic, tsFormatHost).trimRight());
}

function startWatcher() {
    console.log("Starting typescript compiler...");
    const configPath = ts.findConfigFile(
        "./",
        ts.sys.fileExists,
        "tsconfig.json"
    );
    if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
    }
    const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
    const host = ts.createWatchCompilerHost(
        configPath,
        {},
        ts.sys,
        createProgram,
        reportDiagnostic,
        reportWatchStatusChanged
    );
    return ts.createWatchProgram(host);
}

function findLatestChange(dir = ".", latestChange = 0) {
    const fns = readdirSync(dir, "utf-8");
    for (const fn of fns) {
        const path = join(dir, fn);
        const stats = statSync(path);
        if (stats.isDirectory() && !ignorePattern.test(path)) {
            latestChange = findLatestChange(path, latestChange);
        } else if (stats.isFile() && watchPattern.test(path)) {
            if (stats.mtimeMs > latestChange) {
                latestChange = stats.mtimeMs;
            }
        }
    }
    return latestChange;
}

app.get("/onchange", (req, res, next) => {
    const initialChange = findLatestChange();
    const checkChange = () => {
        if (findLatestChange() > initialChange) {
            res.send({ changed: true });
            return;
        }
        setTimeout(checkChange, 500);
    };
    checkChange();
});

app.use(express.static("."));

function main() {
    genKaitaiFsFiles('');
    if (process.argv.includes("--compile")) {
        startWatcher();
    }

    app.listen(port, () => console.log(`Listening on ${port}.`));
}

main();
