export function useOnlinePresenceContext() {
    return {
        onlineUsers: {},
        isUserOnline: () => false,
        getUserLastSeen: () => null
    };
}

export default useOnlinePresenceContext;