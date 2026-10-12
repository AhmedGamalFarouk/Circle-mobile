// This code uses the v1 API; since firebase-functions v6 the package root
// exports v2, where functions.pubsub.schedule / firestore.document don't exist.
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteExpiredFlashCircles = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async (context) => {
      const now = admin.firestore.Timestamp.now();
      const circlesRef = admin.firestore().collection("circles");

      try {
      // Query for expired flash circles
        const snapshot = await circlesRef
            .where("circleType", "==", "flash")
            .where("expiresAt", "<=", now)
            .get();

        if (snapshot.empty) {
          console.log("No expired flash circles found.");
          return null;
        }

        const batch = admin.firestore().batch();
        const deletePromises = [];

        for (const doc of snapshot.docs) {
          const circleData = doc.data();
          console.log(
              `Deleting expired flash circle: ${circleData.circleName} ` +
              `(${doc.id})`,
          );

          // Delete the circle document
          batch.delete(doc.ref);

          // Delete all subcollections (members, polls, messages, etc.)
          const subcollections = [
            "members", "polls", "chat", "events", "memories", "typing",
          ];
          for (const subcollection of subcollections) {
            const subRef = doc.ref.collection(subcollection);
            const subSnapshot = await subRef.get();
            subSnapshot.forEach((subDoc) => {
              batch.delete(subDoc.ref);
            });
          }

          // Remove circle from users' joinedCircles arrays
          const membersSnapshot = await doc.ref.collection("members").get();
          for (const memberDoc of membersSnapshot.docs) {
          // Web-created member docs have no userId field; the doc id is the uid
            const memberUserId = memberDoc.data().userId || memberDoc.id;
            if (memberUserId) {
              const userRef = admin
                  .firestore()
                  .collection("users")
                  .doc(memberUserId);
              deletePromises.push(
                  userRef
                      .update({
                        joinedCircles: admin.firestore.FieldValue.arrayRemove(
                            doc.id,
                        ),
                      })
                      .catch((error) => {
                        console.error(
                            `Error removing circle from user ${memberUserId}:`,
                            error,
                        );
                      }),
              );
            }
          }
        }

        // Execute batch delete
        await batch.commit();
        await Promise.all(deletePromises);

        console.log(
            `Successfully deleted ${snapshot.size} expired flash circles.`,
        );
        return null;
      } catch (error) {
        console.error("Error deleting expired flash circles:", error);
        throw error;
      }
    });

exports.processExpiredPolls = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async (context) => {
      const now = new Date();
      const circlesRef = admin.firestore().collection("circles");

      // Get all circles to check their polls
      const circlesSnapshot = await circlesRef.get();
      const updatePromises = [];

      for (const circleDoc of circlesSnapshot.docs) {
        const pollsRef = circleDoc.ref.collection("polls");
        const pollsSnapshot = await pollsRef.get();

        for (const pollDoc of pollsSnapshot.docs) {
          const pollData = pollDoc.data();

          // Check if poll has active activity or place polls with expired
          // deadlines
          const processActivePoll = async (pollType, pollKey) => {
            const poll = pollData[pollKey];
            if (!poll || poll.status !== "active") return;

            // Convert Firebase Timestamp deadline to Date for comparison
            const deadline = poll.deadline.toDate();
            if (deadline <= now) {
              const options = poll.options;

              if (!options || options.length === 0) {
                console.log(
                    `Poll ${pollDoc.id} ${pollType} has no options, skipping.`,
                );
                updatePromises.push(
                    pollDoc.ref.update({
                      [`${pollKey}.status`]: "closed",
                      [`${pollKey}.winningOption`]: null,
                    }),
                );
                return;
              }

              // Calculate votes for each option using the votes object
              const voteCounts = {};
              options.forEach((option) => {
                voteCounts[option.text] = 0;
              });

              // Count votes from the votes object
              if (poll.votes) {
                Object.values(poll.votes).forEach((vote) => {
                  if (Object.prototype.hasOwnProperty.call(voteCounts, vote)) {
                    voteCounts[vote]++;
                  }
                });
              }

              let maxVotes = -1;
              let winningOptions = [];

              for (const [optionText, votes] of Object.entries(voteCounts)) {
                if (votes > maxVotes) {
                  maxVotes = votes;
                  winningOptions = [optionText];
                } else if (votes === maxVotes) {
                  winningOptions.push(optionText);
                }
              }

              let winningOptionText;
              if (winningOptions.length === 1) {
                winningOptionText = winningOptions[0];
              } else {
              // Tie-breaker: choose randomly
                winningOptionText =
                winningOptions[
                    Math.floor(Math.random() * winningOptions.length)
                ];
              }

              console.log(
                  `Poll ${pollDoc.id} ${pollType} expired. ` +
              `Winning option: ${winningOptionText}`,
              );

              const updateData = {
                [`${pollKey}.status`]: "closed",
                [`${pollKey}.winningOption`]: winningOptionText,
              };

              // If this is an activity poll, also set the winning activity
              if (pollType === "activity") {
                updateData.winningActivity = winningOptionText;
              } else if (pollType === "place") {
                updateData.winningPlace = winningOptionText;
              }

              updatePromises.push(pollDoc.ref.update(updateData));
            }
          };

          // Process both activity and place polls
          await processActivePoll("activity", "activityPoll");
          await processActivePoll("place", "placePoll");
        }
      }

      await Promise.all(updatePromises);
      console.log("Expired polls processed successfully.");
      return null;
    });

// Trigger function to create members subcollection when a circle is created
exports.onCircleCreated = functions.firestore
    .document("circles/{circleId}")
    .onCreate(async (snap, context) => {
      const circleId = context.params.circleId;
      const circleData = snap.data();
      const creatorId = circleData.createdBy;

      if (!creatorId) {
        console.error("Circle created without createdBy field");
        return;
      }

      try {
        const memberRef = admin
            .firestore()
            .collection("circles")
            .doc(circleId)
            .collection("members")
            .doc(creatorId);

        // Both apps add the creator themselves; only fill in when missing so
        // this trigger never overwrites their member doc.
        const existingMember = await memberRef.get();
        if (existingMember.exists) {
          return;
        }

        const userRef = admin.firestore().collection("users").doc(creatorId);
        const userDoc = await userRef.get();
        const userData = userDoc.exists ? userDoc.data() : {};

        await memberRef.set({
          email: userData.email || "",
          isAdmin: true,
          isOwner: true,
          photoURL:
            userData.photoUrl || userData.avatarPhoto || "",
          username: userData.username || "Unknown User",
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          userId: creatorId,
        });

        console.log(
            `Creator ${creatorId} added as admin member to circle ${circleId}`,
        );
      } catch (error) {
        console.error("Error creating initial circle member:", error);
      }
    });
