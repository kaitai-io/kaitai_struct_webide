import {readdirSync, statSync, writeFileSync} from "fs";
import {join} from "path";

console.log("[genKaitaiFsFiles.js] Running")

function recursiveFind(dir, pattern, results = []) {
    const files = readdirSync(dir, "utf-8")
        .map(fn => join(dir, fn))
        .map(fn => ({stat: statSync(fn), fn}));
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
        recursiveFind("public/formats/", /\.ksy$/)
            .concat(recursiveFind("public/samples/", /.+/))
            .map(path => path.replace(/\\/g, '/'))
            .map(path => path.replace(/^public\//gm, ''))
    files.sort();
    const info = `/* Generated file do not push changes to repo!
 * To regenerate formats, run command:
 *   npm run generate-formats
 */
 `
    const preparedFormatsFileContent = `export const kaitaiFsFiles: string[] = ${JSON.stringify(files, null, 4)};`;
    writeFileSync(outDir + "src/kaitaiFsFiles.ts", info + preparedFormatsFileContent);
}

function main() {
    const outDir = process.argv.length > 2 ? process.argv[2] + "/" : "";
    generate(outDir);
}

main();

console.log("[genKaitaiFsFiles.js] Finished")
