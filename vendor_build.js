const jsyaml = require("js-yaml");
const { readFileSync, copyFileSync, readdirSync, statSync, mkdirSync } = require("fs");
const { join, basename, dirname } = require("path");
const firstBy = require("thenby");

function isDirectory(file) {
    return statSync(file).isDirectory();
}

function copyOverwrite(src, dst) {
    if (isDirectory(src)) {
        readdirSync(src).forEach(file =>
            copyOverwrite(join(src, file), join(dst, file))
        );
    } else {
        let dstFile, dstDir;
        if (dst.endsWith("/")) {
            dstDir = dst;
            dstFile = join(dst, basename(src));
        } else {
            dstDir = dirname(dst);
            dstFile = dst;
        }
        console.log("  copying", src, "to", dstFile);
        mkdirSync(dstDir, { recursive: true });
        copyFileSync(src, dstFile);
    }
}

function main() {
    const filename = "vendor.yaml";
    const vendorYaml = readFileSync(filename, "utf8");
    const vendor = jsyaml.load(vendorYaml, { schema: jsyaml.CORE_SCHEMA, filename });
    const sortedLibs = Object.entries(vendor["libs"]).sort(
        firstBy(([, lib]) => lib["priority"])
    );
    for (const [libName, lib] of sortedLibs) {
        if (!lib["npmDir"] || !lib["files"]) {
            continue;
        }
        console.log("Processing:", libName);
        const distDir = `./lib/_npm/${lib["distDir"] || lib["npmDir"]}/`;
        for (let file of lib["files"]) {
            const allFilesInDir = file.endsWith("/*");
            if (allFilesInDir) {
                file = file.replace("/*", "");
            }

            srcPattern = `./node_modules/${lib["npmDir"]}/${file}`;
            if (isDirectory(srcPattern) && !allFilesInDir) {
                copyOverwrite(srcPattern, join(distDir, file));
            } else {
                copyOverwrite(srcPattern, distDir);
            }
        }
    }

    require("./vendor_license");
}

main();
