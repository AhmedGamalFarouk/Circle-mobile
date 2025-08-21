const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: functions.config().cloudinary.cloud_name,
  api_key: functions.config().cloudinary.api_key,
  api_secret: functions.config().cloudinary.api_secret,
});

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
          `Deleting expired flash circle: ${circleData.circleName} (${doc.id})`
        );

        // Delete the circle document
        batch.delete(doc.ref);

        // Delete all subcollections (members, polls, messages, etc.)
        const subcollections = ["members", "polls", "messages", "events"];
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
          const memberData = memberDoc.data();
          if (memberData.userId) {
            const userRef = admin
              .firestore()
              .collection("users")
              .doc(memberData.userId);
            deletePromises.push(
              userRef
                .update({
                  joinedCircles: admin.firestore.FieldValue.arrayRemove(
                    doc.id
                  ),
                })
                .catch((error) => {
                  console.error(
                    `Error removing circle from user ${memberData.userId}:`,
                    error
                  );
                })
            );
          }
        }
      }

      // Execute batch delete
      await batch.commit();
      await Promise.all(deletePromises);

      console.log(
        `Successfully deleted ${snapshot.size} expired flash circles.`
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
                `Poll ${pollDoc.id} ${pollType} has no options, skipping.`
              );
              updatePromises.push(
                pollDoc.ref.update({
                  [`${pollKey}.status`]: "closed",
                  [`${pollKey}.winningOption`]: null,
                })
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
                if (voteCounts.hasOwnProperty(vote)) {
                  voteCounts[vote]++;
                }
              });
            }

            let maxVotes = -1;
            let winningOptions = [];

            for (const optionText in voteCounts) {
              const votes = voteCounts[optionText];
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
              `Winning option: ${winningOptionText}`
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

exports.uploadProfileImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can upload images."
    );
  }

  const userId = context.auth.uid;
  const imageBase64 = data.image; // Base64 encoded image string
  const imageType = data.type; // 'avatar' or 'cover'

  if (!imageBase64 || !imageType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Image data and type are required."
    );
  }

  if (imageType !== "avatar" && imageType !== "cover") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'Invalid image type. Must be "avatar" or "cover".'
    );
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      {
        folder: `users/${userId}/profile`,
        public_id: imageType,
        overwrite: true,
      }
    );

    const imageUrl = uploadResult.secure_url;

    // Update Firestore user profile
    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.set(
      {
        [imageType === "avatar" ? "avatarPhoto" : "coverPhoto"]: imageUrl,
      },
      { merge: true }
    );

    return { success: true, imageUrl: imageUrl };
  } catch (error) {
    console.error("Error uploading image or updating Firestore:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to upload image or update profile.",
      error.message
    );
  }
});

exports.deleteProfileImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can delete images."
    );
  }

  const userId = context.auth.uid;
  const imageType = data.type; // 'avatar' or 'cover'

  if (!imageType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Image type is required."
    );
  }

  if (imageType !== "avatar" && imageType !== "cover") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'Invalid image type. Must be "avatar" or "cover".'
    );
  }

  try {
    const publicId = `users/${userId}/profile/${imageType}`;
    await cloudinary.uploader.destroy(publicId);

    // Update Firestore user profile to remove the image URL
    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.update({
      [imageType === "avatar" ? "avatarPhoto" : "coverPhoto"]:
        admin.firestore.FieldValue.delete(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting image or updating Firestore:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete image or update profile.",
      error.message
    );
  }
});

// Submit a join request for a circle
exports.submitJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can submit join requests."
    );
  }

  const userId = context.auth.uid;
  const { circleId } = data;

  if (!circleId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Circle ID is required."
    );
  }

  try {
    // Check if user is already a member
    const memberRef = admin
      .firestore()
      .collection("circles")
      .doc(circleId)
      .collection("members")
      .doc(userId);
    const memberDoc = await memberRef.get();

    if (memberDoc.exists()) {
      throw new functions.https.HttpsError(
        "already-exists",
        "User is already a member of this circle."
      );
    }

    // Check if join request already exists
    const requestRef = admin
      .firestore()
      .collection("circles")
      .doc(circleId)
      .collection("joinRequests")
      .doc(userId);
    const requestDoc = await requestRef.get();

    if (requestDoc.exists()) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Join request already submitted."
      );
    }

    // Get user profile data
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    let userData = {};
    if (userDoc.exists()) {
      userData = userDoc.data();
    }

    // Create join request
    await requestRef.set({
      userId: userId,
      email: userData.email || "",
      username: userData.username || "Unknown User",
      photoURL: userData.avatarPhoto || "",
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending",
    });

    return { success: true, message: "Join request submitted successfully." };
  } catch (error) {
    console.error("Error submitting join request:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to submit join request."
    );
  }
});

