const jsyaml = require("js-yaml");
const { readdirSync, readFileSync, writeFileSync, statSync } = require("fs");
const { join, basename } = require("path");
const firstBy = require("thenby");

function isLicenseFilename(name) {
    const fn = basename(name);
    return fn.startsWith("LICENSE") || fn.startsWith("license");
}

function findLicenses(dst) {
    return readdirSync(dst)
        .map(file => join(dst, file))
        .filter(isLicenseFilename);
}

function main() {
    const filename = "vendor.yaml";
    const vendorYaml = readFileSync(filename, "utf8");
    const vendor = jsyaml.load(vendorYaml, { schema: jsyaml.CORE_SCHEMA, filename });
    let licResult = "";
    let wikiResult = "# 3rd-party libraries\n\n";
    const sortedLibs = Object.entries(vendor["libs"]).sort(
        firstBy(([libName]) => libName)
    );
    for (const [libName, lib] of sortedLibs) {
        console.log("Processing", libName);
        const distDir = `lib/${lib["npmDir"] ? "_npm/" : ""}${lib["distDir"] || lib["npmDir"]}/`;
        const licFns = findLicenses(distDir);

        if (licFns.length != 1) {
            console.log(`License not found: ${distDir}:`, licFns);
            continue;
        }

        licResult += "=".repeat(80) + "\n";
        licResult += " ".repeat(((80 - libName.length) / 2) | 0) + libName + "\n";
        licResult += "\n";
        licResult += `License name: ${lib["licenseName"]}\n`;
        licResult += `  License URL: ${lib["licenseUrl"]}\n`;
        licResult += `  License applies to files under the folder ${distDir}\n`;
        licResult += "\n";

        wikiResult += `## ${libName}\n`;

        if (lib["website"]) {
            licResult += `Website: ${lib["website"]}\n`;
            wikiResult += `Website: ${lib["website"]}\n\n`;
        }

        if (lib["source"]) {
            licResult += `Source: ${lib["source"]}\n`;
            wikiResult += `Source: ${lib["source"]}\n\n`;
        }

        wikiResult += `License: ${lib["licenseName"]} (${lib["licenseUrl"]})\n\n`;

        licResult += "=".repeat(80) + "\n";
        licResult +=
            readFileSync(licFns[0], { encoding: "utf-8" })
                .trim()
                .replace(/\r\n/g, "\n") + "\n";
        licResult += "=".repeat(80) + "\n\n";
    }

    writeFileSync("LICENSE-3RD-PARTY.txt", licResult.trim());
    writeFileSync("docs/wiki/3rd-party-libraries.md", wikiResult.trim());
}

main();
