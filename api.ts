import { MOCK_HOSTS, MOCK_CURRENT_USER, MOCK_REQUESTS, MOCK_CONVERSATIONS } from './data';
import { Host, User, WaterRequest, Message, RequestStatus } from './types';

const NETWORK_LATENCY = 500; // ms

function simulateNetwork<T>(data: T): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data))); // Deep copy to prevent mutation
        }, NETWORK_LATENCY);
    });
}

// --- HOSTS API ---
export const getHosts = (): Promise<Host[]> => simulateNetwork(MOCK_HOSTS);

export const getHostById = (id: string): Promise<Host | undefined> => {
    const host = MOCK_HOSTS.find(h => h.id === id);
    return simulateNetwork(host);
};

export const toggleHostVerification = (hostId: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const hostIndex = MOCK_HOSTS.findIndex(h => h.id === hostId);
            if (hostIndex !== -1) {
                MOCK_HOSTS[hostIndex].isVerified = !MOCK_HOSTS[hostIndex].isVerified;
                resolve(true);
            } else {
                resolve(false);
            }
        }, NETWORK_LATENCY);
    });
}

// --- USER API ---
export const getCurrentUser = (): Promise<User> => simulateNetwork(MOCK_CURRENT_USER);

export const getUserById = (id: string): Promise<User | Host | undefined> => {
    if (id === MOCK_CURRENT_USER.id) {
        return simulateNetwork(MOCK_CURRENT_USER);
    }
    const host = MOCK_HOSTS.find(h => h.id === id);
    return simulateNetwork(host);
};

export const updateCurrentUser = (updatedUser: User): Promise<User> => {
    // FIX: Cannot assign to MOCK_CURRENT_USER because it is an import.
    // Mutate the object in place using Object.assign instead of reassigning.
    Object.assign(MOCK_CURRENT_USER, updatedUser);
    return simulateNetwork(MOCK_CURRENT_USER);
};

export const toggleFollowHost = (hostId: string): Promise<boolean> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const isFollowing = MOCK_CURRENT_USER.following.includes(hostId);
            const host = MOCK_HOSTS.find(h => h.id === hostId);

            if (!host) {
                resolve(false);
                return;
            }

            if (isFollowing) {
                MOCK_CURRENT_USER.following = MOCK_CURRENT_USER.following.filter(id => id !== hostId);
                host.followers = host.followers.filter(id => id !== MOCK_CURRENT_USER.id);
            } else {
                MOCK_CURRENT_USER.following.push(hostId);
                host.followers.push(MOCK_CURRENT_USER.id);
            }
            resolve(true);
        }, NETWORK_LATENCY);
    });
}


// --- REQUESTS API ---
export const getAllRequests = (): Promise<WaterRequest[]> => simulateNetwork(MOCK_REQUESTS);

export const getRequestsByUserId = (userId: string): Promise<WaterRequest[]> => {
    const requests = MOCK_REQUESTS.filter(r => r.requesterId === userId && r.status !== 'chatting');
    return simulateNetwork(requests);
}

export const getRequestsByHostId = (hostId: string): Promise<WaterRequest[]> => {
    const requests = MOCK_REQUESTS.filter(r => r.hostId === hostId && r.status !== 'chatting');
    return simulateNetwork(requests);
}

export const getRequestById = (id: string): Promise<WaterRequest | undefined> => {
    const request = MOCK_REQUESTS.find(r => r.id === id);
    return simulateNetwork(request);
};

export const createRequest = (newRequestData: Omit<WaterRequest, 'id' | 'createdAt'>): Promise<WaterRequest> => {
    return new Promise(resolve => {
         setTimeout(() => {
            const newRequest: WaterRequest = {
                ...newRequestData,
                id: `req_${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            MOCK_REQUESTS.unshift(newRequest);
            resolve(newRequest);
        }, NETWORK_LATENCY);
    });
};

export const updateRequestStatus = (requestId: string, newStatus: RequestStatus): Promise<WaterRequest | undefined> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const requestIndex = MOCK_REQUESTS.findIndex(r => r.id === requestId);
            if (requestIndex !== -1) {
                MOCK_REQUESTS[requestIndex].status = newStatus;
                resolve(MOCK_REQUESTS[requestIndex]);
            } else {
                resolve(undefined);
            }
        }, NETWORK_LATENCY);
    });
};

export const createNewChat = (hostId: string, requesterId: string): Promise<WaterRequest> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newChatRequest: WaterRequest = {
                id: `chat_${requesterId}_${hostId}_${Date.now()}`,
                requesterId: requesterId,
                hostId: hostId,
                status: 'chatting',
                phLevel: 0,
                liters: 0,
                pickupDate: '',
                pickupTime: '',
                notes: '',
                createdAt: new Date().toISOString(),
            };
            MOCK_REQUESTS.unshift(newChatRequest);
            resolve(newChatRequest);
        }, NETWORK_LATENCY);
    });
};


// --- MESSAGES API ---
export const getMessages = (requestId: string): Promise<Message[]> => {
    const messages = MOCK_CONVERSATIONS[requestId] || [];
    return simulateNetwork(messages);
}

export const sendMessage = (requestId: string, text: string, sender: 'user' | 'host'): Promise<Message> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const newMessage: Message = {
                id: Date.now(),
                text,
                sender,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            };
            if (!MOCK_CONVERSATIONS[requestId]) {
                MOCK_CONVERSATIONS[requestId] = [];
            }
            MOCK_CONVERSATIONS[requestId].push(newMessage);
            resolve(newMessage);
        }, NETWORK_LATENCY);
    });
};

export const getConversationsByUserId = (userId: string): Promise<WaterRequest[]> => {
    const conversations = MOCK_REQUESTS.filter(r => 
        (r.requesterId === userId || r.hostId === userId) && 
        ['accepted', 'completed', 'chatting'].includes(r.status)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(conversations);
};
