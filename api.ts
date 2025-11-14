
// FIX: Use firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import { db, auth, storage, googleProvider } from './firebase';
import { User, WaterRequest, Message, RequestStatus, Review } from './types';

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

// --- TYPES and HELPERS ---
type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
const Timestamp = firebase.firestore.Timestamp;
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
type UserCredential = firebase.auth.UserCredential;


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
        data.address = data.address || { street: '', number: '', postalCode: '', city: '', country: '' };
        data.maintenance = data.maintenance || { lastFilterChange: '', lastECleaning: '' };
        
        // Perform a deep merge for availability to ensure all days and their properties exist
        const mergedAvailability = { ...defaultAvailability };
        if (data.availability && typeof data.availability === 'object') {
            for (const day of Object.keys(mergedAvailability)) {
                if (data.availability[day]) {
                    mergedAvailability[day] = { ...mergedAvailability[day], ...data.availability[day] };
                }
            }
        }
        data.availability = mergedAvailability;
    }

    return { id: docSnap.id, ...data } as T;
};


// --- AUTH API ---

export const loginWithEmail = (email: string, password: string): Promise<UserCredential> =>
    auth.signInWithEmailAndPassword(email, password);

export const loginWithGoogle = (): Promise<UserCredential> => {
    return auth.signInWithPopup(googleProvider);
};

export const signUpWithEmail = (email: string, password: string): Promise<UserCredential> =>
    auth.createUserWithEmailAndPassword(email, password);

export const logout = (): Promise<void> => auth.signOut();


// --- USER API ---

export const getUserById = async (id: string): Promise<User | null> => {
    const userDocSnap = await db.collection('users').doc(id).get();
    return userDocSnap.exists ? fromDoc<User>(userDocSnap) : null;
};

export const getHosts = async (): Promise<User[]> => {
    const q = db.collection('users').where('isHost', '==', true);
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(d => fromDoc<User>(d));
};

export const createInitialUser = (uid: string, email: string, name: string, profilePicture: string): Promise<void> => {
    const newUser: Omit<User, 'id'> = {
        email, name, profilePicture, isHost: false, phone: '',
        address: { street: '', number: '', postalCode: '', city: '', country: '' },
        rating: 0, reviews: 0, phLevels: [], availability: defaultAvailability,
        maintenance: { lastFilterChange: '', lastECleaning: '' }, isVerified: false,
        followers: [], following: [],
    };
    return db.collection('users').doc(uid).set(newUser);
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    return db.collection('users').doc(userId).update(updates);
};

export const uploadProfilePicture = async (userId: string, base64: string): Promise<string> => {
    const storageRef = storage.ref(`profilePictures/${userId}`);
    await storageRef.putString(base64, 'data_url');
    return storageRef.getDownloadURL();
};

export const toggleFollowHost = async (currentUserId: string, targetHostId: string): Promise<void> => {
    const currentUserRef = db.collection('users').doc(currentUserId);
    const targetHostRef = db.collection('users').doc(targetHostId);
    
    const currentUserDoc = await currentUserRef.get();
    const isFollowing = currentUserDoc.data()?.following?.includes(targetHostId);

    const batch = db.batch();
    if (isFollowing) {
        batch.update(currentUserRef, { following: arrayRemove(targetHostId) });
        batch.update(targetHostRef, { followers: arrayRemove(currentUserId) });
    } else {
        batch.update(currentUserRef, { following: arrayUnion(targetHostId) });
        batch.update(targetHostRef, { followers: arrayUnion(currentUserId) });
    }
    return batch.commit();
};


// --- REQUESTS API ---

export const getRequestsByUserId = async (userId: string): Promise<WaterRequest[]> => {
    const q = db.collection('requests').where('requesterId', '==', userId).where('status', '!=', 'chatting');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
};

export const getRequestsByHostId = async (hostId: string): Promise<WaterRequest[]> => {
    const q = db.collection('requests').where('hostId', '==', hostId).where('status', '!=', 'chatting');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
};

