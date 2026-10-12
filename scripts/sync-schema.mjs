// Keeps src/shared/ in step with the web repo, which owns the shared schema.
//
//   node scripts/sync-schema.mjs <web-commit-sha>   copy the files at that commit, pin the SHA
//   node scripts/sync-schema.mjs --check            fail if the copy differs from the pinned commit
//
// Update order: merge the web PR first, then run this with the merge commit and open a mobile PR.
import { readFile, writeFile } from "node:fs/promises";

const REPO = "AhmedGamalFarouk/Circle";
const FILES = ["src/shared/schema.mjs", "src/shared/schema.test.mjs"]; // same path in both repos
const SHA_FILE = "src/shared/schema.sha";

// Windows checkouts may turn LF into CRLF; the published bytes are LF.
const lf = (text) => text.replace(/\r\n/g, "\n");

async function fetchFile(sha, path) {
    const url = `https://raw.githubusercontent.com/${REPO}/${sha}/${path}`;
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.text();
            lastError = new Error(`HTTP ${res.status}`);
        } catch (err) {
            lastError = err;
        }
    }
    console.error(`Could not fetch ${url} (${lastError.message}). This is a network or SHA problem, not a schema mismatch.`);
    process.exit(2);
}

const arg = process.argv[2];

if (arg === "--check") {
    const sha = (await readFile(SHA_FILE, "utf8")).trim();
    let failed = false;
    for (const path of FILES) {
        const [local, remote] = [lf(await readFile(path, "utf8")), lf(await fetchFile(sha, path))];
        if (local !== remote) {
            failed = true;
            console.error(`${path} differs from ${REPO}@${sha}.`);
        }
    }
    if (failed) {
        console.error("Edit the web copy instead, then run: node scripts/sync-schema.mjs <web merge commit sha>");
        process.exit(1);
    }
    console.log(`src/shared matches ${REPO}@${sha}.`);
} else if (/^[0-9a-f]{40}$/.test(arg ?? "")) {
    for (const path of FILES) await writeFile(path, lf(await fetchFile(arg, path)));
    await writeFile(SHA_FILE, `${arg}\n`);
    console.log(`Copied ${FILES.join(", ")} from ${REPO}@${arg}.`);
} else {
    console.error("Usage: node scripts/sync-schema.mjs <40-char web commit sha> | --check");
    process.exit(2);
}
