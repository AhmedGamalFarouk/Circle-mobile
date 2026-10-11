// Checks firestore.rules / database.rules.json against the flows both apps use.
// Run from this folder: npm install && npm test  (needs Java for the emulator)
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, it } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs,
  increment, query, serverTimestamp, setDoc, updateDoc, where,
} from "firebase/firestore";
import { ref, set, get } from "firebase/database";

let env;
const CIRCLE = "c1";

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-circle",
    firestore: { rules: readFileSync("../firestore.rules", "utf8") },
    database: { rules: readFileSync("../database.rules.json", "utf8") },
  });
});

after(async () => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  // owner created circle c1; bob is a plain member; eve is not a member
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/owner"), { username: "owner", joinedCircles: [CIRCLE] });
    await setDoc(doc(db, "users/bob"), { username: "bob", joinedCircles: [CIRCLE] });
    await setDoc(doc(db, "users/eve"), { username: "eve", joinedCircles: [] });
    await setDoc(doc(db, "users/mod"), { username: "mod", isAdmin: true });
    await setDoc(doc(db, `circles/${CIRCLE}`), { circleName: "C", createdBy: "owner", circlePrivacy: "private" });
    await setDoc(doc(db, `circles/${CIRCLE}/members/owner`), { isAdmin: true, isOwner: true });
    await setDoc(doc(db, `circles/${CIRCLE}/members/bob`), { isAdmin: false, isOwner: false, userId: "bob" });
    await setDoc(doc(db, `circles/${CIRCLE}/chat/m1`), { text: "hi", user: { userId: "owner" }, timeStamp: new Date() });
    await setDoc(doc(db, `circles/${CIRCLE}/events/e1`), { status: "pending", activity: "A", place: "P" });
    await setDoc(doc(db, "circleRequests/r1"), { circleId: CIRCLE, type: "join-request", requesterId: "eve", status: "pending" });
  });
});

const as = (uid) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

describe("users", () => {
  it("signed-out users read nothing", async () => {
    await assertFails(getDoc(doc(anon(), "users/bob")));
  });
  it("signs up with a new profile but cannot make itself admin", async () => {
    await assertSucceeds(setDoc(doc(as("new"), "users/new"), { username: "n", joinedCircles: [] }));
    await assertFails(setDoc(doc(as("new2"), "users/new2"), { username: "n", isAdmin: true }));
  });
  it("edits own profile but not moderation fields", async () => {
    await assertSucceeds(updateDoc(doc(as("bob"), "users/bob"), { bio: "x" }));
    await assertFails(updateDoc(doc(as("bob"), "users/bob"), { isBlocked: false, isAdmin: true }));
  });
  it("others may only change relationship fields", async () => {
    await assertSucceeds(updateDoc(doc(as("owner"), "users/bob"), { joinedCircles: arrayUnion("c2"), "stats.circles": increment(1) }));
    await assertFails(updateDoc(doc(as("eve"), "users/bob"), { username: "pwned" }));
  });
  it("reporting adds exactly one", async () => {
    await assertSucceeds(updateDoc(doc(as("eve"), "users/bob"), { reported: increment(1) }));
    await assertFails(updateDoc(doc(as("eve"), "users/bob"), { reported: 50 }));
  });
  it("app admin can block", async () => {
    await assertSucceeds(updateDoc(doc(as("mod"), "users/bob"), { isBlocked: true }));
  });
  it("anyone can notify, only the owner reads notifications", async () => {
    await assertSucceeds(addDoc(collection(as("eve"), "users/bob/notifications"), { type: "x" }));
    await assertFails(getDocs(collection(as("eve"), "users/bob/notifications")));
    await assertSucceeds(getDocs(collection(as("bob"), "users/bob/notifications")));
  });
});