export const getRequestById = async (id: string): Promise<WaterRequest | null> => {
    const reqDocSnap = await db.collection('requests').doc(id).get();
    return reqDocSnap.exists ? fromDoc<WaterRequest>(reqDocSnap) : null;
};

export const createRequest = async (newRequestData: Omit<WaterRequest, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await db.collection('requests').add({
        ...newRequestData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateRequestStatus = (requestId: string, newStatus: RequestStatus): Promise<void> => {
    return db.collection('requests').doc(requestId).update({ status: newStatus });
};

export const createNewChat = async (hostId: string, requesterId: string, host: User, requester: User): Promise<string> => {
    const newChatRequest: Omit<WaterRequest, 'id' | 'createdAt'> = {
        requesterId, hostId, status: 'chatting', phLevel: 0, liters: 0,
        pickupDate: '', pickupTime: '', notes: '',
        requesterName: requester.name, requesterImage: requester.profilePicture,
        hostName: host.name, hostImage: host.profilePicture,
    };
    const docRef = await db.collection('requests').add({
        ...newChatRequest,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};


// --- MESSAGES API ---

export const getMessagesStream = (requestId: string, callback: (messages: Message[]) => void): (() => void) => {
    const q = db.collection(`requests/${requestId}/messages`).orderBy('timestamp', 'asc');
    return q.onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(d => fromDoc<Message>(d));
        callback(messages);
    });
};

export const sendMessage = (requestId: string, text: string, senderId: string): Promise<any> => {
    return db.collection(`requests/${requestId}/messages`).add({
        text,
        sender: senderId,
        timestamp: serverTimestamp(),
    });
};

export const getConversationsByUserId = async (userId: string): Promise<WaterRequest[]> => {
    // FIX: Firebase v8 does not support `or` queries. Performing two separate queries and merging the results.
    const requesterQuery = db.collection('requests')
        .where('requesterId', '==', userId)
        .where('status', 'in', ['accepted', 'completed', 'chatting']);
    const hostQuery = db.collection('requests')
        .where('hostId', '==', userId)
        .where('status', 'in', ['accepted', 'completed', 'chatting']);

    const [requesterSnapshot, hostSnapshot] = await Promise.all([
        requesterQuery.get(),
        hostQuery.get(),
    ]);

    const convos: { [id: string]: WaterRequest } = {};
    requesterSnapshot.docs.forEach(d => {
        convos[d.id] = fromDoc<WaterRequest>(d);
    });
    hostSnapshot.docs.forEach(d => {
        convos[d.id] = fromDoc<WaterRequest>(d);
    });
    
    return Object.values(convos).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// --- REVIEWS API ---

export const getReviewsForHost = async (hostId: string): Promise<Review[]> => {
    const q = db.collection(`users/${hostId}/reviews`).orderBy('date', 'desc');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(d => fromDoc<Review>(d));
}

export const addReview = async (hostId: string, review: Omit<Review, 'id'>): Promise<void> => {
    const hostRef = db.collection('users').doc(hostId);
    const reviewCollRef = db.collection(`users/${hostId}/reviews`);

    return db.runTransaction(async (transaction) => {
        const hostDoc = await transaction.get(hostRef);
        if (!hostDoc.exists) {
            throw "Host does not exist!";
        }
        
        const hostData = hostDoc.data() as User;
        const oldRatingTotal = hostData.rating * hostData.reviews;
        const newReviewsCount = hostData.reviews + 1;
        const newAverageRating = (oldRatingTotal + review.rating) / newReviewsCount;

        transaction.update(hostRef, {
            reviews: newReviewsCount,
            rating: newAverageRating
        });
        
        transaction.set(reviewCollRef.doc(), review);
    });
};

// --- ADMIN API ---

export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await db.collection('users').get();
    return querySnapshot.docs.map(d => fromDoc<User>(d));
};

export const getAllRequests = async (): Promise<WaterRequest[]> => {
    const querySnapshot = await db.collection('requests').get();
    return querySnapshot.docs.map(d => fromDoc<WaterRequest>(d));
};

export const toggleHostVerification = (hostId: string, isVerified: boolean): Promise<void> => {
    return db.collection('users').doc(hostId).update({ isVerified: !isVerified });
};
