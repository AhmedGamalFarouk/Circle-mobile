#!/usr/bin/env node
/* eslint-disable no-console */
// Moves circle member docs to circles/{circleId}/members/{uid}.
// DRY RUN BY DEFAULT: it only prints what it would change.
//
//   cd functions && npm install          # firebase-admin lives here
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//     node ../scripts/rekey-member-docs.js            # dry run
//   ... node ../scripts/rekey-member-docs.js --apply  # write changes
//
// Older mobile builds added members with addDoc, so their doc id was random.
// The security rules find members by uid, so those people could not read
// their circle's chat, polls or events. For each member doc whose id differs
// from its userId this copies it to members/{userId} (keeping an existing
// doc there and filling only missing fields) and deletes the random-id doc.

const path = require("node:path");
const admin = require(require.resolve("firebase-admin", {
  paths: [path.join(__dirname, "..", "functions"), __dirname],
}));

const APPLY = process.argv.includes("--apply");

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "circle-26a87" });
const db = admin.firestore();

async function main() {
  console.log(`${APPLY ? "APPLYING changes" : "DRY RUN (pass --apply to write)"} on project ${admin.app().options.projectId}\n`);
  let moved = 0;
  let merged = 0;
  let skipped = 0;

  const circles = await db.collection("circles").get();
  for (const circleDoc of circles.docs) {
    const members = await circleDoc.ref.collection("members").get();
    for (const m of members.docs) {
      const data = m.data();
      const uid = data.userId;
      if (!uid || uid === m.id) continue;
      if (typeof uid !== "string" || uid.includes("/")) {
        console.log(`skip ${m.ref.path}: odd userId ${JSON.stringify(uid)}`);
        skipped++;
        continue;
      }

      const target = circleDoc.ref.collection("members").doc(uid);
      const existing = await target.get();
      // An existing uid-keyed doc wins; the old doc only fills gaps.
      const next = existing.exists ? { ...data, ...existing.data() } : data;
      console.log(`${APPLY ? "MOVE" : "would move"} ${m.ref.path} -> ${target.path}${existing.exists ? " (merge)" : ""}`);
      existing.exists ? merged++ : moved++;

      if (APPLY) {
        const batch = db.batch();
        batch.set(target, next);
        batch.delete(m.ref);
        await batch.commit();
      }
    }
  }

  console.log(`\n${moved} moved, ${merged} merged into an existing doc, ${skipped} skipped.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
