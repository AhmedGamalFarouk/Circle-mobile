// Runs reset-data.mjs against the Auth + Firestore emulators.
//   cd scripts && npm test
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const SCRIPT = fileURLToPath(new URL("./reset-data.mjs", import.meta.url));
const DEMO_EMAIL = "demo@circle-26a87.firebaseapp.com";
initializeApp({ projectId: "demo-circle" });
const db = getFirestore();
const auth = getAuth();

const run = (extra = [], env = process.env) => {
    const cwd = mkdtempSync(join(tmpdir(), "reset-"));
    const out = execFileSync("node", [SCRIPT, ...extra], { cwd, env, encoding: "utf8" });
    return { out, cwd };
};

async function seed() {
    await db.recursiveDelete(db.collection("users"));
    await db.recursiveDelete(db.collection("circles"));
    await db.recursiveDelete(db.collection("reports"));
    for (const u of (await auth.listUsers()).users) await auth.deleteUser(u.uid);
    const demo = await auth.createUser({ uid: "demo-uid", email: DEMO_EMAIL, password: "x12345678" });
    const alice = await auth.createUser({ uid: "alice", email: "alice@example.com", password: "x12345678" });
    await db.doc("users/alice").set({ username: "alice" });
    await db.doc("users/demo-uid").set({ username: "circledemo", junk: true });
    await db.doc("users/ghost/notifications/n1").set({ type: "x" }); // parent has no fields
    await db.doc("circles/a").set({ createdBy: alice.uid, circleName: "A" });
    await db.doc("circles/a/chat/m1").set({ text: "hi" });
    await db.doc("circles/d").set({ createdBy: demo.uid, circleName: "Old demo" });
    await db.doc("circles/d/chat/m1").set({ text: "demo msg" });
    await db.doc("reports/r1").set({ reporterId: "alice", reportedId: demo.uid });
    await db.doc("reports/r2").set({ reporterId: "alice", reportedId: "bob" });
}

before(() => assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "run under firebase emulators:exec"));

test("refuses to run without a target project", () => {
    const env = { ...process.env, FIRESTORE_EMULATOR_HOST: "", FIREBASE_AUTH_EMULATOR_HOST: "" };
    const res = spawnSync("node", [SCRIPT], { env, encoding: "utf8" });
    assert.equal(res.status, 2);
    assert.match(res.stderr, /--project/);
});

test("full reset exports everything, wipes it, and recreates the demo account with the same uid", async () => {
    await seed();
    const { out, cwd } = run();
    assert.match(out, /Would delete 9 Firestore documents in 3 collections and 1 Auth users/);

    const [file] = readdirSync(cwd).filter((f) => f.startsWith("reset-backup-"));
    const backup = JSON.parse(readFileSync(join(cwd, file), "utf8"));
    assert.equal(backup.circles.a.collections.chat.m1.data.text, "hi");
    assert.equal(backup.users.ghost.collections.notifications.n1.data.type, "x");

    assert.deepEqual((await auth.listUsers()).users.map((u) => u.uid), ["demo-uid"]);
    assert.deepEqual((await db.collection("users").listDocuments()).map((d) => d.id), ["demo-uid"]);
    assert.equal((await db.collection("reports").get()).size, 0);
    const profile = (await db.doc("users/demo-uid").get()).data();
    assert.equal(profile.junk, undefined);
    assert.deepEqual(profile.connections, []);
    const circles = await db.collection("circles").get();
    assert.equal(circles.size, 1);
    assert.deepEqual(profile.joinedCircles, [circles.docs[0].id]);
    const member = (await circles.docs[0].ref.collection("members").doc("demo-uid").get()).data();
    assert.equal(member.isOwner, true);
    assert.equal(member.email, undefined);
});

test("--demo-only resets the demo account and leaves everyone else alone", async () => {
    await seed();
    run(["--demo-only"]);

    assert.deepEqual((await auth.listUsers()).users.map((u) => u.uid).sort(), ["alice", "demo-uid"]);
    assert.ok((await db.doc("users/alice").get()).exists);
    assert.ok((await db.doc("circles/a/chat/m1").get()).exists);
    assert.ok((await db.doc("reports/r2").get()).exists);
    assert.equal((await db.doc("reports/r1").get()).exists, false);
    assert.equal((await db.doc("circles/d").get()).exists, false);
    assert.equal((await db.doc("circles/d/chat/m1").get()).exists, false);
    assert.equal((await db.doc("users/demo-uid").get()).data().junk, undefined);
});
