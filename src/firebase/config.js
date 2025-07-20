import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    apiKey: "AIzaSyAW0f0DzBx3e769VkVdUimATL6-gnW4cTo",
    authDomain: "circle-26a87.firebaseapp.com",
    projectId: "circle-26a87",
    storageBucket: "circle-26a87.firebasestorage.app",
    messagingSenderId: "141731835688",
    appId: "1:141731835688:web:69bd763eeda258b0eb6a1d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