describe("circles", () => {
  it("creates a circle as its creator and adds self as owner member", async () => {
    const db = as("eve");
    await assertSucceeds(setDoc(doc(db, "circles/c2"), { createdBy: "eve", circleName: "E" }));
    await assertSucceeds(setDoc(doc(db, "circles/c2/members/eve"), { isAdmin: true, isOwner: true }));
    await assertFails(setDoc(doc(db, "circles/c3"), { createdBy: "bob" }));
  });
  it("only admins edit or delete the circle", async () => {
    await assertFails(updateDoc(doc(as("bob"), `circles/${CIRCLE}`), { circleName: "X" }));
    await assertSucceeds(updateDoc(doc(as("owner"), `circles/${CIRCLE}`), { circleName: "X" }));
  });
  it("creator can still delete after removing their own member doc", async () => {
    const db = as("owner");
    await assertSucceeds(deleteDoc(doc(db, `circles/${CIRCLE}/members/owner`)));
    await assertSucceeds(deleteDoc(doc(db, `circles/${CIRCLE}/chat/m1`)));
    await assertSucceeds(deleteDoc(doc(db, `circles/${CIRCLE}`)));
  });
  it("users join only by accepting their own pending invitation, never as admin", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "circleRequests/inv-eve"), { circleId: CIRCLE, type: "invitation", invitedUserId: "eve", inviterId: "bob", status: "pending" });
      await setDoc(doc(db, "circleRequests/inv-mod"), { circleId: CIRCLE, type: "invitation", invitedUserId: "mod", inviterId: "bob", status: "pending" });
      await setDoc(doc(db, "circleRequests/inv-old"), { circleId: CIRCLE, type: "invitation", invitedUserId: "eve", inviterId: "bob", status: "declined" });
    });
    const db = as("eve");
    // No invitation, someone else's, a join request, an answered one: refused.
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve", invitationId: "inv-mod" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve", invitationId: "r1" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve", invitationId: "inv-old" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: true, userId: "eve", invitationId: "inv-eve" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve2`), { isAdmin: false, invitationId: "inv-eve" }));
    await assertSucceeds(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve", invitationId: "inv-eve" }));
  });
  it("an invitation to one circle can't be redirected to another", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "circles/open"), { circleName: "O", createdBy: "eve", circlePrivacy: "public" });
      await setDoc(doc(db, "circles/open/members/eve"), { isAdmin: true, isOwner: true });
    });
    const db = as("eve");
    const inv = await addDoc(collection(db, "circleRequests"), { circleId: "open", type: "invitation", invitedUserId: "eve", inviterId: "eve", status: "pending" });
    await assertFails(updateDoc(inv, { circleId: CIRCLE }));
    await assertFails(updateDoc(doc(db, "circleRequests/r1"), { type: "invitation" }));
    await assertFails(setDoc(doc(db, `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve", invitationId: inv.id }));
    await assertSucceeds(updateDoc(inv, { status: "declined" }));
  });
  it("admins add anyone who asked to join", async () => {
    await assertSucceeds(setDoc(doc(as("owner"), `circles/${CIRCLE}/members/eve`), { isAdmin: false, userId: "eve" }));
  });
  it("members cannot promote themselves; admins can promote", async () => {
    await assertFails(updateDoc(doc(as("bob"), `circles/${CIRCLE}/members/bob`), { isAdmin: true }));
    await assertSucceeds(updateDoc(doc(as("owner"), `circles/${CIRCLE}/members/bob`), { isAdmin: true }));
  });
  it("members leave; non-admins cannot remove others", async () => {
    await assertFails(deleteDoc(doc(as("bob"), `circles/${CIRCLE}/members/owner`)));
    await assertSucceeds(deleteDoc(doc(as("bob"), `circles/${CIRCLE}/members/bob`)));
  });
});

describe("chat", () => {
  it("is members-only", async () => {
    await assertFails(getDocs(collection(as("eve"), `circles/${CIRCLE}/chat`)));
    await assertSucceeds(getDocs(collection(as("bob"), `circles/${CIRCLE}/chat`)));
    await assertSucceeds(addDoc(collection(as("bob"), `circles/${CIRCLE}/chat`), { text: "yo", user: { userId: "bob" }, timeStamp: serverTimestamp() }));
    await assertFails(addDoc(collection(as("eve"), `circles/${CIRCLE}/chat`), { text: "spam" }));
  });
  it("others react and mark seen but cannot edit the text", async () => {
    const db = as("bob");
    await assertSucceeds(updateDoc(doc(db, `circles/${CIRCLE}/chat/m1`), { reactions: [{ userId: "bob", emoji: "x" }], seenBy: arrayUnion("bob") }));
    await assertSucceeds(updateDoc(doc(db, `circles/${CIRCLE}/chat/m1`), { deletedFor: arrayUnion("bob") }));
    await assertFails(updateDoc(doc(db, `circles/${CIRCLE}/chat/m1`), { text: "edited by bob" }));
    await assertSucceeds(updateDoc(doc(as("owner"), `circles/${CIRCLE}/chat/m1`), { text: "edited", edited: true }));
  });
  it("only the author or an admin deletes a message", async () => {
    await assertFails(deleteDoc(doc(as("bob"), `circles/${CIRCLE}/chat/m1`)));
    await assertSucceeds(deleteDoc(doc(as("owner"), `circles/${CIRCLE}/chat/m1`)));
  });
});

describe("events and polls", () => {
  it("members vote and RSVP; only admins confirm", async () => {
    await assertSucceeds(addDoc(collection(as("bob"), `circles/${CIRCLE}/polls`), { stage: "Planning the Activity" }));
    await assertSucceeds(updateDoc(doc(as("bob"), `circles/${CIRCLE}/events/e1`), { rsvps: { bob: "yes" } }));
    await assertFails(updateDoc(doc(as("bob"), `circles/${CIRCLE}/events/e1`), { status: "confirmed" }));
    await assertSucceeds(updateDoc(doc(as("owner"), `circles/${CIRCLE}/events/e1`), { status: "confirmed", day: "2026-11-01" }));
    await assertFails(getDocs(collection(as("eve"), `circles/${CIRCLE}/events`)));
  });
});

describe("circleRequests", () => {
  it("requester and circle admins see a join request; others do not", async () => {
    await assertSucceeds(getDocs(query(collection(as("eve"), "circleRequests"), where("requesterId", "==", "eve"))));
    await assertSucceeds(getDocs(query(collection(as("owner"), "circleRequests"), where("circleId", "==", CIRCLE))));
    await assertFails(getDocs(query(collection(as("bob"), "circleRequests"), where("circleId", "==", CIRCLE))));
  });
  it("join requests only for yourself; invitations only from members", async () => {
    await assertSucceeds(addDoc(collection(as("eve"), "circleRequests"), { circleId: CIRCLE, type: "join-request", requesterId: "eve", status: "pending" }));
    await assertFails(addDoc(collection(as("eve"), "circleRequests"), { circleId: CIRCLE, type: "join-request", requesterId: "bob", status: "pending" }));
    await assertSucceeds(addDoc(collection(as("bob"), "circleRequests"), { circleId: CIRCLE, type: "invitation", invitedUserId: "eve", inviterId: "bob", status: "pending" }));
    await assertFails(addDoc(collection(as("eve"), "circleRequests"), { circleId: CIRCLE, type: "invitation", invitedUserId: "x", status: "pending" }));
  });
  it("admin accepts a join request", async () => {
    await assertSucceeds(updateDoc(doc(as("owner"), "circleRequests/r1"), { status: "accepted" }));
    await assertFails(updateDoc(doc(as("bob"), "circleRequests/r1"), { status: "accepted" }));
  });
});

describe("presence (Realtime Database)", () => {
  it("users write only their own presence; signed-in users read all", async () => {
    const bob = env.authenticatedContext("bob").database();
    await assertSucceeds(set(ref(bob, "presence/bob"), { online: true }));
    await assertFails(set(ref(bob, "presence/eve"), { online: true }));
    await assertSucceeds(get(ref(bob, "presence")));
    await assertFails(get(ref(env.unauthenticatedContext().database(), "presence")));
  });
});
