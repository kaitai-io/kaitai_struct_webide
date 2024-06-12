const { readdirSync, statSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

console.log("[genKaitaiFsFiles.js] Running")

function recursiveFind(dir, pattern, results = []) {
    const files = readdirSync(dir, "utf-8")
        .map(fn => join(dir, fn))
        .map(fn => ({ stat: statSync(fn), fn }));
    results.push.apply(
        results,
        files
            .filter(s => s.stat.isFile())
            .map(s => s.fn)
            .filter(fn => pattern.test(fn))
    );
    files
        .filter(s => s.stat.isDirectory())
        .forEach(s => recursiveFind(s.fn, pattern, results));
    return results;
}

function generate(outDir) {
    const files =
        recursiveFind("formats/", /\.ksy$/)
        .concat(recursiveFind("samples/", /.+/))
        .map(path => path.replace(/\\/g,'/'));
    files.sort();
    const info = `/* Generated file do not push changes to repo,
 * To regenerate formats, run command:
 *   npm run generate-formats
 */
 `
    const js = `export const kaitaiFsFiles: string[] = ${JSON.stringify(files, null, 4)};`;

    mkdirSync(outDir + "js", { recursive: true });
    writeFileSync(outDir + "src/kaitaiFsFiles.ts", info + js);
}

function main() {
    const outDir = process.argv.length > 2 ? process.argv[2] + "/" : "";
    generate(outDir);
}

if (!module.parent) {
    main();
}

module.exports = generate;

console.log("[genKaitaiFsFiles.js] Finished")
