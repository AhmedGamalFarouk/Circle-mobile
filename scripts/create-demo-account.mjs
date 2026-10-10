#!/usr/bin/env node
/* eslint-disable no-console */
// Creates the shared demo account behind the "Skip" / "Skip Authentication"
// buttons, with a profile and one public circle it owns. Safe to re-run: it
// signs in instead if the account exists and leaves an existing profile alone.
//
//   node scripts/create-demo-account.mjs
//
// It goes through the public Firebase APIs as the demo user, so the security
// rules apply and no service account is needed.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/utils/demoAccount.js", import.meta.url), "utf8");
const EMAIL = src.match(/DEMO_EMAIL = '([^']+)'/)[1];
const PASSWORD = src.match(/DEMO_PASSWORD = '([^']+)'/)[1];
const USERNAME = "circledemo";
const API_KEY = "AIzaSyAW0f0DzBx3e769VkVdUimATL6-gnW4cTo";
const PROJECT = "circle-26a87";
const AUTH = "https://identitytoolkit.googleapis.com/v1/accounts";
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const COVER = "https://res.cloudinary.com/dlyfph65r/image/upload/v1753334626/coverDeafault_b5c8od.jpg";

let token;
async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    // Firestore takes the user's ID token as a bearer token; the Auth API
    // takes it in the body instead.
    headers: {
      "content-type": "application/json",
      ...(token && url.startsWith(FS) ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    const error = new Error(`${method} ${url.split("?")[0]} -> ${res.status} ${text.slice(0, 300)}`);
    error.status = res.status;
    error.body = text;
    throw error;
  }
  return text ? JSON.parse(text) : {};
}

const value = (x) => {
  if (x === null) return { nullValue: null };
  if (typeof x === "boolean") return { booleanValue: x };
  if (Number.isInteger(x)) return { integerValue: String(x) };
  if (x instanceof Date) return { timestampValue: x.toISOString() };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(value) } };
  if (typeof x === "object") return { mapValue: fields(x) };
  return { stringValue: x };
};
const fields = (obj) => ({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, value(v)])) });

let account;
try {
  account = await call("POST", `${AUTH}:signUp?key=${API_KEY}`, { email: EMAIL, password: PASSWORD, returnSecureToken: true });
  console.log("Created auth user", EMAIL);
} catch (error) {
  if (!String(error.body).includes("EMAIL_EXISTS")) throw error;
  account = await call("POST", `${AUTH}:signInWithPassword?key=${API_KEY}`, { email: EMAIL, password: PASSWORD, returnSecureToken: true });
  console.log("Auth user already exists, signed in");
}
token = account.idToken;
const uid = account.localId;
await call("POST", `${AUTH}:update?key=${API_KEY}`, { idToken: token, displayName: "Circle Demo" });

const profile = await call("GET", `${FS}/users/${uid}`).catch((error) => {
  if (error.status === 404) return null;
  throw error;
});
if (profile) {
  console.log(`Profile users/${uid} already exists; nothing else to do.`);
  process.exit(0);
}

const taken = await call("POST", `${FS}:runQuery`, {
  structuredQuery: {
    from: [{ collectionId: "users" }],
    where: { fieldFilter: { field: { fieldPath: "username" }, op: "EQUAL", value: { stringValue: USERNAME } } },
    limit: 1,
  },
});
if (taken.some((row) => row.document)) throw new Error(`username ${USERNAME} is taken`);

const now = new Date();
const interests = ["football", "reading", "music"];
await call("PATCH", `${FS}/users/${uid}?currentDocument.exists=false`, fields({
  uid, email: EMAIL, displayName: "Circle Demo", provider: "email", username: USERNAME,
  age: null, bio: "Shared demo account for trying Circle.", location: "Cairo", joinDate: "",
  photoUrl: null, avatarPhoto: "", isBlocked: false, coverPhoto: COVER,
  stats: { circles: 1, connections: 0, events: 0 }, interests,
  joinedEvents: [], connectionRequests: [], connections: [], joinedCircles: [],
  phoneNumber: "", createdAt: now,
}));
console.log(`Created profile users/${uid} (@${USERNAME})`);

const circle = await call("POST", `${FS}/circles`, fields({
  circleName: "Circle Demo", description: "A sandbox circle for trying polls, chat and events.",
  createdAt: now, createdBy: uid, circlePrivacy: "public", interests,
  imageUrl: "", circleType: "permanent", expiresAt: null,
}));
const circleId = circle.name.split("/").pop();
await call("PATCH", `${FS}/circles/${circleId}/members/${uid}`, fields({
  email: EMAIL, isOwner: true, isAdmin: true, username: USERNAME, photoURL: "",
  userId: uid, joinedAt: now, addedBy: uid,
}));
await call("PATCH", `${FS}/users/${uid}?updateMask.fieldPaths=joinedCircles`, fields({ joinedCircles: [circleId] }));
console.log(`Created circle circles/${circleId} owned by the demo account`);
