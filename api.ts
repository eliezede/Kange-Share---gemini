import { db, auth, storage, googleProvider } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove,
    runTransaction,
    addDoc,
    writeBatch,
    DocumentSnapshot,
    QuerySnapshot
} from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signOut,
    UserCredential
} from 'firebase/auth';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { User, WaterRequest, Message, RequestStatus, Review, Notification, NotificationType } from './types';

// Placed at the top for reuse
const defaultAvailability = {
  'Monday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Tuesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Wednesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Thursday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Friday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Saturday': { enabled: false, startTime: '10:00', endTime: '14:00' },
  'Sunday': { enabled: false, startTime: '10:00', endTime: '14:00' },
};

// --- DATA TRANSFORMATION UTILS ---

// Converts Firestore document snapshot to a typed object
const fromDoc = <T>(docSnap: DocumentSnapshot): T => {
    const data = docSnap.data() as Record<string, any>;
    // Convert all Timestamps to ISO strings
    Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    });

    // Ensure array and object properties exist on User objects to prevent runtime errors
    // if they are missing from the Firestore document.
    if (docSnap.ref.parent.id === 'users') {
        data.followers = data.followers || [];
        data.following = data.following || [];
        data.phLevels = data.phLevels || [];
        data.phone = data.phone || '';
        data.bio = data.bio || '';

        const defaultAddress = { street: '', number: '', postalCode: '', city: '', country: '' };
        // FIX: More robust merge to prevent crashes if `data.address` is not a valid object.
        data.address = (data.address && typeof data.address === 'object')
            ? { ...defaultAddress, ...data.address }
            : defaultAddress;

        const defaultMaintenance = { lastFilterChange: '', lastECleaning: '' };
        // FIX: More robust merge for maintenance.
        data.maintenance = (data.maintenance && typeof data.maintenance === 'object')
            ? { ...defaultMaintenance, ...data.maintenance }
            : defaultMaintenance;
        
        // FIX: Perform a true deep merge for availability to ensure all days and their properties exist,
        // preventing crashes if data is malformed (e.g., a day is `true` instead of an object).
        const mergedAvailability: Record<string, { enabled: boolean; startTime: string; endTime: string; }> = {};
        for (const day of Object.keys(defaultAvailability)) {
            const defaultDayData = defaultAvailability[day];
            const userDayData = (data.availability && typeof data.availability === 'object' && data.availability[day] && typeof data.availability[day] === 'object')
                ? data.availability[day]
                : {};
            mergedAvailability[day] = { ...defaultDayData, ...userDayData };
        }
        data.availability = mergedAvailability;
    }

    return { id: docSnap.id, ...data } as T;
};


// --- AUTH API ---

export const loginWithEmail = (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = (): Promise<UserCredential> =>
    signInWithPopup(auth, googleProvider);

export const signUpWithEmail = (email: string, password: string): Promise<UserCredential> =>
    createUserWithEmailAndPassword(auth, email, password);

export const logout = (): Promise<void> => signOut(auth);


// --- USER API ---

export const getUserById = async (id: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', id);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? fromDoc<User>(userDocSnap) : null;
};

export const getHosts = async (): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isHost', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => fromDoc<User>(d));
};

export const createInitialUser = (uid: string, email: string, name: string, profilePicture: string): Promise<void> => {
    const newUser: Omit<User, 'id'> = {
        email, name, profilePicture, isHost: false, phone: '',
        bio: '',
        address: { street: '', number: '', postalCode: '', city: '', country: '' },
        rating: 0, reviews: 0, phLevels: [], availability: defaultAvailability,
        maintenance: { lastFilterChange: '', lastECleaning: '' }, isVerified: false,
        followers: [], following: [],
    };
    const userDocRef = doc(db, 'users', uid);
    return setDoc(userDocRef, newUser);
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    return updateDoc(userDocRef, updates);
};

export const uploadProfilePicture = async (userId: string, blob: Blob): Promise<string> => {
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
};

