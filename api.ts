import { GoogleGenAI } from "@google/genai";
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
    const isFollowing = currentUserDoc.data()?.following?.includes(targetHostId);

    const batch = writeBatch(db);
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
    return docRef.id;
};

export const updateRequestStatus = (requestId: string, newStatus: RequestStatus): Promise<void> => {
    const reqDocRef = doc(db, 'requests', requestId);
    return updateDoc(reqDocRef, { status: newStatus });
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
    return onSnapshot(q, querySnapshot => {
        const messages = querySnapshot.docs.map(d => fromDoc<Message>(d));
        callback(messages);
    });
};

export const sendMessage = (requestId: string, text: string, senderId: string): Promise<any> => {
    const messagesRef = collection(db, `requests/${requestId}/messages`);
    return addDoc(messagesRef, {
        text,
        sender: senderId,
        timestamp: serverTimestamp(),
    });
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

export const addReview = async (hostId: string, review: Omit<Review, 'id'>): Promise<void> => {
    const hostRef = doc(db, 'users', hostId);
    const reviewCollRef = collection(db, `users/${hostId}/reviews`);

    return runTransaction(db, async (transaction) => {
        const hostDoc = await transaction.get(hostRef);
        if (!hostDoc.exists()) {
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
        
        transaction.set(doc(reviewCollRef), review);
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

// --- GEMINI API ---

export const generateHostSummary = async (host: User, reviews: Review[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const reviewTexts = reviews.map(r => `- "${r.comment}" (Rating: ${r.rating}/5)`).join('\n');
    
    const availableDaysText = Object.entries(host.availability)
        .filter(([, details]) => details.enabled)
        .map(([day, details]) => `${day}: ${details.startTime} - ${details.endTime}`)
        .join(', ');

    const prompt = `
        Based on the following information about a Kangen water host, generate a warm, friendly, and concise summary (about 2-3 sentences) for a traveler. The summary should be encouraging and highlight the host's best qualities.

        Host Information:
        - Name: ${host.name}
        - Location: ${host.address.city}
        - Average Rating: ${host.rating.toFixed(1)} out of 5 stars
        - Total Reviews: ${host.reviews}
        - Available Water pH Levels: ${host.phLevels.join(', ')}
        - Weekly Availability: ${availableDaysText || 'Not specified'}

        Guest Reviews:
        ${reviewTexts || 'No reviews yet.'}

        Generate the summary now.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI summary:", error);
        return "Sorry, I couldn't generate a summary at this time. Please try again later.";
    }
};