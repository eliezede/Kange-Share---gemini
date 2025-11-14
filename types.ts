export interface Review {
  id: string; // Firestore doc ID
  reviewerId: string;
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  comment: string;
  date: string; // ISO String
}

// A unified type for all users. Any user can become a host.
export interface User {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  profilePicture: string; // URL from Firebase Storage
  phone: string;

  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
  
  isHost: boolean;

  // Host-specific fields
  rating: number;
  reviews: number;
  phLevels: number[];
  availability: Record<string, { enabled: boolean; startTime: string; endTime: string; }>;
  maintenance: {
    lastFilterChange: string;
    lastECleaning: string;
  };
  isVerified: boolean;
  
  // Social fields
  followers: string[]; // array of user UIDs
  following: string[]; // array of user UIDs
}

export interface Message {
  id: string; // Firestore doc ID
  text: string;
  sender: string; // user UID
  timestamp: string; // ISO String
}

export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'declined' | 'chatting';

export interface WaterRequest {
  id: string; // Firestore doc ID
  requesterId: string;
  hostId: string;
  status: RequestStatus;
  phLevel: number;
  liters: number;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  notes: string;
  createdAt: string; // ISO String

  // Denormalized data for easier display
  requesterName: string;
  requesterImage: string;
  hostName: string;
  hostImage: string;
}