export const toggleFollowHost = async (currentUserId: string, targetHostId: string): Promise<void> => {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetHostRef = doc(db, 'users', targetHostId);
    
    const currentUserDoc = await getDoc(currentUserRef);
    const isFollowing = (currentUserDoc.data() as User)?.following?.includes(targetHostId);

    const batch = writeBatch(db);
    if (isFollowing) {
        batch.update(currentUserRef, { following: arrayRemove(targetHostId) });
        batch.update(targetHostRef, { followers: arrayRemove(currentUserId) });
    } else {
        batch.update(currentUserRef, { following: arrayUnion(targetHostId) });
        batch.update(targetHostRef, { followers: arrayUnion(currentUserId) });
        
        const follower = currentUserDoc.data() as User;
        if(follower) {
             createNotification(targetHostId, {
                type: 'new_follower',
                relatedId: currentUserId,
                text: `${follower.name} started following you.`,
                senderId: currentUserId,
                senderName: follower.name,
                senderImage: follower.profilePicture
            });
        }
    }
    return batch.commit();
};


// --- REQUESTS API ---

export const getRequestsByUserId = async (userId: string): Promise<WaterRequest[]> => {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, where('requesterId', '==', userId));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
    // Filter client-side to avoid needing a composite index
    return requests.filter(r => r.status !== 'chatting');
};

export const getRequestsByHostId = async (hostId: string): Promise<WaterRequest[]> => {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, where('hostId', '==', hostId));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
    // Filter client-side to avoid needing a composite index
    return requests.filter(r => r.status !== 'chatting');
};

export const getRequestById = async (id: string): Promise<WaterRequest | null> => {
    const reqDocRef = doc(db, 'requests', id);
    const reqDocSnap = await getDoc(reqDocRef);
    return reqDocSnap.exists() ? fromDoc<WaterRequest>(reqDocSnap) : null;
};

export const createRequest = async (newRequestData: Omit<WaterRequest, 'id' | 'createdAt'>): Promise<string> => {
    const requestsRef = collection(db, 'requests');
    const docRef = await addDoc(requestsRef, {
        ...newRequestData,
        createdAt: serverTimestamp(),
    });

    createNotification(newRequestData.hostId, {
        type: 'new_request',
        relatedId: docRef.id,
        text: `${newRequestData.requesterName} sent you a water request.`,
        senderId: newRequestData.requesterId,
        senderName: newRequestData.requesterName,
        senderImage: newRequestData.requesterImage,
    });

    return docRef.id;
};

export const updateRequestStatus = async (requestId: string, newStatus: RequestStatus): Promise<void> => {
    const reqDocRef = doc(db, 'requests', requestId);
    await updateDoc(reqDocRef, { status: newStatus });

    const request = await getRequestById(requestId);
    if (!request) return;

    let notifText = '';
    let notifType: NotificationType | null = null;
    let recipientId = '';

    if (newStatus === 'accepted') {
        notifText = `${request.hostName} accepted your water request.`;
        notifType = 'request_accepted';
        recipientId = request.requesterId;
    } else if (newStatus === 'declined') {
        notifText = `${request.hostName} declined your water request.`;
        notifType = 'request_declined';
        recipientId = request.requesterId;
    } else if (newStatus === 'cancelled') {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === request.requesterId) {
            notifText = `${request.requesterName} cancelled their water request.`;
            notifType = 'request_cancelled';
            recipientId = request.hostId;
        }
    }
    
    if (notifType && notifText && recipientId) {
        createNotification(recipientId, {
            type: notifType,
            relatedId: requestId,
            text: notifText,
            senderId: newStatus === 'cancelled' ? request.requesterId : request.hostId,
            senderName: newStatus === 'cancelled' ? request.requesterName : request.hostName,
            senderImage: newStatus === 'cancelled' ? request.requesterImage : request.hostImage,
        });
    }
};

