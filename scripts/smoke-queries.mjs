#!/usr/bin/env node
/* eslint-disable no-console */
// Read-only checks to run after deploying firestore.rules + firestore.indexes.json
// (PLAN-C11-D4, PR 1). The emulator ignores indexes, so this is the only place a
// missing index shows up before users hit it.
//
//   cd scripts && npm install                     (once)
//   node smoke-queries.mjs --project circle-26a87 --credentials <service-account.json>
//
// 1. Runs the three queries the C11 clients depend on; a missing index fails them.
// 2. Counts circles whose createdAt is missing or not a Timestamp, and member docs
//    without userId. Both must be 0 before the web/mobile C11 PRs merge.
// Exits non-zero naming every failed check.
import { readFileSync } from "node:fs";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const option = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
};
const project = option("--project");
if (!project) {
    console.error("Pass --project <id>.");
    process.exit(2);
}
const credentials = option("--credentials");
initializeApp({
    projectId: project,
    credential: credentials ? cert(JSON.parse(readFileSync(credentials, "utf8"))) : applicationDefault(),
});
const db = getFirestore();

const failures = [];
async function check(name, run) {
    try {
        const detail = await run();
        console.log(`ok   ${name}${detail ? ` (${detail})` : ""}`);
    } catch (e) {
        failures.push(name);
        console.log(`FAIL ${name}: ${e.message}`);
    }
}

// The uid/circle values don't need to exist: Firestore rejects a query that has
// no index even when it would match nothing.
await check("collection-group members by userId", () =>
    db.collectionGroup("members").where("userId", "==", "smoke-check").limit(1).get().then(() => ""));
await check("public circles ordered by createdAt", () =>
    db.collection("circles").where("circlePrivacy", "==", "public").orderBy("createdAt", "desc").limit(1).get().then(() => ""));
await check("one circle's members by userId", () =>
    db.collection("circles/smoke-check/members").where("userId", "==", "smoke-check").limit(1).get().then(() => ""));

// ponytail: full scans, fine for the post-reset data size; switch to count() queries if it grows.
await check("every circle has a Timestamp createdAt", async () => {
    const snap = await db.collection("circles").get();
    const bad = snap.docs.filter((d) => !(d.get("createdAt") instanceof Timestamp)).map((d) => d.id);
    if (bad.length) throw new Error(`${bad.length} bad: ${bad.slice(0, 10).join(", ")}`);
    return `${snap.size} circles`;
});
await check("every member doc has userId", async () => {
    const snap = await db.collectionGroup("members").get();
    const bad = snap.docs.filter((d) => typeof d.get("userId") !== "string" || !d.get("userId")).map((d) => d.ref.path);
    if (bad.length) throw new Error(`${bad.length} bad: ${bad.slice(0, 10).join(", ")}`);
    return `${snap.size} member docs`;
});
await check("every circle is public or private", async () => {
    const snap = await db.collection("circles").get();
    const bad = snap.docs.filter((d) => !["public", "private"].includes(d.get("circlePrivacy"))).map((d) => d.id);
    if (bad.length) throw new Error(`${bad.length} bad: ${bad.slice(0, 10).join(", ")}`);
    return "";
});

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed: ${failures.join("; ")}`);
    process.exit(1);
}
console.log("\nAll checks passed.");
