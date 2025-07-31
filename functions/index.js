const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
    const now = admin.firestore.Timestamp.now();
    const pollsRef = admin.firestore().collection('polls');

    const snapshot = await pollsRef
        .where('deadline', '<=', now)
        .where('status', '==', 'active') // Only process active polls
        .get();

    const updatePromises = [];
    snapshot.forEach(async (doc) => {
        const pollData = doc.data();
        const options = pollData.options;

        if (!options || options.length === 0) {
            console.log(`Poll ${doc.id} has no options, skipping.`);
            updatePromises.push(doc.ref.update({ status: 'closed', winningOption: null }));
            return;
        }

        // Calculate votes for each option
        const voteCounts = {};
        options.forEach(option => {
            voteCounts[option.text] = option.votes || 0;
        });

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

        console.log(`Poll ${doc.id} expired. Winning option: ${winningOptionText}`);
        updatePromises.push(doc.ref.update({ status: 'closed', winningOption: winningOptionText }));
    });

    await Promise.all(updatePromises);
    console.log('Expired polls processed successfully.');
    return null;
});