// Approve or deny a join request
exports.handleJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can handle join requests."
    );
  }

  const adminUserId = context.auth.uid;
  const { circleId, requestUserId, action } = data;

  if (!circleId || !requestUserId || !action) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Circle ID, request user ID, and action are required."
    );
  }

  if (action !== "approve" && action !== "deny") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'Action must be "approve" or "deny".'
    );
  }

  try {
    // Check if current user is admin of the circle
    const adminMemberRef = admin
      .firestore()
      .collection("circles")
      .doc(circleId)
      .collection("members")
      .doc(adminUserId);
    const adminMemberDoc = await adminMemberRef.get();

    if (!adminMemberDoc.exists() || !adminMemberDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only circle admins can handle join requests."
      );
    }

    // Get the join request
    const requestRef = admin
      .firestore()
      .collection("circles")
      .doc(circleId)
      .collection("joinRequests")
      .doc(requestUserId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists()) {
      throw new functions.https.HttpsError(
        "not-found",
        "Join request not found."
      );
    }

    const requestData = requestDoc.data();

    if (action === "approve") {
      // Add user as member
      const memberRef = admin
        .firestore()
        .collection("circles")
        .doc(circleId)
        .collection("members")
        .doc(requestUserId);
      await memberRef.set({
        email: requestData.email || "",
        isAdmin: false,
        photoURL: requestData.photoURL || "",
        username: requestData.username || "Unknown User",
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: requestUserId,
      });

      // Update request status
      await requestRef.update({
        status: "approved",
        handledBy: adminUserId,
        handledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Join request approved successfully." };
    } else {
      // Update request status to denied
      await requestRef.update({
        status: "denied",
        handledBy: adminUserId,
        handledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Join request denied successfully." };
    }
  } catch (error) {
    console.error("Error handling join request:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to handle join request."
    );
  }
});

// Bulk approve or deny join requests
exports.bulkHandleJoinRequests = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Only authenticated users can handle join requests."
      );
    }

    const adminUserId = context.auth.uid;
    const { circleId, action } = data;

    if (!circleId || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Circle ID and action are required."
      );
    }

    if (action !== "approve_all" && action !== "deny_all") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        'Action must be "approve_all" or "deny_all".'
      );
    }

    try {
      // Check if current user is admin of the circle
      const adminMemberRef = admin
        .firestore()
        .collection("circles")
        .doc(circleId)
        .collection("members")
        .doc(adminUserId);
      const adminMemberDoc = await adminMemberRef.get();

      if (!adminMemberDoc.exists() || !adminMemberDoc.data().isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Only circle admins can handle join requests."
        );
      }

      // Get all pending join requests
      const requestsRef = admin
        .firestore()
        .collection("circles")
        .doc(circleId)
        .collection("joinRequests");
      const pendingRequestsSnapshot = await requestsRef
        .where("status", "==", "pending")
        .get();

      if (pendingRequestsSnapshot.empty) {
        return {
          success: true,
          message: "No pending join requests found.",
          processedCount: 0,
        };
      }

      const batch = admin.firestore().batch();
      let processedCount = 0;

      for (const requestDoc of pendingRequestsSnapshot.docs) {
        const requestData = requestDoc.data();
        const requestUserId = requestDoc.id;

        if (action === "approve_all") {
          // Add user as member
          const memberRef = admin
            .firestore()
            .collection("circles")
            .doc(circleId)
            .collection("members")
            .doc(requestUserId);
          batch.set(memberRef, {
            email: requestData.email || "",
            isAdmin: false,
            photoURL: requestData.photoURL || "",
            username: requestData.username || "Unknown User",
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            userId: requestUserId,
          });

          // Update request status
          batch.update(requestDoc.ref, {
            status: "approved",
            handledBy: adminUserId,
            handledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          // Update request status to denied
          batch.update(requestDoc.ref, {
            status: "denied",
            handledBy: adminUserId,
            handledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        processedCount++;
      }

      await batch.commit();

      const actionText = action === "approve_all" ? "approved" : "denied";
      return {
        success: true,
        message: `${processedCount} join requests ${actionText} successfully.`,
        processedCount,
      };
    } catch (error) {
      console.error("Error bulk handling join requests:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to bulk handle join requests."
      );
    }
  }
);

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
      // Get creator's profile data
      const userRef = admin.firestore().collection("users").doc(creatorId);
      const userDoc = await userRef.get();

      let userData = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      // Create the creator as the first member in the members subcollection
      const memberRef = admin
        .firestore()
        .collection("circles")
        .doc(circleId)
        .collection("members")
        .doc(creatorId);

      await memberRef.set({
        email: userData.email || "",
        isAdmin: true,
        photoURL: userData.avatarPhoto || "",
        username: userData.username || "Unknown User",
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: creatorId,
      });

      console.log(
        `Creator ${creatorId} added as admin member to circle ${circleId}`
      );
    } catch (error) {
      console.error("Error creating initial circle member:", error);
    }
  });