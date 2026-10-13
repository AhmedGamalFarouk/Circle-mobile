import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import DeleteAccountScreen from '../screens/Settings/DeleteAccountScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DynamicBottomTab from './DynamicBottomTab';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';
import EventConfirmation from '../screens/Circle/components/EventConfirmation/EventConfirmation';
import InviteMembers from '../screens/InviteMembers';
import LandingScreen from '../screens/LandingScreen';
import SignInScreen from '../screens/Auth Screens/Sign in/SignInScreen';
import SignUpScreen from '../screens/Auth Screens/Sign up/SignUpScreen';
import useAuth from '../hooks/useAuth';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();

// True when the signed-in user has no profile doc and a deletion is under way
// (its job doc exists) or the account is older than 2 minutes. Sign-up writes the
// profile just after creating the sign-in, so brand-new accounts get a grace period.
function useProfileGone(user) {
    const [gone, setGone] = useState(false);
    useEffect(() => {
        setGone(false);
        if (!user) return undefined;
        let cancelled = false;
        (async () => {
            try {
                if ((await getDoc(doc(db, 'users', user.uid))).exists()) return;
                const old = Date.now() - Date.parse(user.metadata?.creationTime || '') > 2 * 60 * 1000;
                const deleting = old || (await getDoc(doc(db, 'users', user.uid, 'private', 'deletionJob'))).exists();
                if (deleting && !cancelled) setGone(true);
            } catch {
                // Offline or denied: carry on with the app.
            }
        })();
        return () => { cancelled = true; };
    }, [user?.uid]);
    return gone;
}

export default function DynamicNativeStack() {
    const { user, loading } = useAuth();
    const profileGone = useProfileGone(user);

    if (loading) {
        return null; // Or a loading screen component
    }
    // A deletion stopped after removing the profile: finish it before anything else.
    if (user && profileGone) return <DeleteAccountScreen finish />;

    return (
        <Stack.Navigator initialRouteName={user ? "Main" : "Landing"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Main" component={DynamicBottomTab} />
            <Stack.Screen name="Circle" component={CircleScreen} />
            <Stack.Screen name="CreationForm" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
            <Stack.Screen name="CircleDetails" component={CircleDetailsScreen} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} />
            <Stack.Screen name="EventConfirmation" component={EventConfirmation} />
            <Stack.Screen name="InviteMembers" component={InviteMembers} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        </Stack.Navigator>
    );
}