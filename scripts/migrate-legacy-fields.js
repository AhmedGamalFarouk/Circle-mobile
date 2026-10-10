#!/usr/bin/env node
/* eslint-disable no-console */
// One-time backfill of data written before web and mobile agreed on field
// names. DRY RUN BY DEFAULT: it only prints what it would change.
//
//   cd functions && npm install          # firebase-admin lives here
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//     node ../scripts/migrate-legacy-fields.js            # dry run
//   ... node ../scripts/migrate-legacy-fields.js --apply  # write changes
//
// Optional: --circle <id> limits it to one circle.
//
// What it fixes (only adds or corrects fields, never deletes data):
// - circles:  circlePrivacy "عام"/"خاص" -> "public"/"private";
//             circleType "permenent" (or anything not "flash") -> "permanent"
// - chat:     messages missing timeStamp get it from `timestamp`
//             (they were invisible in both apps); image/video messages get
//             mediaUrl from imageUrl/videoUrl
// - members:  member docs missing userId get the doc id
// - events:   events with only title/location get activity/place (and back)
// - users:    avatarPhoto <-> photoUrl filled from whichever exists

const path = require("node:path");
const admin = require(require.resolve("firebase-admin", {
  paths: [path.join(__dirname, "..", "functions"), __dirname],
}));

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const circleArgIndex = args.indexOf("--circle");
const ONLY_CIRCLE = circleArgIndex >= 0 ? args[circleArgIndex + 1] : null;

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "circle-26a87" });
const db = admin.firestore();

const LEGACY_PRIVACY = { "عام": "public", "خاص": "private" };
const counts = {};
let pendingWrites = [];

function plan(ref, update, reason) {
  counts[reason] = (counts[reason] || 0) + 1;
  if (counts[reason] <= 5) {
    console.log(`${APPLY ? "UPDATE" : "would update"} ${ref.path} ${JSON.stringify(update)}  (${reason})`);
  }
  pendingWrites.push({ ref, update });
}

async function flush() {
  if (!APPLY) {
    pendingWrites = [];
    return;
  }
  // Batches hold at most 500 writes.
  for (let i = 0; i < pendingWrites.length; i += 400) {
    const batch = db.batch();
    pendingWrites.slice(i, i + 400).forEach(({ ref, update }) => batch.update(ref, update));
    await batch.commit();
  }
  pendingWrites = [];
}

function circleFixes(data) {
  const update = {};
  if (LEGACY_PRIVACY[data.circlePrivacy]) update.circlePrivacy = LEGACY_PRIVACY[data.circlePrivacy];
  if (data.circleType && data.circleType !== "flash" && data.circleType !== "permanent") {
    update.circleType = "permanent";
  }
  return update;
}

function messageFixes(data) {
  const update = {};
  if (!data.timeStamp && data.timestamp) update.timeStamp = data.timestamp;
  if (!data.mediaUrl && data.messageType === "image" && data.imageUrl) update.mediaUrl = data.imageUrl;
  if (!data.mediaUrl && data.messageType === "video" && data.videoUrl) update.mediaUrl = data.videoUrl;
  return update;
}

function eventFixes(data) {
  const update = {};
  if (!data.activity && data.title) update.activity = data.title;
  if (!data.title && data.activity) update.title = data.activity;
  if (!data.place && data.location) update.place = data.location;
  if (!data.location && data.place) update.location = data.place;
  return update;
}

function userFixes(data) {
  const update = {};
  const avatar = data.photoUrl || data.photoURL || data.avatarPhoto;
  if (avatar && !data.avatarPhoto) update.avatarPhoto = avatar;
  if (avatar && !data.photoUrl) update.photoUrl = avatar;
  return update;
}

async function migrateCircle(circleDoc) {
  const circleUpdate = circleFixes(circleDoc.data());
  if (Object.keys(circleUpdate).length) plan(circleDoc.ref, circleUpdate, "circle enum values");

  const [chat, members, events] = await Promise.all([
    circleDoc.ref.collection("chat").get(),
    circleDoc.ref.collection("members").get(),
    circleDoc.ref.collection("events").get(),
  ]);

  chat.forEach((m) => {
    const update = messageFixes(m.data());
    if (Object.keys(update).length) plan(m.ref, update, "chat timeStamp/mediaUrl");
  });
  members.forEach((m) => {
    if (!m.data().userId) plan(m.ref, { userId: m.id }, "member userId");
  });
  events.forEach((e) => {
    const update = eventFixes(e.data());
    if (Object.keys(update).length) plan(e.ref, update, "event activity/place");
  });
  await flush();
}

async function main() {
  console.log(`${APPLY ? "APPLYING changes" : "DRY RUN (pass --apply to write)"} on project ${admin.app().options.projectId}\n`);

  if (ONLY_CIRCLE) {
    const circleDoc = await db.collection("circles").doc(ONLY_CIRCLE).get();
    if (!circleDoc.exists) throw new Error(`circle ${ONLY_CIRCLE} not found`);
    await migrateCircle(circleDoc);
  } else {
    const circles = await db.collection("circles").get();
    for (const circleDoc of circles.docs) await migrateCircle(circleDoc);

    const users = await db.collection("users").get();
    users.forEach((u) => {
      const update = userFixes(u.data());
      if (Object.keys(update).length) plan(u.ref, update, "user avatar fields");
    });
    await flush();
  }

  console.log("\nSummary:");
  if (!Object.keys(counts).length) console.log("  nothing to change");
  for (const [reason, n] of Object.entries(counts)) {
    console.log(`  ${reason}: ${n} document(s) ${APPLY ? "updated" : "would be updated"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
