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