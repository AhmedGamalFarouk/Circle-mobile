import { useCallback, useEffect, useRef, useState } from 'react';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// Ids of the circles the user is a member of, from their member docs
// (circles/{id}/members/*, userId == uid). users.joinedCircles misses circles the
// web adds you to, so it is not used here.
const useJoinedCircleIds = (uid) => {
    const [state, setState] = useState({ ids: [], loaded: false, error: null });
    const requestRef = useRef(0);

    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        if (!uid) {
            setState({ ids: [], loaded: true, error: null });
            return;
        }
        try {
            const snap = await getDocs(query(collectionGroup(db, 'members'), where('userId', '==', uid)));
            const ids = snap.docs.map((d) => d.ref.parent.parent.id);
            if (request === requestRef.current) setState({ ids, loaded: true, error: null });
        } catch (error) {
            console.error('Error loading joined circles:', error);
            if (request === requestRef.current) setState((s) => ({ ...s, loaded: true, error }));
        }
    }, [uid]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { ...state, refresh };
};

export default useJoinedCircleIds;
