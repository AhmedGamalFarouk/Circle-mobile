// Voice Message Feature Test Utility
// Use this to test the voice message functionality

import { Audio } from 'expo-av';
import { uploadAudioToCloudinary } from './cloudinaryUpload';

export const testVoiceMessageFeature = async () => {
    const results = {
        permissions: false,
        recording: false,
        cloudinaryUpload: false,
        playback: false,
        errors: [],
    };

    try {
        // Test 1: Check audio permissions
        console.log('Testing audio permissions...');
        const { status } = await Audio.requestPermissionsAsync();
        results.permissions = status === 'granted';
        if (!results.permissions) {
            results.errors.push('Microphone permission not granted');
        }

        // Test 2: Test recording capability
        console.log('Testing recording capability...');
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            // Record for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            results.recording = !!uri;

            if (uri) {
                // Test 3: Test Cloudinary upload
                console.log('Testing Cloudinary upload...');
                try {
                    const cloudinaryResult = await uploadAudioToCloudinary(uri);
                    results.cloudinaryUpload = cloudinaryResult.success;
                    if (!cloudinaryResult.success) {
                        results.errors.push(`Cloudinary upload failed: ${cloudinaryResult.error}`);
                    }
                } catch (error) {
                    results.errors.push(`Cloudinary upload error: ${error.message}`);
                }

                // Test 4: Test playback
                console.log('Testing playback...');
                try {
                    const { sound } = await Audio.Sound.createAsync({ uri });
                    await sound.playAsync();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await sound.stopAsync();
                    await sound.unloadAsync();
                    results.playback = true;
                } catch (error) {
                    results.errors.push(`Playback error: ${error.message}`);
                }
            }
        } catch (error) {
            results.errors.push(`Recording error: ${error.message}`);
        }

    } catch (error) {
        results.errors.push(`General error: ${error.message}`);
    }

    return results;
};

export const printTestResults = (results) => {
    console.log('\n=== Voice Message Feature Test Results ===');
    console.log(`✅ Permissions: ${results.permissions ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Recording: ${results.recording ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Cloudinary Upload: ${results.cloudinaryUpload ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Playback: ${results.playback ? 'PASS' : 'FAIL'}`);

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }

    const passCount = Object.values(results).filter(v => v === true).length;
    const totalTests = 4;
    console.log(`\n📊 Overall: ${passCount}/${totalTests} tests passed`);

    if (passCount === totalTests) {
        console.log('🎉 All tests passed! Voice message feature is ready to use.');
    } else {
        console.log('⚠️  Some tests failed. Check the errors above and your configuration.');
    }
};

// Usage example:
// import { testVoiceMessageFeature, printTestResults } from './src/utils/voiceMessageTest';
//
// const runTest = async () => {
//     const results = await testVoiceMessageFeature();
//     printTestResults(results);
// };