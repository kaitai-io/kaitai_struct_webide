const { readFileSync, writeFileSync } = require("fs");
const { exec } = require("child_process");

const { SENTRY_DSN, SENTRY_ENV } = process.env;

const SENTRY_TEMPLATE = SENTRY_DSN && SENTRY_ENV ? `
    <script src="https://cdn.ravenjs.com/3.17.0/raven.min.js" crossorigin="anonymous"></script>
    <script>
            Raven.config('${SENTRY_DSN}', {
                    environment: "${SENTRY_ENV}",
                    release: "{{SENTRY_RELEASE}}",
            }).install();
    </script>
` : "";

const outDir = process.argv.length > 2 ? process.argv[2] : "out";

function fileAction(fn, action) {
    writeFileSync(fn, action(readFileSync(fn, { encoding: "utf-8" })));
}

function appendAfter(str, afterStr, appendStr) {
    const i = str.indexOf(afterStr) + afterStr.length;
    return str.slice(0, i) + appendStr + str.slice(i);
}

function fetchGitCommitInfo() {
    return new Promise((resolve, reject) =>
        exec("git log -1 --format=%H,%ct", (err, stdout) => {
            if (err) {
                reject(err);
            } else {
                const [commitId, commitTs] = stdout.trim().split(",");
                const commitDate = new Date(Number(commitTs)*1000);
                resolve({ commitId, commitDate });
            }
        })
    );
}

function formatCommitDate(d) {
    return String(d.getUTCFullYear()).padStart(2, '0') + '-'
         + String(d.getUTCMonth() + 1).padStart(2, '0') + '-'
         + String(d.getUTCDate()).padStart(2, '0') + ' '
         + String(d.getUTCHours()).padStart(2, '0') + ':'
         + String(d.getUTCMinutes()).padStart(2, '0') + ':'
         + String(d.getUTCSeconds()).padStart(2, '0');
}

async function main() {
    const { commitId, commitDate } = await fetchGitCommitInfo();
    const scriptAppend =
        SENTRY_TEMPLATE.replace("{{SENTRY_RELEASE}}", commitId);
    if (scriptAppend) {
        fileAction(outDir + "/index.html", html =>
            appendAfter(html, "<!-- SCRIPT_INJECTION_POINT -->", scriptAppend)
        );
    }
    fileAction(outDir + "/js/v1/app.js", html =>
        html
            .replace(
                'kaitaiIde.commitId = "";',
                `kaitaiIde.commitId = "${commitId}";`
            )
            .replace(
                'kaitaiIde.commitDate = "";',
                `kaitaiIde.commitDate = "${formatCommitDate(commitDate)}";`
            )
    );
}

main().catch(err => console.error(err));
