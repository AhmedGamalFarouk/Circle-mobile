#!/usr/bin/env node
/* eslint-disable no-console */
// Wipes Circle's Firestore data and Auth users, then recreates the demo account
// (SPEC A3). The data from before this reset doesn't matter (gate uc4a), but it
// is exported to a local JSON file first anyway.
//
//   cd scripts && npm install                     (once)
//   node scripts/reset-data.mjs --project circle-26a87 --credentials <service-account.json>
//       prints what would be deleted; add --yes to do it
//   node scripts/reset-data.mjs --project circle-26a87 --credentials <...> --demo-only --yes
//       resets only the demo account: its circles, its reports, its profile (before store review)
//
// Against the emulators (FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST set) it
// runs without --yes. RTDB presence and Cloudinary media are not touched.
import { readFileSync, writeFileSync } from "node:fs";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
};

const emulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const project = option("--project") || (emulator ? "demo-circle" : undefined);
if (!project) {
    console.error("Refusing to run: pass --project <id> (or set FIRESTORE_EMULATOR_HOST for the emulator).");
    process.exit(2);
}
if (emulator !== !!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.error("Set both FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST, or neither.");
    process.exit(2);
}
const confirmed = emulator || flag("--yes");
const demoOnly = flag("--demo-only");

const credentials = option("--credentials");
initializeApp({
    projectId: project,
    ...(emulator ? {} : { credential: credentials ? cert(JSON.parse(readFileSync(credentials, "utf8"))) : applicationDefault() }),
});
const db = getFirestore();
const auth = getAuth();

const demoSrc = readFileSync(new URL("../src/utils/demoAccount.js", import.meta.url), "utf8");
const DEMO_EMAIL = demoSrc.match(/DEMO_EMAIL = '([^']+)'/)[1];
const DEMO_PASSWORD = demoSrc.match(/DEMO_PASSWORD = '([^']+)'/)[1];

// Every document under a collection or document reference, subcollections included.
// listDocuments also returns parents that have subcollections but no fields.
async function dump(ref) {
    const out = {};
    const docRefs = ref.listDocuments ? await ref.listDocuments() : [ref];
    for (const docRef of docRefs) {
        const [snap, subRefs] = await Promise.all([docRef.get(), docRef.listCollections()]);
        const subs = {};
        for (const sub of subRefs) subs[sub.id] = await dump(sub);
        if (!snap.exists && !subRefs.length) continue;
        out[docRef.id] = { data: snap.exists ? snap.data() : null, ...(subRefs.length ? { collections: subs } : {}) };
    }
    return out;
}
const countDocs = (tree) =>
    Object.values(tree).reduce(
        (n, d) => n + (d.data ? 1 : 0) + Object.values(d.collections || {}).reduce((m, t) => m + countDocs(t), 0),
        0
    );

async function allAuthUsers() {
    const users = [];
    let page;
    do {
        page = await auth.listUsers(1000, page?.pageToken);
        users.push(...page.users);
    } while (page.pageToken);
    return users;
}

const demoUser = await auth.getUserByEmail(DEMO_EMAIL).catch(() => null);

// What goes: everything, or only the demo account's own data.
let targets; // [ref, ...] deleted with recursiveDelete
let authUids;
if (demoOnly) {
    if (!demoUser) {
        console.error(`No Auth user ${DEMO_EMAIL}; run a full reset or create-demo-account.mjs first.`);
        process.exit(1);
    }
    const uid = demoUser.uid;
    const [circles, reportsBy, reportsAbout] = await Promise.all([
        db.collection("circles").where("createdBy", "==", uid).get(),
        db.collection("reports").where("reporterId", "==", uid).get(),
        db.collection("reports").where("reportedId", "==", uid).get(),
    ]);
    targets = [...circles.docs, ...reportsBy.docs, ...reportsAbout.docs].map((d) => d.ref).concat(db.doc(`users/${uid}`));
    authUids = []; // the demo Auth user is kept so its uid (named in the rules) never changes
} else {
    targets = await db.listCollections();
    authUids = (await allAuthUsers()).map((u) => u.uid).filter((uid) => uid !== demoUser?.uid);
}

const backup = {};
for (const ref of targets) backup[ref.path] = await dump(ref);
const docCount = Object.values(backup).reduce((n, tree) => n + countDocs(tree), 0);

console.log(`Target: ${emulator ? "emulator" : "LIVE"} project ${project}${demoOnly ? " (demo account only)" : ""}`);
console.log(`Would delete ${docCount} Firestore documents in ${targets.length} ${demoOnly ? "documents/circles" : "collections"} and ${authUids.length} Auth users${demoUser ? `; keeps the demo Auth user ${demoUser.uid}` : ""}.`);
if (!confirmed) {
    console.log("Dry run. Add --yes to export, delete and recreate the demo account.");
    process.exit(0);
}

const file = `reset-backup-${project}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`Exported ${docCount} documents to ${file}`);

for (const ref of targets) await db.recursiveDelete(ref);
for (let i = 0; i < authUids.length; i += 1000) await auth.deleteUsers(authUids.slice(i, i + 1000));
console.log(`Deleted ${docCount} documents and ${authUids.length} Auth users.`);

// Recreate the demo account in the canonical shape (SPEC A1), keeping its uid.
const demo = demoUser ?? (await auth.createUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD, displayName: "Circle Demo" }));
const now = new Date();
const interests = ["football", "reading", "music"];
const circle = db.collection("circles").doc();
const batch = db.batch();
batch.set(db.doc(`users/${demo.uid}`), {
    uid: demo.uid, email: DEMO_EMAIL, displayName: "Circle Demo", provider: "email", username: "circledemo",
    age: null, bio: "Shared demo account for trying Circle.", location: "Cairo",
    photoUrl: null, avatarPhoto: "", coverPhoto: "", isBlocked: false, reported: 0,
    stats: { circles: 1, connections: 0, events: 0 }, interests,
    connections: [], connectionRequests: [], joinedCircles: [circle.id], joinedEvents: [],
    phoneNumber: "", createdAt: now,
});
batch.set(circle, {
    circleName: "Circle Demo", description: "A sandbox circle for trying polls, chat and events.",
    createdAt: now, createdBy: demo.uid, circlePrivacy: "public", circleType: "permanent",
    interests, imageUrl: "", expiresAt: null,
});
batch.set(circle.collection("members").doc(demo.uid), {
    userId: demo.uid, username: "circledemo", photoURL: "", isOwner: true, isAdmin: true, joinedAt: now, addedBy: demo.uid,
});
await batch.commit();
console.log(`Demo account ready: users/${demo.uid} (@circledemo), circle circles/${circle.id}.`);
