import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAW0f0DzBx3e769VkVdUimATL6-gnW4cTo",
    authDomain: "circle-26a87.firebaseapp.com",
    projectId: "circle-26a87",
    storageBucket: "circle-26a87.firebasestorage.app",
    messagingSenderId: "141731835688",
    appId: "1:141731835688:web:69bd763eeda258b0eb6a1d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (error) {
    if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
    } else {
        throw error;
    }
}

const db = getFirestore(app);

export { auth, db };



//=============================================