export const createNewChat = async (hostId: string, requesterId: string, host: User, requester: User): Promise<string> => {
    const newChatRequest: Omit<WaterRequest, 'id' | 'createdAt'> = {
        requesterId, hostId, status: 'chatting', phLevel: 0, liters: 0,
        pickupDate: '', pickupTime: '', notes: '',
        requesterName: requester.name, requesterImage: requester.profilePicture,
        hostName: host.name, hostImage: host.profilePicture,
    };
    const requestsRef = collection(db, 'requests');
    const docRef = await addDoc(requestsRef, {
        ...newChatRequest,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};


// --- MESSAGES API ---

export const getMessagesStream = (requestId: string, callback: (messages: Message[]) => void): (() => void) => {
    const messagesRef = collection(db, `requests/${requestId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
        const messages = querySnapshot.docs.map(d => fromDoc<Message>(d));
        callback(messages);
    });
};

export const sendMessage = async (requestId: string, text: string, senderId: string): Promise<any> => {
    const messagesRef = collection(db, `requests/${requestId}/messages`);
    const promise = addDoc(messagesRef, {
        text,
        sender: senderId,
        timestamp: serverTimestamp(),
    });

    const request = await getRequestById(requestId);
    const sender = await getUserById(senderId);
    if (request && sender) {
        const receiverId = senderId === request.hostId ? request.requesterId : request.hostId;
        createNotification(receiverId, {
            type: 'new_message',
            relatedId: requestId,
            text: `New message from ${sender.name}.`,
            senderId: senderId,
            senderName: sender.name,
            senderImage: sender.profilePicture,
        });
    }

    return promise;
};

export const getConversationsByUserId = async (userId: string): Promise<WaterRequest[]> => {
    const statusesForConvo = ['accepted', 'completed', 'chatting', 'pending'];
    const requestsRef = collection(db, 'requests');

    const requesterQuery = query(requestsRef, where('requesterId', '==', userId));
    const hostQuery = query(requestsRef, where('hostId', '==', userId));

    const [requesterSnapshot, hostSnapshot] = await Promise.all([
        getDocs(requesterQuery),
        getDocs(hostQuery),
    ]);

    const convos: { [id: string]: WaterRequest } = {};
    
    const processSnapshot = (snapshot: QuerySnapshot) => {
        snapshot.docs.forEach(d => {
            const req = fromDoc<WaterRequest>(d);
            if (statusesForConvo.includes(req.status)) {
                convos[d.id] = req;
            }
        });
    };

    processSnapshot(requesterSnapshot);
    processSnapshot(hostSnapshot);
    
    return Object.values(convos).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// --- REVIEWS API ---

export const getReviewsForHost = async (hostId: string): Promise<Review[]> => {
    const reviewsRef = collection(db, `users/${hostId}/reviews`);
    const q = query(reviewsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => fromDoc<Review>(d));
}

export const addReview = (hostId: string, review: Omit<Review, 'id'>): Promise<void> => {
    const hostRef = doc(db, 'users', hostId);
    const reviewCollRef = collection(db, `users/${hostId}/reviews`);

    return runTransaction(db, async (transaction) => {
        const hostDoc = await transaction.get(hostRef);
        if (!hostDoc.exists()) throw "Host does not exist!";
        
        const hostData = hostDoc.data() as User;
        const oldRatingTotal = hostData.rating * hostData.reviews;
        const newReviewsCount = hostData.reviews + 1;
        const newAverageRating = (oldRatingTotal + review.rating) / newReviewsCount;

        transaction.update(hostRef, {
            reviews: newReviewsCount,
            rating: newAverageRating
        });
        
        transaction.set(doc(reviewCollRef), review);
    }).then(() => {
        createNotification(hostId, {
            type: 'review_left',
            relatedId: hostId,
            text: `${review.reviewerName} left you a ${review.rating}-star review.`,
            senderId: review.reviewerId,
            senderName: review.reviewerName,
            senderImage: review.reviewerImage,
        });
    });
};


// --- NOTIFICATIONS API ---

export const createNotification = async (userId: string, notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (!userId) return;
    const notificationsRef = collection(db, `notifications/${userId}/items`);
    await addDoc(notificationsRef, {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
    });
};

export const getNotificationsStream = (userId: string, callback: (notifications: Notification[]) => void): (() => void) => {
    const notificationsRef = collection(db, `notifications/${userId}/items`);
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map(d => fromDoc<Notification>(d));
        callback(notifications);
    });
};

export const markNotificationAsRead = (userId: string, notificationId: string): Promise<void> => {
    const notificationRef = doc(db, `notifications/${userId}/items`, notificationId);
    return updateDoc(notificationRef, { read: true });
};

export const getPendingHostRequestsStream = (hostId: string, callback: (count: number) => void): (() => void) => {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, where('hostId', '==', hostId), where('status', '==', 'pending'));
    return onSnapshot(q, (querySnapshot) => {
        callback(querySnapshot.size);
    });
};

// --- ADMIN API ---

export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(d => fromDoc<User>(d));
};

export const getAllRequests = async (): Promise<WaterRequest[]> => {
    const querySnapshot = await getDocs(collection(db, 'requests'));
    return querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
};

export const toggleHostVerification = (hostId: string, isVerified: boolean): Promise<void> => {
    const hostRef = doc(db, 'users', hostId);
    return updateDoc(hostRef, { isVerified: !isVerified });
};

export const toggleHostStatus = (userId: string, isHost: boolean): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, { isHost: !isHost });
};