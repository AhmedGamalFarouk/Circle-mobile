const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dwh8jhaot',
    api_key: '861252578513848',
    api_secret: 'CV8rI-ZMEMqmMoDV4koumd4GDIs'
});

exports.deleteExpiredFlashCircles = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const circlesRef = admin.firestore().collection('circles');

    const snapshot = await circlesRef
        .where('type', '==', 'flash')
        .where('expiryDate', '<=', now)
        .get();

    const deletePromises = [];
    snapshot.forEach(doc => {
        deletePromises.push(doc.ref.delete());
    });

    await Promise.all(deletePromises);
    console.log('Expired flash circles deleted successfully.');
    return null;
});

exports.processExpiredPolls = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
    const now = new Date();
    const circlesRef = admin.firestore().collection('circles');

    // Get all circles to check their polls
    const circlesSnapshot = await circlesRef.get();
    const updatePromises = [];

    for (const circleDoc of circlesSnapshot.docs) {
        const pollsRef = circleDoc.ref.collection('polls');
        const pollsSnapshot = await pollsRef.get();

        for (const pollDoc of pollsSnapshot.docs) {
            const pollData = pollDoc.data();

            // Check if poll has active activity or place polls with expired deadlines
            const processActivePoll = async (pollType, pollKey) => {
                const poll = pollData[pollKey];
                if (!poll || poll.status !== 'active') return;

                // Convert Firebase Timestamp deadline to Date for comparison
                const deadline = poll.deadline.toDate();
                if (deadline <= now) {
                    const options = poll.options;

                    if (!options || options.length === 0) {
                        console.log(`Poll ${pollDoc.id} ${pollType} has no options, skipping.`);
                        updatePromises.push(pollDoc.ref.update({
                            [`${pollKey}.status`]: 'closed',
                            [`${pollKey}.winningOption`]: null
                        }));
                        return;
                    }

                    // Calculate votes for each option using the votes object
                    const voteCounts = {};
                    options.forEach(option => {
                        voteCounts[option.text] = 0;
                    });

                    // Count votes from the votes object
                    if (poll.votes) {
                        Object.values(poll.votes).forEach(vote => {
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
                        winningOptionText = winningOptions[Math.floor(Math.random() * winningOptions.length)];
                    }

                    console.log(`Poll ${pollDoc.id} ${pollType} expired. Winning option: ${winningOptionText}`);

                    const updateData = {
                        [`${pollKey}.status`]: 'closed',
                        [`${pollKey}.winningOption`]: winningOptionText
                    };

                    // If this is an activity poll, also set the winning activity
                    if (pollType === 'activity') {
                        updateData.winningActivity = winningOptionText;
                    } else if (pollType === 'place') {
                        updateData.winningPlace = winningOptionText;
                    }

                    updatePromises.push(pollDoc.ref.update(updateData));
                }
            };

            // Process both activity and place polls
            await processActivePoll('activity', 'activityPoll');
            await processActivePoll('place', 'placePoll');
        }
    }

    await Promise.all(updatePromises);
    console.log('Expired polls processed successfully.');
    return null;
});

exports.uploadProfileImage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can upload images.');
    }

    const userId = context.auth.uid;
    const imageBase64 = data.image; // Base64 encoded image string
    const imageType = data.type; // 'avatar' or 'cover'

    if (!imageBase64 || !imageType) {
        throw new functions.https.HttpsError('invalid-argument', 'Image data and type are required.');
    }

    if (imageType !== 'avatar' && imageType !== 'cover') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid image type. Must be "avatar" or "cover".');
    }

    try {
        const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
            folder: `users/${userId}/profile`,
            public_id: imageType,
            overwrite: true
        });

        const imageUrl = uploadResult.secure_url;

        // Update Firestore user profile
        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.set({
            [imageType === 'avatar' ? 'avatarUrl' : 'coverUrl']: imageUrl
        }, { merge: true });

        return { success: true, imageUrl: imageUrl };

    } catch (error) {
        console.error("Error uploading image or updating Firestore:", error);
        throw new functions.https.HttpsError('internal', 'Failed to upload image or update profile.', error.message);
    }
});

exports.deleteProfileImage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can delete images.');
    }

    const userId = context.auth.uid;
    const imageType = data.type; // 'avatar' or 'cover'

    if (!imageType) {
        throw new functions.https.HttpsError('invalid-argument', 'Image type is required.');
    }

    if (imageType !== 'avatar' && imageType !== 'cover') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid image type. Must be "avatar" or "cover".');
    }

    try {
        const publicId = `users/${userId}/profile/${imageType}`;
        await cloudinary.uploader.destroy(publicId);

        // Update Firestore user profile to remove the image URL
        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.update({
            [imageType === 'avatar' ? 'avatarUrl' : 'coverUrl']: admin.firestore.FieldValue.delete()
        });

        return { success: true };

    } catch (error) {
        console.error("Error deleting image or updating Firestore:", error);
        throw new functions.https.HttpsError('internal', 'Failed to delete image or update profile.', error.message);
    }
});